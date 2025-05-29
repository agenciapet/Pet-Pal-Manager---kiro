const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Listar todos os usuários
const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.id, u.name, u.email, u.role, u.is_active, u.created_at,
        e.full_name as employee_name,
        c.company_name,
        cr.full_name as representative_name
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.id
      LEFT JOIN companies c ON u.company_id = c.id
      LEFT JOIN company_representatives cr ON u.representative_id = cr.id
      ORDER BY u.name
    `);

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Buscar usuário por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        u.id, u.name, u.email, u.role, u.is_active, u.created_at,
        u.employee_id, u.company_id, u.representative_id,
        e.full_name as employee_name,
        c.company_name,
        cr.full_name as representative_name
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.id
      LEFT JOIN companies c ON u.company_id = c.id
      LEFT JOIN company_representatives cr ON u.representative_id = cr.id
      WHERE u.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Criar novo usuário
const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      employee_id,
      company_id,
      representative_id
    } = req.body;

    // Validações
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    const validRoles = ['admin', 'financeiro', 'colaborador', 'socio'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Perfil inválido' });
    }

    // Verificar se email já existe
    const existingEmail = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Validações específicas por perfil
    if (role === 'colaborador') {
      if (!employee_id) {
        return res.status(400).json({ message: 'Colaborador deve estar vinculado a um funcionário' });
      }
      
      // Verificar se funcionário existe
      const employeeExists = await db.query('SELECT id FROM employees WHERE id = $1 AND is_active = true', [employee_id]);
      if (employeeExists.rows.length === 0) {
        return res.status(400).json({ message: 'Funcionário não encontrado' });
      }

      // Verificar se funcionário já tem usuário
      const existingUserEmployee = await db.query('SELECT id FROM users WHERE employee_id = $1', [employee_id]);
      if (existingUserEmployee.rows.length > 0) {
        return res.status(400).json({ message: 'Funcionário já possui usuário cadastrado' });
      }
    }

    if (role === 'socio') {
      if (!company_id || !representative_id) {
        return res.status(400).json({ message: 'Sócio deve estar vinculado a uma empresa e representante' });
      }
      
      // Verificar se empresa e representante existem
      const companyExists = await db.query('SELECT id FROM companies WHERE id = $1 AND is_active = true', [company_id]);
      if (companyExists.rows.length === 0) {
        return res.status(400).json({ message: 'Empresa não encontrada' });
      }

      const representativeExists = await db.query(
        'SELECT id FROM company_representatives WHERE id = $1 AND company_id = $2 AND is_active = true',
        [representative_id, company_id]
      );
      if (representativeExists.rows.length === 0) {
        return res.status(400).json({ message: 'Representante não encontrado para esta empresa' });
      }

      // Verificar se representante já tem usuário
      const existingUserRepresentative = await db.query(
        'SELECT id FROM users WHERE representative_id = $1 AND company_id = $2',
        [representative_id, company_id]
      );
      if (existingUserRepresentative.rows.length > 0) {
        return res.status(400).json({ message: 'Representante já possui usuário cadastrado' });
      }
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserir usuário
    const insertQuery = `
      INSERT INTO users (name, email, password, role, employee_id, company_id, representative_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, role, created_at
    `;

    const values = [
      name,
      email,
      hashedPassword,
      role,
      employee_id || null,
      company_id || null,
      representative_id || null
    ];

    const result = await db.query(insertQuery, values);

    // Log de acesso
    await db.query(
      'INSERT INTO access_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'create_user', 'user', result.rows[0].id]
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Atualizar usuário
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se usuário existe
    const existingUser = await db.query('SELECT id, role FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se email já existe (exceto para o próprio usuário)
    if (updateData.email) {
      const existingEmail = await db.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [updateData.email, id]
      );
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({ message: 'Email já cadastrado para outro usuário' });
      }
    }

    // Validar perfil se fornecido
    if (updateData.role) {
      const validRoles = ['admin', 'financeiro', 'colaborador', 'socio'];
      if (!validRoles.includes(updateData.role)) {
        return res.status(400).json({ message: 'Perfil inválido' });
      }
    }

    // Criptografar nova senha se fornecida
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Construir query de atualização dinamicamente
    const allowedFields = ['name', 'email', 'password', 'role', 'is_active', 'employee_id', 'company_id', 'representative_id'];
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (updateData.hasOwnProperty(field)) {
        updateFields.push(`${field} = $${paramCount}`);
        values.push(updateData[field]);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    values.push(id);
    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, name, email, role, is_active, updated_at
    `;

    const result = await db.query(updateQuery, values);

    // Log de acesso
    await db.query(
      'INSERT INTO access_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'update_user', 'user', id]
    );

    res.json({
      message: 'Usuário atualizado com sucesso',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Desativar usuário
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Não permitir desativar o próprio usuário
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Não é possível desativar seu próprio usuário' });
    }

    const result = await db.query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, email',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Log de acesso
    await db.query(
      'INSERT INTO access_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'delete_user', 'user', id]
    );

    res.json({
      message: 'Usuário desativado com sucesso',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Redefinir senha
const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'Nova senha é obrigatória' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Nova senha deve ter pelo menos 6 caracteres' });
    }

    // Verificar se usuário existe
    const existingUser = await db.query('SELECT id, name FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Criptografar nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, id]
    );

    // Log de acesso
    await db.query(
      'INSERT INTO access_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'reset_password', 'user', id]
    );

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Obter opções para associação (funcionários e representantes disponíveis)
const getAssociationOptions = async (req, res) => {
  try {
    // Funcionários sem usuário
    const employeesResult = await db.query(`
      SELECT e.id, e.full_name, e.cpf
      FROM employees e
      LEFT JOIN users u ON e.id = u.employee_id
      WHERE e.is_active = true AND u.id IS NULL
      ORDER BY e.full_name
    `);

    // Empresas ativas
    const companiesResult = await db.query(`
      SELECT id, company_name, cnpj
      FROM companies
      WHERE is_active = true
      ORDER BY company_name
    `);

    // Representantes sem usuário por empresa
    const representativesResult = await db.query(`
      SELECT cr.id, cr.full_name, cr.cpf, cr.company_id, c.company_name
      FROM company_representatives cr
      JOIN companies c ON cr.company_id = c.id
      LEFT JOIN users u ON cr.id = u.representative_id AND cr.company_id = u.company_id
      WHERE cr.is_active = true AND c.is_active = true AND u.id IS NULL
      ORDER BY c.company_name, cr.full_name
    `);

    res.json({
      availableEmployees: employeesResult.rows,
      companies: companiesResult.rows,
      availableRepresentatives: representativesResult.rows
    });
  } catch (error) {
    console.error('Erro ao buscar opções de associação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  getAssociationOptions,
}; 