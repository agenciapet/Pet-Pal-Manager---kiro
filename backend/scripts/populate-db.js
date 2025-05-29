const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Configuração do Banco de Dados (ajuste conforme necessário)
const pool = new Pool({
  user: process.env.DB_USER || 'nataliacassus',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'petpal_manager',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

const pixKeyTypes = ['CPF', 'Email', 'Telefone', 'Chave Aleatória', 'Outro'];
const phoneTypes = ['Principal', 'Empresa', 'Pessoal', 'Whatsapp', 'Celular'];

async function populateDatabase() {
  const client = await pool.connect();
  console.log('Conectado ao banco de dados!');

  try {
    await client.query('BEGIN');
    console.log('Iniciando transação...');

    // 1. Criar Enum pix_key_type_enum se não existir (COPIADO DO init-db.js)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pix_key_type_enum') THEN
          CREATE TYPE pix_key_type_enum AS ENUM ('CPF', 'Email', 'Telefone', 'Chave Aleatória', 'Outro');
        END IF;
      END$$;
    `);
    console.log('Enum pix_key_type_enum verificado/criado.');

    // 2. Criar usuário admin se não existir
    const adminEmail = 'admin@petpalmanager.com';
    const adminExists = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    let adminUserId;

    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminResult = await client.query(
        'INSERT INTO users (id, full_name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [uuidv4(), 'Administrador do Sistema', adminEmail, hashedPassword, 'admin']
      );
      adminUserId = adminResult.rows[0].id;
      console.log(`Usuário admin criado com ID: ${adminUserId}`);
    } else {
      adminUserId = adminExists.rows[0].id;
      console.log(`Usuário admin já existe com ID: ${adminUserId}`);
    }

    // 3. Criar colaboradores fictícios
    const employeesData = [
      {
        id: uuidv4(),
        full_name: 'Carlos Santana',
        cpf: '11122233301',
        birth_date: '1985-10-20',
        zip_code: '01001000', // Exemplo: CEP da Praça da Sé
        street: 'Praça da Sé',
        neighborhood: 'Sé',
        city: 'São Paulo',
        state: 'SP',
        hire_date: '2023-01-15',
        salary: '5500.00',
        bank_name: 'Banco Bradesco',
        bank_agency: '0123',
        bank_account: '12345-6',
        pix_key: 'carlos.santana@example.com',
        pix_key_type: 'Email',
        is_veterinarian: false,
        phones: [
          { phone_number: '11987654321', phone_type: 'Principal', is_primary: true },
        ]
      },
      {
        id: uuidv4(),
        full_name: 'Beatriz Oliveira',
        cpf: '44455566602',
        birth_date: '1992-03-12',
        zip_code: '20031000', // Exemplo: CEP Av. Rio Branco, RJ
        street: 'Avenida Rio Branco',
        neighborhood: 'Centro',
        city: 'Rio de Janeiro',
        state: 'RJ',
        hire_date: '2022-11-01',
        salary: '7200.00',
        bank_name: 'Banco Itaú',
        bank_agency: '0456',
        bank_account: '65432-1',
        pix_key: '44455566602',
        pix_key_type: 'CPF',
        is_veterinarian: true,
        crmv_number: '12345',
        crmv_state: 'RJ',
        crmv_status: 'Ativo',
        phones: [
          { phone_number: '21912345678', phone_type: 'Pessoal', is_primary: true },
          { phone_number: '2133445566', phone_type: 'Empresa', is_primary: false },
        ]
      },
      {
        id: uuidv4(),
        full_name: 'Fernanda Lima',
        cpf: '77788899903',
        birth_date: '1990-07-25',
        zip_code: '30112010', // Exemplo: CEP Savassi, BH
        street: 'Rua Pernambuco',
        neighborhood: 'Savassi',
        city: 'Belo Horizonte',
        state: 'MG',
        hire_date: '2024-02-01',
        salary: '4800.00',
        bank_name: 'Caixa Econômica Federal',
        bank_agency: '0789',
        bank_account: '98765-4',
        pix_key: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        pix_key_type: 'Chave Aleatória',
        is_veterinarian: false,
        phones: [
          { phone_number: '31988776655', phone_type: 'Whatsapp', is_primary: true },
        ]
      },
    ];

    for (const emp of employeesData) {
      // Verificar se colaborador já existe pelo CPF para evitar duplicatas ao rodar múltiplas vezes
      const empExists = await client.query('SELECT id FROM employees WHERE cpf = $1', [emp.cpf]);
      if (empExists.rows.length > 0) {
        console.log(`Colaborador ${emp.full_name} (CPF: ${emp.cpf}) já existe. Pulando.`);
        continue;
      }
      
      const employeeInsertResult = await client.query(
        `INSERT INTO employees (
          id, full_name, cpf, birth_date, zip_code, street, neighborhood, city, state, 
          hire_date, salary, bank_name, bank_agency, bank_account, pix_key, pix_key_type, 
          is_veterinarian, crmv_number, crmv_state, crmv_status, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, true) RETURNING id`,
        [
          emp.id, emp.full_name, emp.cpf, emp.birth_date, emp.zip_code, emp.street, emp.neighborhood, emp.city, emp.state,
          emp.hire_date, emp.salary, emp.bank_name, emp.bank_agency, emp.bank_account, emp.pix_key, emp.pix_key_type,
          emp.is_veterinarian, emp.crmv_number, emp.crmv_state, emp.crmv_status
        ]
      );
      const newEmployeeId = employeeInsertResult.rows[0].id;
      console.log(`Colaborador ${emp.full_name} inserido com ID: ${newEmployeeId}`);

      for (const phone of emp.phones) {
        await client.query(
          'INSERT INTO employee_phones (employee_id, phone_number, phone_type, is_primary) VALUES ($1, $2, $3, $4)',
          [newEmployeeId, phone.phone_number, phone.phone_type, phone.is_primary]
        );
        console.log(`   Telefone ${phone.phone_number} inserido para ${emp.full_name}`);
      }
    }

    await client.query('COMMIT');
    console.log('Transação concluída com sucesso! Dados populados.');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro durante a transação, rollback realizado:', err);
  } finally {
    await client.release();
    await pool.end();
    console.log('Conexão com o banco de dados fechada.');
  }
}

populateDatabase().catch(err => console.error('Erro ao executar script de população:', err)); 