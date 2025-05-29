const db = require('../config/database');

// Listar todos os serviços
const getAllServices = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, name, description, value, billing_frequency, is_active, created_at, updated_at
      FROM services
      WHERE is_active = true
      ORDER BY name
    `);

    res.json({ services: result.rows });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Buscar serviço por ID
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        id, name, description, value, billing_frequency, is_active, created_at, updated_at
      FROM services
      WHERE id = $1 AND is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    res.json({ service: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Criar novo serviço
const createService = async (req, res) => {
  try {
    const {
      name,
      description,
      value,
      billing_frequency
    } = req.body;

    // Validações
    if (!name || !description || !value || !billing_frequency) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    if (value <= 0) {
      return res.status(400).json({ message: 'Valor deve ser positivo' });
    }

    if (description.length > 500) {
      return res.status(400).json({ message: 'Descrição deve ter no máximo 500 caracteres' });
    }

    const validFrequencies = ['mensal', 'trimestral', 'semestral', 'anual'];
    if (!validFrequencies.includes(billing_frequency)) {
      return res.status(400).json({ message: 'Periodicidade inválida' });
    }

    // Verificar se nome já existe
    const existingService = await db.query('SELECT id FROM services WHERE name = $1 AND is_active = true', [name]);
    if (existingService.rows.length > 0) {
      return res.status(400).json({ message: 'Já existe um serviço com este nome' });
    }

    // Inserir serviço
    const insertQuery = `
      INSERT INTO services (name, description, value, billing_frequency)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, description, value, billing_frequency, created_at
    `;

    const values = [name, description, value, billing_frequency];
    const result = await db.query(insertQuery, values);

    // Log de acesso
    await db.query(
      'INSERT INTO access_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'create_service', 'service', result.rows[0].id]
    );

    res.status(201).json({
      message: 'Serviço cadastrado com sucesso',
      service: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Atualizar serviço
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se serviço existe
    const existingService = await db.query('SELECT id FROM services WHERE id = $1 AND is_active = true', [id]);
    if (existingService.rows.length === 0) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    // Validações
    if (updateData.value && updateData.value <= 0) {
      return res.status(400).json({ message: 'Valor deve ser positivo' });
    }

    if (updateData.description && updateData.description.length > 500) {
      return res.status(400).json({ message: 'Descrição deve ter no máximo 500 caracteres' });
    }

    if (updateData.billing_frequency) {
      const validFrequencies = ['mensal', 'trimestral', 'semestral', 'anual'];
      if (!validFrequencies.includes(updateData.billing_frequency)) {
        return res.status(400).json({ message: 'Periodicidade inválida' });
      }
    }

    // Verificar se nome já existe (exceto para o próprio serviço)
    if (updateData.name) {
      const existingName = await db.query(
        'SELECT id FROM services WHERE name = $1 AND id != $2 AND is_active = true',
        [updateData.name, id]
      );
      if (existingName.rows.length > 0) {
        return res.status(400).json({ message: 'Já existe um serviço com este nome' });
      }
    }

    // Construir query de atualização dinamicamente
    const allowedFields = ['name', 'description', 'value', 'billing_frequency'];
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
      UPDATE services 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount} AND is_active = true
      RETURNING id, name, description, value, billing_frequency, updated_at
    `;

    const result = await db.query(updateQuery, values);

    // Log de acesso
    await db.query(
      'INSERT INTO access_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'update_service', 'service', id]
    );

    res.json({
      message: 'Serviço atualizado com sucesso',
      service: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Desativar serviço (soft delete)
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'UPDATE services SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND is_active = true RETURNING id, name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    // Log de acesso
    await db.query(
      'INSERT INTO access_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'delete_service', 'service', id]
    );

    res.json({
      message: 'Serviço desativado com sucesso',
      service: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao desativar serviço:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
}; 