const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do banco de dados
const pool = new Pool({
  user: process.env.DB_USER || 'petpal_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'petpal_manager',
  password: process.env.DB_PASSWORD || 'petpal_password',
  port: process.env.DB_PORT || 5432,
});

async function updateDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Aplicando atualizações do banco de dados...');
    
    // Ler o arquivo de schema atualizado
    const schemaPath = path.join(__dirname, '..', 'database', 'schema_updated.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Executar as atualizações
    await client.query(schemaSQL);
    
    console.log('✅ Atualizações aplicadas com sucesso!');
    
    // Inserir alguns serviços de exemplo
    console.log('📝 Inserindo serviços de exemplo...');
    
    const servicesData = [
      {
        name: 'Consultoria Veterinária Básica',
        description: 'Serviço de consultoria veterinária básica para pequenos estabelecimentos',
        value: 500.00,
        billing_frequency: 'mensal'
      },
      {
        name: 'Consultoria Veterinária Premium',
        description: 'Serviço completo de consultoria veterinária com visitas regulares e suporte 24h',
        value: 1200.00,
        billing_frequency: 'mensal'
      },
      {
        name: 'Auditoria Sanitária',
        description: 'Auditoria completa das condições sanitárias do estabelecimento',
        value: 800.00,
        billing_frequency: 'trimestral'
      },
      {
        name: 'Treinamento de Equipe',
        description: 'Treinamento da equipe em boas práticas veterinárias e sanitárias',
        value: 1500.00,
        billing_frequency: 'semestral'
      }
    ];
    
    for (const service of servicesData) {
      try {
        await client.query(`
          INSERT INTO services (name, description, value, billing_frequency)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (name) DO NOTHING
        `, [service.name, service.description, service.value, service.billing_frequency]);
        
        console.log(`  ✓ Serviço "${service.name}" inserido`);
      } catch (error) {
        console.log(`  ⚠️  Serviço "${service.name}" já existe`);
      }
    }
    
    console.log('🎉 Banco de dados atualizado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar banco de dados:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updateDatabase()
    .then(() => {
      console.log('✅ Processo concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro:', error);
      process.exit(1);
    });
}

module.exports = { updateDatabase }; 