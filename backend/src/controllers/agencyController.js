const db = require('../config/database');
const { validateCnpj, validateCpf, getCepInfo, verifyCrmv } = require('../config/apis');

// Obter dados da agência
const getAgency = async (req, res) => {
  try {
    const agencyResult = await db.query(`
      SELECT 
        id, company_name, cnpj, foundation_date, zip_code, street, neighborhood, 
        city, state, country, created_at, updated_at
      FROM agency
      WHERE is_active = true
      LIMIT 1
    `);

    if (agencyResult.rows.length === 0) {
      return res.status(404).json({ message: 'Dados da agência não encontrados' });
    }

    // Buscar telefones da agência
    const phonesResult = await db.query(`
      SELECT id, country_code, phone_number
      FROM agency_phones
      WHERE agency_id = $1
      ORDER BY id
    `, [agencyResult.rows[0].id]);

    // Buscar sócios da agência
    const partnersResult = await db.query(`
      SELECT 
        id, full_name, cpf, rg, birth_date, zip_code, street, neighborhood, 
        city, state, country, is_veterinarian, crmv_number, crmv_state, 
        crmv_status, created_at
      FROM agency_partners
      WHERE agency_id = $1 AND is_active = true
      ORDER BY full_name
    `, [agencyResult.rows[0].id]);

    // Buscar telefones dos sócios
    const partnerPhones = {};
    if (partnersResult.rows.length > 0) {
      const partnerIds = partnersResult.rows.map(p => p.id);
      const partnerPhonesResult = await db.query(`
        SELECT partner_id, country_code, phone_number
        FROM agency_partner_phones
        WHERE partner_id = ANY($1)
        ORDER BY partner_id, id
      `, [partnerIds]);

      partnerPhonesResult.rows.forEach(phone => {
        if (!partnerPhones[phone.partner_id]) {
          partnerPhones[phone.partner_id] = [];
        }
        partnerPhones[phone.partner_id].push({
          country_code: phone.country_code,
          phone_number: phone.phone_number
        });
      });
    }

    // Adicionar telefones aos sócios
    const partnersWithPhones = partnersResult.rows.map(partner => ({
      ...partner,
      phones: partnerPhones[partner.id] || []
    }));

    res.json({
      agency: {
        ...agencyResult.rows[0],
        phones: phonesResult.rows
      },
      partners: partnersWithPhones
    });
  } catch (error) {
    console.error('Erro ao buscar dados da agência:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Criar/Atualizar dados da agência
const upsertAgency = async (req, res) => {
  try {
    const {
      company_name,
      cnpj,
      foundation_date,
      zip_code,
      phones = []
    } = req.body;

    // Validações
    if (!company_name || !cnpj || !foundation_date || !zip_code) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    // Validar CNPJ
    if (!validateCnpj(cnpj)) {
      return res.status(400).json({ message: 'CNPJ inválido' });
    }

    // Buscar informações do CEP
    let addressInfo;
    try {
      addressInfo = await getCepInfo(zip_code);
    } catch (error) {
      return res.status(400).json({ message: 'CEP inválido ou não encontrado' });
    }

    // Verificar se já existe uma agência
    const existingAgency = await db.query('SELECT id FROM agency WHERE is_active = true LIMIT 1');

    let agencyId;
    let message;

    if (existingAgency.rows.length > 0) {
      // Atualizar agência existente
      agencyId = existingAgency.rows[0].id;
      
      const updateQuery = `
        UPDATE agency 
        SET company_name = $1, cnpj = $2, foundation_date = $3, zip_code = $4,
            street = $5, neighborhood = $6, city = $7, state = $8, country = $9,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING id, company_name, cnpj
      `;

      const values = [
        company_name,
        cnpj.replace(/\D/g, ''),
        foundation_date,
        addressInfo.zipCode,
        addressInfo.street,
        addressInfo.neighborhood,
        addressInfo.city,
        addressInfo.state,
        'Brasil',
        agencyId
      ];

      await db.query(updateQuery, values);
      message = 'Dados da agência atualizados com sucesso';
    } else {
      // Criar nova agência
      const insertQuery = `
        INSERT INTO agency (
          company_name, cnpj, foundation_date, zip_code, street, neighborhood, 
          city, state, country
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, company_name, cnpj
      `;

      const values = [
        company_name,
        cnpj.replace(/\D/g, ''),
        foundation_date,
        addressInfo.zipCode,
        addressInfo.street,
        addressInfo.neighborhood,
        addressInfo.city,
        addressInfo.state,
        'Brasil'
      ];

      const result = await db.query(insertQuery, values);
      agencyId = result.rows[0].id;
      message = 'Agência cadastrada com sucesso';
    }

    // Atualizar telefones
    await db.query('DELETE FROM agency_phones WHERE agency_id = $1', [agencyId]);
    
    for (const phone of phones) {
      if (phone.country_code && phone.phone_number) {
        await db.query(
          'INSERT INTO agency_phones (agency_id, country_code, phone_number) VALUES ($1, $2, $3)',
          [agencyId, phone.country_code, phone.phone_number]
        );
      }
    }

    // Log de acesso
    await db.query(
      'INSERT INTO access_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'upsert_agency', 'agency', agencyId]
    );

    res.json({ message, agencyId });
  } catch (error) {
    console.error('Erro ao salvar dados da agência:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Adicionar sócio à agência
const addPartner = async (req, res) => {
  try {
    const {
      full_name,
      cpf,
      rg,
      birth_date,
      zip_code,
      phones = [],
      is_veterinarian = false,
      crmv_number,
      crmv_state
    } = req.body;

    // Validações
    if (!full_name || !cpf || !rg || !birth_date || !zip_code) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    // Validar CPF
    if (!validateCpf(cpf)) {
      return res.status(400).json({ message: 'CPF inválido' });
    }

    // Verificar se agência existe
    const agencyResult = await db.query('SELECT id FROM agency WHERE is_active = true LIMIT 1');
    if (agencyResult.rows.length === 0) {
      return res.status(400).json({ message: 'Cadastre primeiro os dados da agência' });
    }

    const agencyId = agencyResult.rows[0].id;

    // Verificar se CPF já existe
    const existingCpf = await db.query(
      'SELECT id FROM agency_partners WHERE cpf = $1 AND agency_id = $2 AND is_active = true',
      [cpf.replace(/\D/g, ''), agencyId]
    );
    if (existingCpf.rows.length > 0) {
      return res.status(400).json({ message: 'CPF já cadastrado para outro sócio' });
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

    // Inserir sócio
    const insertQuery = `
      INSERT INTO agency_partners (
        agency_id, full_name, cpf, rg, birth_date, zip_code, street, neighborhood, 
        city, state, country, is_veterinarian, crmv_number, crmv_state, 
        crmv_status, crmv_verified_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id, full_name, cpf, created_at
    `;

    const values = [
      agencyId,
      full_name,
      cpf.replace(/\D/g, ''),
      rg,
      birth_date,
      addressInfo.zipCode,
      addressInfo.street,
      addressInfo.neighborhood,
      addressInfo.city,
      addressInfo.state,
      'Brasil',
      is_veterinarian,
      crmv_number || null,
      crmv_state || null,
      crmvData?.status || null,
      crmvData?.verifiedAt || null
    ];

    const result = await db.query(insertQuery, values);
    const partnerId = result.rows[0].id;

    // Inserir telefones
    for (const phone of phones) {
      if (phone.country_code && phone.phone_number) {
        await db.query(
          'INSERT INTO agency_partner_phones (partner_id, country_code, phone_number) VALUES ($1, $2, $3)',
          [partnerId, phone.country_code, phone.phone_number]
        );
      }
    }

    res.status(201).json({
      message: 'Sócio adicionado com sucesso',
      partner: result.rows[0],
      crmvVerification: crmvData
    });
  } catch (error) {
    console.error('Erro ao adicionar sócio:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Atualizar sócio
const updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se sócio existe
    const existingPartner = await db.query(
      'SELECT id, agency_id FROM agency_partners WHERE id = $1 AND is_active = true',
      [id]
    );
    if (existingPartner.rows.length === 0) {
      return res.status(404).json({ message: 'Sócio não encontrado' });
    }

    const agencyId = existingPartner.rows[0].agency_id;

    // Validar CPF se fornecido
    if (updateData.cpf && !validateCpf(updateData.cpf)) {
      return res.status(400).json({ message: 'CPF inválido' });
    }

    // Verificar se CPF já existe (exceto para o próprio sócio)
    if (updateData.cpf) {
      const existingCpf = await db.query(
        'SELECT id FROM agency_partners WHERE cpf = $1 AND id != $2 AND agency_id = $3 AND is_active = true',
        [updateData.cpf.replace(/\D/g, ''), id, agencyId]
      );
      if (existingCpf.rows.length > 0) {
        return res.status(400).json({ message: 'CPF já cadastrado para outro sócio' });
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
        updateData.country = 'Brasil';
        updateData.zip_code = addressInfo.zipCode;
      } catch (error) {
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
      }
    }

    // Construir query de atualização dinamicamente
    const allowedFields = [
      'full_name', 'cpf', 'rg', 'birth_date', 'zip_code', 'street', 'neighborhood', 
      'city', 'state', 'country', 'is_veterinarian', 'crmv_number', 'crmv_state', 
      'crmv_status', 'crmv_verified_at'
    ];

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (updateData.hasOwnProperty(field)) {
        updateFields.push(`${field} = $${paramCount}`);
        values.push(field === 'cpf' ? updateData[field].replace(/\D/g, '') : updateData[field]);
        paramCount++;
      }
    }

    if (updateFields.length === 0 && !updateData.phones) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    if (updateFields.length > 0) {
      values.push(id);
      const updateQuery = `
        UPDATE agency_partners 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount} AND is_active = true
        RETURNING id, full_name, cpf, updated_at
      `;

      await db.query(updateQuery, values);
    }

    // Atualizar telefones se fornecidos
    if (updateData.phones) {
      await db.query('DELETE FROM agency_partner_phones WHERE partner_id = $1', [id]);
      
      for (const phone of updateData.phones) {
        if (phone.country_code && phone.phone_number) {
          await db.query(
            'INSERT INTO agency_partner_phones (partner_id, country_code, phone_number) VALUES ($1, $2, $3)',
            [id, phone.country_code, phone.phone_number]
          );
        }
      }
    }

    res.json({ message: 'Sócio atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar sócio:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Desativar sócio (soft delete)
const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'UPDATE agency_partners SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND is_active = true RETURNING id, full_name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Sócio não encontrado' });
    }

    res.json({
      message: 'Sócio desativado com sucesso',
      partner: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao desativar sócio:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

module.exports = {
  getAgency,
  upsertAgency,
  addPartner,
  updatePartner,
  deletePartner,
}; 