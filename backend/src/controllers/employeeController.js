const db = require('../config/database');
const { validateCpf, getCepInfo, verifyCrmv } = require('../config/apis');

// Listar todos os colaboradores
const getAllEmployees = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT 
        e.id, e.full_name, e.cpf, e.contact_email, e.birth_date, e.hire_date, e.salary, e.position,
        e.is_veterinarian, e.crmv_number, e.crmv_state, e.crmv_status,
        e.street, e.neighborhood, e.city, e.state, e.zip_code,
        e.is_active, e.created_at,
        c.name as contract_name, c.version as contract_version,
        ep.phone_number as main_phone_number
      FROM employees e
      LEFT JOIN contracts c ON e.contract_id = c.id
      LEFT JOIN (
        SELECT 
          employee_id, 
          phone_number,
          ROW_NUMBER() OVER(PARTITION BY employee_id ORDER BY is_primary DESC, created_at ASC) as rn
        FROM employee_phones
      ) ep ON e.id = ep.employee_id AND ep.rn = 1
    `;

    const queryParams = [];

    if (status === 'inactive') {
      query += ' WHERE e.is_active = false';
    } else if (status === 'all') {
      // Nenhuma condição adicional de is_active, retorna todos
    } else {
      // Padrão: retorna apenas ativos
      query += ' WHERE e.is_active = true';
    }

    query += ' ORDER BY e.full_name';

    const result = await db.query(query, queryParams);

    res.json({ employees: result.rows });
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Buscar colaborador por ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar se o ID é um UUID válido
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ message: 'ID de colaborador inválido' });
    }

    const query = `
      SELECT 
        e.*, 
        c.name as contract_name, 
        c.version as contract_version,
        (SELECT json_agg(json_build_object('id', ep.id, 'phone_number', ep.phone_number, 'country_code', ep.country_code, 'is_primary', ep.is_primary))
         FROM employee_phones ep 
         WHERE ep.employee_id = e.id) as phones
      FROM employees e
      LEFT JOIN contracts c ON e.contract_id = c.id
      WHERE e.id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Colaborador não encontrado' });
    }

    // O campo phones virá como uma string JSON, então parseamos
    const employeeData = result.rows[0];
    if (employeeData.phones && typeof employeeData.phones === 'string') {
      try {
        employeeData.phones = JSON.parse(employeeData.phones);
      } catch (parseError) {
        console.error('Erro ao fazer parse dos telefones JSON:', parseError);
        employeeData.phones = []; // Define como array vazio em caso de erro de parse
      }
    } else if (!employeeData.phones) {
      employeeData.phones = []; // Garante que seja um array se não houver telefones
    }

    res.json({ employee: employeeData });
  } catch (error) {
    console.error('Erro ao buscar colaborador:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Criar novo colaborador
const createEmployee = async (req, res) => {
  const client = await db.pool.connect(); // CORREÇÃO: Usar db.pool.connect()
  try {
    await client.query('BEGIN'); // Iniciar transação

    const {
      full_name,
      cpf,
      contact_email,
      birth_date,
      zip_code,
      hire_date,
      salary,
      contract_id,
      bank_name,
      bank_agency,
      bank_account,
      pix_key,
      pix_key_type,
      is_veterinarian = false,
      crmv_number,
      crmv_state,
      phones, // Espera-se um array: [{ country_code, phone_number, is_primary }]
      position
    } = req.body;

    // Validações
    if (!full_name || !cpf || !birth_date || !zip_code || !hire_date || !salary) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    // Validar CPF
    if (!validateCpf(cpf)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'CPF inválido' });
    }

    // Verificar se CPF já existe
    const existingCpf = await client.query('SELECT id FROM employees WHERE cpf = $1', [cpf.replace(/\D/g, '')]);
    if (existingCpf.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'CPF já cadastrado' });
    }

    // Buscar informações do CEP
    let addressInfo;
    try {
      addressInfo = await getCepInfo(zip_code);
    } catch (error) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'CEP inválido ou não encontrado' });
    }

    // Verificar CRMV se for veterinário
    let crmvData = null;
    if (is_veterinarian && crmv_number && crmv_state) {
      try {
        crmvData = await verifyCrmv(crmv_number, crmv_state);
      } catch (error) {
        console.warn('Erro ao verificar CRMV:', error.message);
        // Não reverter a transação por erro de CRMV, apenas registrar
      }
    }

    // Inserir colaborador
    const insertEmployeeQuery = `
      INSERT INTO employees (
        full_name, cpf, contact_email, birth_date, zip_code, street, neighborhood, city, state, country,
        address_number, address_complement,
        hire_date, salary, contract_id, bank_name, bank_agency, bank_account, pix_key, pix_key_type,
        is_veterinarian, crmv_number, crmv_state, crmv_status, crmv_verified_at,
        position
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING id, full_name, cpf, contact_email, created_at
    `;

    const employeeValues = [
      full_name,
      cpf.replace(/\D/g, ''),
      contact_email,
      birth_date,
      addressInfo.zipCode,
      addressInfo.street,
      addressInfo.neighborhood,
      addressInfo.city,
      addressInfo.state,
      addressInfo.country,
      addressInfo.address_number,
      addressInfo.address_complement,
      hire_date,
      salary,
      contract_id || null,
      bank_name || null,
      bank_agency || null,
      bank_account || null,
      pix_key || null,
      pix_key_type || null,
      is_veterinarian,
      crmv_number || null,
      crmv_state || null,
      crmvData?.status || null,
      crmvData?.verifiedAt || null,
      position || null
    ];

    const employeeResult = await client.query(insertEmployeeQuery, employeeValues);
    const newEmployee = employeeResult.rows[0];
    const employeeId = newEmployee.id;

    // Inserir telefones
    if (phones && Array.isArray(phones) && phones.length > 0) {
      const insertPhoneQuery = 'INSERT INTO employee_phones (employee_id, country_code, phone_number, is_primary) VALUES ($1, $2, $3, $4)';
      for (const phone of phones) {
        if (phone.phone_number && phone.country_code) { // Validação básica, country_code agora é esperado
          await client.query(insertPhoneQuery, [
            employeeId,
            phone.country_code, // Adicionado
            phone.phone_number,
            typeof phone.is_primary === 'boolean' ? phone.is_primary : false
          ]);
        }
      }
    }

    // Log de acesso
    await client.query(
      'INSERT INTO access_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'create_employee', 'employee', employeeId]
    );

    await client.query('COMMIT'); // Confirmar transação

    res.status(201).json({
      message: 'Colaborador criado com sucesso',
      employee: newEmployee, // Retorna os dados do colaborador principal
      crmvVerification: crmvData
    });

  } catch (error) {
    await client.query('ROLLBACK'); // Reverter transação em caso de erro
    console.error('Erro ao criar colaborador:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  } finally {
    client.release(); // Liberar cliente de volta para o pool
  }
};

// Atualizar colaborador
const updateEmployee = async (req, res) => {
  const client = await db.pool.connect(); // CORREÇÃO: Usar db.pool.connect()
  try {
    await client.query('BEGIN'); // Iniciar transação
    const { id } = req.params;
    const { phones, ...updateData } = req.body; // Separar phones do resto dos dados

    // Verificar se colaborador existe
    const existingEmployee = await client.query('SELECT id FROM employees WHERE id = $1 AND is_active = true', [id]);
    if (existingEmployee.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Colaborador não encontrado' });
    }

    // Validar CPF se fornecido
    if (updateData.cpf && !validateCpf(updateData.cpf)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'CPF inválido' });
    }

    // Verificar se CPF já existe (exceto para o próprio colaborador)
    if (updateData.cpf) {
      const existingCpf = await client.query(
        'SELECT id FROM employees WHERE cpf = $1 AND id != $2',
        [updateData.cpf.replace(/\D/g, ''), id]
      );
      if (existingCpf.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'CPF já cadastrado para outro colaborador' });
      }
    }

    // Buscar informações do CEP se fornecido
    if (updateData.zip_code) {
      try {
        const addressInfo = await getCepInfo(updateData.zip_code);
        updateData.street = addressInfo.street;
        updateData.neighborhood = addressInfo.neighborhood;
        updateData.city = addressInfo.city;
        updateData.state = addressInfo.state;
        updateData.zip_code = addressInfo.zipCode;
      } catch (error) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'CEP inválido ou não encontrado' });
      }
    }

    // Verificar CRMV se for veterinário
    if (updateData.is_veterinarian && updateData.crmv_number && updateData.crmv_state) {
      try {
        const crmvData = await verifyCrmv(updateData.crmv_number, updateData.crmv_state);
        updateData.crmv_status = crmvData.status;
        updateData.crmv_verified_at = crmvData.verifiedAt;
      } catch (error) {
        console.warn('Erro ao verificar CRMV:', error.message);
        // Não reverter por erro de CRMV, apenas logar ou tratar como aviso no frontend
      }
    }

    // Construir query de atualização dinamicamente para a tabela employees
    const allowedFields = [
      'full_name', 'contact_email', 'cpf', 'birth_date', 'zip_code', 'street', 'neighborhood', 'city', 'state', 'country',
      'address_number', 'address_complement',
      'hire_date', 'salary', 'contract_id', 'bank_name', 'bank_agency', 'bank_account', 'pix_key', 'pix_key_type',
      'is_veterinarian', 'crmv_number', 'crmv_state', 'crmv_status', 'crmv_verified_at',
      'position'
    ];

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (updateData.hasOwnProperty(field)) {
        updateFields.push(`${field} = $${paramCount}`);
        if (field === 'salary') {
          const salaryValue = parseFloat(updateData[field]); // Frontend já envia um float
          if (isNaN(salaryValue)) {
            console.warn(`Valor de salário inválido recebido no backend: ${updateData[field]}`);
            continue; 
          }
          values.push(salaryValue);
        } else if (field === 'cpf') {
          values.push(updateData[field].replace(/\D/g, ''));
        } else {
          values.push(updateData[field]);
        }
        paramCount++;
      }
    }

    let updatedEmployee;
    if (updateFields.length > 0) {
      values.push(id);
      const updateQuery = `
        UPDATE employees 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount} AND is_active = true
        RETURNING id, full_name, cpf, updated_at
      `;
      const result = await client.query(updateQuery, values);
      updatedEmployee = result.rows[0];
    } else {
      // Se nenhum campo de employee foi atualizado, busca o empregado para retornar na resposta
      const currentEmployeeData = await client.query('SELECT id, full_name, cpf, updated_at FROM employees WHERE id = $1', [id]);
      updatedEmployee = currentEmployeeData.rows[0];
    }

    // Atualizar telefones (deletar os antigos e inserir os novos)
    if (phones && Array.isArray(phones)) { 
      // Deletar telefones existentes para este colaborador
      await client.query('DELETE FROM employee_phones WHERE employee_id = $1', [id]);

      // Inserir novos telefones
      if (phones.length > 0) {
        const insertPhoneQuery = 'INSERT INTO employee_phones (employee_id, country_code, phone_number, is_primary) VALUES ($1, $2, $3, $4)';
        for (const phone of phones) {
          if (phone.phone_number && phone.country_code) {
            await client.query(insertPhoneQuery, [
              id, // Usar o ID do colaborador que está sendo atualizado
              phone.country_code,
              phone.phone_number,
              typeof phone.is_primary === 'boolean' ? phone.is_primary : false
            ]);
          }
        }
      }
    }

    // Log de acesso
    await client.query(
      'INSERT INTO access_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'update_employee', 'employee', id]
    );

    await client.query('COMMIT'); // Confirmar transação

    res.json({
      message: 'Colaborador atualizado com sucesso',
      employee: updatedEmployee // Retorna o colaborador atualizado (ou os dados atuais se só telefones mudaram)
    });

  } catch (error) {
    await client.query('ROLLBACK'); // Reverter transação em caso de erro
    console.error('Erro ao atualizar colaborador:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  } finally {
    client.release(); // Liberar cliente de volta para o pool
  }
};

// Desativar colaborador (soft delete)
const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  
  // Validar se o ID é um UUID válido
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ 
      message: 'ID inválido. O ID deve ser um UUID válido.' 
    });
  }

  try {
    // Verificar se o colaborador existe e está ativo
    const checkResult = await db.query(
      'SELECT id, full_name, is_active FROM employees WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Colaborador não encontrado.' 
      });
    }

    const employee = checkResult.rows[0];
    if (!employee.is_active) {
      return res.status(400).json({ 
        message: 'Colaborador já está inativo.' 
      });
    }

    // Inativar o colaborador (soft delete)
    const result = await db.query(
      'UPDATE employees SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    // Log da ação
    if (req.user) {
      await db.query(
        'INSERT INTO access_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'delete_employee', 'employee', id]
      );
    }

    res.json({ 
      message: `Colaborador ${employee.full_name} foi inativado com sucesso.`,
      employee: result.rows[0] 
    });
  } catch (error) {
    console.error('Erro ao desativar colaborador:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Reativar colaborador
const reactivateEmployee = async (req, res) => {
  const { id } = req.params;
  
  // Validar se o ID é um UUID válido
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ 
      message: 'ID inválido. O ID deve ser um UUID válido.' 
    });
  }

  try {
    // Verificar se o colaborador existe e está inativo
    const checkResult = await db.query(
      'SELECT id, full_name, is_active FROM employees WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Colaborador não encontrado.' 
      });
    }

    const employee = checkResult.rows[0];
    if (employee.is_active) {
      return res.status(400).json({ 
        message: 'Colaborador já está ativo.' 
      });
    }

    // Reativar o colaborador
    const result = await db.query(
      'UPDATE employees SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    // Log da ação
    if (req.user) {
      await db.query(
        'INSERT INTO access_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'reactivate_employee', 'employee', id]
      );
    }

    res.json({ 
      message: `Colaborador ${employee.full_name} foi reativado com sucesso.`,
      employee: result.rows[0] 
    });
  } catch (error) {
    console.error('Erro ao reativar colaborador:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Buscar histórico de atividades do colaborador
const getEmployeeHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar se o ID é um UUID válido (opcional, mas recomendado)
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ message: 'ID de colaborador inválido' });
    }

    // Verificar se o colaborador existe
    const employeeExists = await db.query('SELECT id FROM employees WHERE id = $1', [id]);
    if (employeeExists.rows.length === 0) {
      return res.status(404).json({ message: 'Colaborador não encontrado' });
    }

    const result = await db.query(
      `SELECT 
         al.id, 
         al.created_at, 
         al.action, 
         al.resource_type, 
         al.resource_id, 
         u.email as user_email -- ou u.full_name se existir e preferir
       FROM access_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.resource_type = 'employee' AND al.resource_id = $1 
       ORDER BY al.created_at DESC`,
      [id]
    );

    res.json({ history: result.rows });
  } catch (error) {
    console.error('Erro ao buscar histórico do colaborador:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar histórico' });
  }
};

// Verificar CRMV
const verifyCrmvEndpoint = async (req, res) => {
  try {
    const { crmv_number, state } = req.body;

    if (!crmv_number || !state) {
      return res.status(400).json({ message: 'Número do CRMV e estado são obrigatórios' });
    }

    const crmvData = await verifyCrmv(crmv_number, state);
    res.json({ verification: crmvData });
  } catch (error) {
    console.error('Erro ao verificar CRMV:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  reactivateEmployee,
  getEmployeeHistory,
  verifyCrmvEndpoint,
}; 