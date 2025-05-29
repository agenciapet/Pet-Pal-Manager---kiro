const db = require('../config/database');
const { validateCnpj, getCepInfo, verifyCrmv } = require('../config/apis');

// Listar todas as empresas
const getAllCompanies = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        c.id, c.company_name, c.cnpj, c.start_date,
        c.street, c.neighborhood, c.city, c.state, c.zip_code,
        c.is_active, c.created_at,
        ct.name as contract_name, ct.version as contract_version,
        COUNT(cr.id) as representatives_count
      FROM companies c
      LEFT JOIN contracts ct ON c.contract_id = ct.id
      LEFT JOIN company_representatives cr ON c.id = cr.company_id AND cr.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id, ct.name, ct.version
      ORDER BY c.company_name
    `);

    res.json({ companies: result.rows });
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Buscar empresa por ID
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar dados da empresa
    const companyResult = await db.query(`
      SELECT 
        c.*, 
        ct.name as contract_name, ct.version as contract_version
      FROM companies c
      LEFT JOIN contracts ct ON c.contract_id = ct.id
      WHERE c.id = $1 AND c.is_active = true
    `, [id]);

    if (companyResult.rows.length === 0) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    // Buscar representantes
    const representativesResult = await db.query(`
      SELECT 
        id, full_name, cpf, is_veterinarian, crmv_number, crmv_state, crmv_status,
        is_technical_responsible, created_at
      FROM company_representatives
      WHERE company_id = $1 AND is_active = true
      ORDER BY full_name
    `, [id]);

    // Buscar serviços
    const servicesResult = await db.query(`
      SELECT 
        id, service_name, service_value, billing_frequency, start_date, end_date
      FROM company_services
      WHERE company_id = $1 AND is_active = true
      ORDER BY service_name
    `, [id]);

    res.json({
      company: companyResult.rows[0],
      representatives: representativesResult.rows,
      services: servicesResult.rows
    });
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Criar nova empresa
const createCompany = async (req, res) => {
  try {
    const {
      company_name,
      cnpj,
      start_date,
      zip_code,
      contract_id
    } = req.body;

    // Validações
    if (!company_name || !cnpj || !start_date || !zip_code) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    // Validar CNPJ
    if (!validateCnpj(cnpj)) {
      return res.status(400).json({ message: 'CNPJ inválido' });
    }

    // Verificar se CNPJ já existe
    const existingCnpj = await db.query('SELECT id FROM companies WHERE cnpj = $1', [cnpj.replace(/\D/g, '')]);
    if (existingCnpj.rows.length > 0) {
      return res.status(400).json({ message: 'CNPJ já cadastrado' });
    }

    // Buscar informações do CEP
    let addressInfo;
    try {
      addressInfo = await getCepInfo(zip_code);
    } catch (error) {
      return res.status(400).json({ message: 'CEP inválido ou não encontrado' });
    }

    // Inserir empresa
    const insertQuery = `
      INSERT INTO companies (
        company_name, cnpj, start_date, zip_code, street, neighborhood, city, state, contract_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, company_name, cnpj, created_at
    `;

    const values = [
      company_name,
      cnpj.replace(/\D/g, ''),
      start_date,
      addressInfo.zipCode,
      addressInfo.street,
      addressInfo.neighborhood,
      addressInfo.city,
      addressInfo.state,
      contract_id || null
    ];

    const result = await db.query(insertQuery, values);

    // Log de acesso
    await db.query(
      'INSERT INTO access_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'create_company', 'company', result.rows[0].id]
    );

    res.status(201).json({
      message: 'Empresa criada com sucesso',
      company: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Atualizar empresa
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se empresa existe
    const existingCompany = await db.query('SELECT id FROM companies WHERE id = $1 AND is_active = true', [id]);
    if (existingCompany.rows.length === 0) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    // Validar CNPJ se fornecido
    if (updateData.cnpj && !validateCnpj(updateData.cnpj)) {
      return res.status(400).json({ message: 'CNPJ inválido' });
    }

    // Verificar se CNPJ já existe (exceto para a própria empresa)
    if (updateData.cnpj) {
      const existingCnpj = await db.query(
        'SELECT id FROM companies WHERE cnpj = $1 AND id != $2',
        [updateData.cnpj.replace(/\D/g, ''), id]
      );
      if (existingCnpj.rows.length > 0) {
        return res.status(400).json({ message: 'CNPJ já cadastrado para outra empresa' });
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
        return res.status(400).json({ message: 'CEP inválido ou não encontrado' });
      }
    }

    // Construir query de atualização dinamicamente
    const allowedFields = [
      'company_name', 'cnpj', 'start_date', 'zip_code', 'street', 'neighborhood', 'city', 'state', 'contract_id'
    ];

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (updateData.hasOwnProperty(field)) {
        updateFields.push(`${field} = $${paramCount}`);
        values.push(field === 'cnpj' ? updateData[field].replace(/\D/g, '') : updateData[field]);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    values.push(id);
    const updateQuery = `
      UPDATE companies 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount} AND is_active = true
      RETURNING id, company_name, cnpj, updated_at
    `;

    const result = await db.query(updateQuery, values);

    // Log de acesso
    await db.query(
      'INSERT INTO access_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'update_company', 'company', id]
    );

    res.json({
      message: 'Empresa atualizada com sucesso',
      company: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Desativar empresa (soft delete)
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'UPDATE companies SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND is_active = true RETURNING id, company_name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    // Log de acesso
    await db.query(
      'INSERT INTO access_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'delete_company', 'company', id]
    );

    res.json({
      message: 'Empresa desativada com sucesso',
      company: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao desativar empresa:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Adicionar representante à empresa
const addRepresentative = async (req, res) => {
  try {
    const { companyId } = req.params;
    const {
      full_name,
      cpf,
      rg,
      birth_date,
      zip_code,
      is_veterinarian = false,
      crmv_number,
      crmv_state,
      is_technical_responsible = false
    } = req.body;

    // Validações
    if (!full_name || !cpf || !rg || !birth_date || !zip_code) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    // Verificar se empresa existe
    const companyExists = await db.query('SELECT id FROM companies WHERE id = $1 AND is_active = true', [companyId]);
    if (companyExists.rows.length === 0) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    // Buscar informações do CEP
    let addressInfo;
    try {
      addressInfo = await getCepInfo(zip_code);
    } catch (error) {
      return res.status(400).json({ message: 'CEP inválido ou não encontrado' });
    }

    // Verificar CRMV se for veterinário
    let crmvData = null;
    if (is_veterinarian && crmv_number && crmv_state) {
      try {
        crmvData = await verifyCrmv(crmv_number, crmv_state);
      } catch (error) {
        console.warn('Erro ao verificar CRMV:', error.message);
      }
    }

    // Inserir representante
    const insertQuery = `
      INSERT INTO company_representatives (
        company_id, full_name, cpf, rg, birth_date, zip_code, street, neighborhood, city, state,
        is_veterinarian, crmv_number, crmv_state, crmv_status, crmv_verified_at, is_technical_responsible
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id, full_name, cpf, created_at
    `;

    const values = [
      companyId,
      full_name,
      cpf.replace(/\D/g, ''),
      rg,
      birth_date,
      addressInfo.zipCode,
      addressInfo.street,
      addressInfo.neighborhood,
      addressInfo.city,
      addressInfo.state,
      is_veterinarian,
      crmv_number || null,
      crmv_state || null,
      crmvData?.status || null,
      crmvData?.verifiedAt || null,
      is_technical_responsible
    ];

    const result = await db.query(insertQuery, values);

    res.status(201).json({
      message: 'Representante adicionado com sucesso',
      representative: result.rows[0],
      crmvVerification: crmvData
    });
  } catch (error) {
    console.error('Erro ao adicionar representante:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Adicionar serviço à empresa
const addService = async (req, res) => {
  try {
    const { companyId } = req.params;
    const {
      service_name,
      service_value,
      billing_frequency,
      start_date,
      end_date
    } = req.body;

    // Validações
    if (!service_name || !service_value || !billing_frequency || !start_date) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    // Verificar se empresa existe
    const companyExists = await db.query('SELECT id FROM companies WHERE id = $1 AND is_active = true', [companyId]);
    if (companyExists.rows.length === 0) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    // Inserir serviço
    const insertQuery = `
      INSERT INTO company_services (
        company_id, service_name, service_value, billing_frequency, start_date, end_date
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, service_name, service_value, created_at
    `;

    const values = [
      companyId,
      service_name,
      service_value,
      billing_frequency,
      start_date,
      end_date || null
    ];

    const result = await db.query(insertQuery, values);

    res.status(201).json({
      message: 'Serviço adicionado com sucesso',
      service: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao adicionar serviço:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  addRepresentative,
  addService,
}; 