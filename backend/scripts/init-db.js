require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Configurações padrão para o ambiente local
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'nataliacassus',
  password: process.env.DB_PASSWORD || '',
};

const pool = new Pool({
  ...dbConfig,
  database: 'postgres', // Conectar ao banco padrão primeiro
});

async function initDatabase() {
  try {
    console.log('Iniciando configuração do banco de dados...');

    // Criar banco de dados se não existir
    const dbName = process.env.DB_NAME || 'petpal_manager';
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`;
    const dbExists = await pool.query(checkDbQuery);

    if (dbExists.rows.length === 0) {
      console.log(`Criando banco de dados ${dbName}...`);
      await pool.query(`CREATE DATABASE ${dbName}`);
      console.log(`Banco de dados ${dbName} criado com sucesso!`);
    } else {
      console.log(`Banco de dados ${dbName} já existe.`);
    }

    // Conectar ao banco específico
    const appPool = new Pool({
      ...dbConfig,
      database: dbName,
    });

    // Ler e executar o schema SQL
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executando schema do banco de dados...');
    await appPool.query(schemaSql);
    console.log('Schema executado com sucesso!');

    // Criar usuário administrador padrão
    const bcrypt = require('bcryptjs');
    const adminEmail = 'admin@petpalmanager.com';
    const adminPassword = 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const checkAdminQuery = 'SELECT id FROM users WHERE email = $1';
    const adminExists = await appPool.query(checkAdminQuery, [adminEmail]);

    if (adminExists.rows.length === 0) {
      console.log('Criando usuário administrador padrão...');
      await appPool.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
        [adminEmail, passwordHash, 'admin']
      );
      console.log(`Usuário administrador criado: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log('Usuário administrador já existe.');
    }

    await appPool.end();
    await pool.end();

    console.log('Configuração do banco de dados concluída!');
    console.log('\nPara acessar o sistema:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Senha: ${adminPassword}`);
    console.log('\n⚠️  IMPORTANTE: Altere a senha padrão após o primeiro login!');

  } catch (error) {
    console.error('Erro ao configurar banco de dados:', error);
    process.exit(1);
  }
}

initDatabase(); 