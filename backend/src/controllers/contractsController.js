const pool = require('../config/database');

// Salvar contrato gerado no banco
const saveGeneratedContract = async (req, res) => {
  try {
    const {
      id,
      template_id,
      template_nome,
      entidade_id,
      entidade_nome,
      entidade_tipo,
      status_geral,
      dados_snapshot,
      signatarios
    } = req.body;

    const query = `
      INSERT INTO generated_contracts (
        id, template_id, template_nome, entidade_id, entidade_nome, 
        entidade_tipo, status_geral, dados_snapshot, signatarios
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        status_geral = EXCLUDED.status_geral,
        dados_snapshot = EXCLUDED.dados_snapshot,
        signatarios = EXCLUDED.signatarios,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      id, template_id, template_nome, entidade_id, entidade_nome,
      entidade_tipo, status_geral || 'rascunho', 
      JSON.stringify(dados_snapshot), JSON.stringify(signatarios)
    ];

    const result = await pool.query(query, values);
    res.json({ success: true, contract: result.rows[0] });
  } catch (error) {
    console.error('Erro ao salvar contrato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Listar contratos gerados
const getGeneratedContracts = async (req, res) => {
  try {
    const query = `
      SELECT * FROM generated_contracts 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar contratos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar contrato por ID
const getGeneratedContractById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM generated_contracts WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contrato não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar contrato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar status do contrato
const updateContractStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_geral, signatarios } = req.body;
    
    const query = `
      UPDATE generated_contracts 
      SET status_geral = $1, signatarios = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    
    const values = [status_geral, JSON.stringify(signatarios), id];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contrato não encontrado' });
    }
    
    res.json({ success: true, contract: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar contrato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  saveGeneratedContract,
  getGeneratedContracts,
  getGeneratedContractById,
  updateContractStatus
};