-- Criação do banco de dados PetPal Manager
-- Executar como superusuário PostgreSQL

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de usuários (para autenticação)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- admin, financeiro, colaborador, cliente
    is_active BOOLEAN DEFAULT true,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    representative_id UUID REFERENCES company_representatives(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de serviços (Módulo 3) - Adicionada de schema_updated
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    value DECIMAL(10,2) NOT NULL CHECK (value > 0),
    billing_frequency VARCHAR(50) NOT NULL CHECK (billing_frequency IN ('mensal', 'trimestral', 'semestral', 'anual')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de contratos (textos dos contratos)
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de colaboradores
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Dados pessoais
    full_name VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    rg_document_url VARCHAR(500), -- URL do arquivo no S3
    birth_date DATE NOT NULL,
    
    -- Endereço
    zip_code VARCHAR(8) NOT NULL,
    street VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(2) NOT NULL,
    country VARCHAR(255) DEFAULT 'Brasil',
    
    -- Dados contratuais
    hire_date DATE NOT NULL,
    contract_id UUID REFERENCES contracts(id),
    salary DECIMAL(10,2) NOT NULL,
    
    -- Dados bancários
    bank_name VARCHAR(255),
    bank_agency VARCHAR(10),
    bank_account VARCHAR(20),
    pix_key VARCHAR(255),
    pix_key_type VARCHAR(50), -- Ex: CPF, Email, Telefone, Chave Aleatória, Outro
    
    -- Veterinário
    is_veterinarian BOOLEAN DEFAULT false,
    crmv_number VARCHAR(20),
    crmv_state VARCHAR(2),
    crmv_status VARCHAR(50), -- ativo, inativo
    crmv_verified_at TIMESTAMP,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Tabela de telefones dos colaboradores
CREATE TABLE employee_phones (
    id SERIAL PRIMARY KEY, -- SERIAL é um integer autoincrementável, bom para PK simples
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    country_code VARCHAR(5) DEFAULT '+55', -- Código do país, default Brasil
    phone_number VARCHAR(20) NOT NULL,
    phone_type VARCHAR(50), -- Ex: Celular, Residencial, Comercial
    is_primary BOOLEAN DEFAULT FALSE, -- Indica se é o telefone principal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (employee_id, phone_number) -- Evita telefones duplicados para o mesmo colaborador
);


-- Tabela de empresas (clientes)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Dados da empresa
    company_name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    contract_document_url VARCHAR(500), -- URL do contrato no S3
    contract_id UUID REFERENCES contracts(id),
    
    -- Endereço principal
    zip_code VARCHAR(8) NOT NULL,
    street VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(2) NOT NULL,
    country VARCHAR(255) DEFAULT 'Brasil',
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de telefones das empresas - Adicionada de schema_updated
CREATE TABLE IF NOT EXISTS company_phones (
    id SERIAL PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    country_code VARCHAR(5) NOT NULL DEFAULT '+55',
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de filiais das empresas
CREATE TABLE company_branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    branch_name VARCHAR(255) NOT NULL,
    zip_code VARCHAR(8) NOT NULL,
    street VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(2) NOT NULL,
    country VARCHAR(255) DEFAULT 'Brasil',
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de representantes/sócios das empresas
CREATE TABLE company_representatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES company_branches(id) ON DELETE SET NULL,
    
    -- Dados pessoais
    full_name VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) NOT NULL,
    rg VARCHAR(20) NOT NULL,
    birth_date DATE NOT NULL,
    
    -- Endereço
    zip_code VARCHAR(8) NOT NULL,
    street VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(2) NOT NULL,
    country VARCHAR(255) DEFAULT 'Brasil',
    
    -- Veterinário
    is_veterinarian BOOLEAN DEFAULT false,
    crmv_number VARCHAR(20),
    crmv_state VARCHAR(2),
    crmv_status VARCHAR(50), -- ativo, inativo
    crmv_verified_at TIMESTAMP,
    
    -- Responsável técnico
    is_technical_responsible BOOLEAN DEFAULT false,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de telefones dos representantes - Adicionada de schema_updated
CREATE TABLE IF NOT EXISTS company_representative_phones (
    id SERIAL PRIMARY KEY,
    representative_id UUID REFERENCES company_representatives(id) ON DELETE CASCADE,
    country_code VARCHAR(5) NOT NULL DEFAULT '+55',
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de serviços contratados
CREATE TABLE company_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    service_name VARCHAR(255) NOT NULL,
    service_value DECIMAL(10,2) NOT NULL,
    billing_frequency VARCHAR(50) NOT NULL, -- mensal, trimestral, anual
    start_date DATE NOT NULL,
    end_date DATE,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de reembolsos
CREATE TABLE reimbursements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    receipt_url VARCHAR(500), -- URL do comprovante no S3
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    
    -- Integração Cora
    cora_payment_id VARCHAR(255),
    payment_status VARCHAR(50), -- pending, completed, failed
    paid_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de histórico financeiro (colaboradores)
CREATE TABLE employee_financial_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    
    transaction_type VARCHAR(50) NOT NULL, -- salary, reimbursement, bonus, 13th_salary
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_date DATE NOT NULL, -- mês/ano de referência
    
    -- Integração Cora
    cora_payment_id VARCHAR(255),
    payment_status VARCHAR(50), -- pending, completed, failed
    paid_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de faturas (clientes)
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    description TEXT,
    
    -- Integração Cora
    cora_invoice_id VARCHAR(255),
    cora_boleto_url VARCHAR(500),
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, overdue, canceled
    paid_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de logs de acesso (LGPD)
CREATE TABLE access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    
    action VARCHAR(100) NOT NULL, -- login, view_data, edit_data, delete_data
    resource_type VARCHAR(100), -- employee, company, reimbursement
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela da agência (Módulo 4) - Adicionada de schema_updated
CREATE TABLE IF NOT EXISTS agency (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    foundation_date DATE NOT NULL,
    
    zip_code VARCHAR(8) NOT NULL,
    street VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(2) NOT NULL,
    country VARCHAR(255) DEFAULT 'Brasil',
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de telefones da agência - Adicionada de schema_updated
CREATE TABLE IF NOT EXISTS agency_phones (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER REFERENCES agency(id) ON DELETE CASCADE,
    country_code VARCHAR(5) NOT NULL DEFAULT '+55',
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de sócios da agência - Adicionada de schema_updated
CREATE TABLE IF NOT EXISTS agency_partners (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER REFERENCES agency(id) ON DELETE CASCADE,
    
    full_name VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) NOT NULL,
    rg VARCHAR(20) NOT NULL,
    birth_date DATE NOT NULL,
    
    zip_code VARCHAR(8) NOT NULL,
    street VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(2) NOT NULL,
    country VARCHAR(255) DEFAULT 'Brasil',
    
    is_veterinarian BOOLEAN DEFAULT false,
    crmv_number VARCHAR(20),
    crmv_state VARCHAR(2),
    crmv_status VARCHAR(50),
    crmv_verified_at TIMESTAMP,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de telefones dos sócios da agência - Adicionada de schema_updated
CREATE TABLE IF NOT EXISTS agency_partner_phones (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES agency_partners(id) ON DELETE CASCADE,
    country_code VARCHAR(5) NOT NULL DEFAULT '+55',
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enum para pix_key_type (se não for criado externamente)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pix_key_type_enum') THEN
        CREATE TYPE pix_key_type_enum AS ENUM ('CPF', 'Email', 'Telefone', 'Chave Aleatória', 'Outro');
    END IF;
END$$;

-- Modificar employees para usar o ENUM se ele for criado aqui, ou manter VARCHAR se for externo
-- Se for usar o ENUM:
-- ALTER TABLE employees ALTER COLUMN pix_key_type TYPE pix_key_type_enum USING pix_key_type::pix_key_type_enum;

-- Índices para performance (originais)
CREATE INDEX IF NOT EXISTS idx_employees_cpf ON employees(cpf);
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj);
CREATE INDEX IF NOT EXISTS idx_reimbursements_employee ON reimbursements(employee_id);
CREATE INDEX IF NOT EXISTS idx_reimbursements_status ON reimbursements(status);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created ON access_logs(created_at);

-- Índices adicionais de schema_updated
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_agency_cnpj ON agency(cnpj);
CREATE INDEX IF NOT EXISTS idx_agency_partners_cpf ON agency_partners(cpf);
CREATE INDEX IF NOT EXISTS idx_agency_partners_agency ON agency_partners(agency_id);
CREATE INDEX IF NOT EXISTS idx_users_employee ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_representative ON users(representative_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Tabela de países para códigos de telefone
CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE, -- Ex: "+55"
    flag_emoji VARCHAR(10) -- Ex: "🇧🇷"
);

-- Popular com alguns exemplos iniciais de países
INSERT INTO countries (name, code, flag_emoji) VALUES
    ('Brasil', '+55', '🇧🇷'),
    ('Estados Unidos', '+1', '🇺🇸'),
    ('Portugal', '+351', '🇵🇹'),
    ('Reino Unido', '+44', '🇬🇧'),
    ('Canadá', '+1', '🇨🇦') -- Note: Canadá também usa +1, o que pode ser um problema se code for UNIQUE e compartilhado. Melhor usar um identificador único para o país e o código de discagem em separado se necessário, mas para DDIs, o código em si é o importante.
    -- Para simplificar, e como o Canadá compartilha o +1, vamos garantir que os códigos sejam distintos ou ajustar a lógica de busca.
    -- Ajustando para ter códigos únicos de DDI por enquanto.
    ON CONFLICT (code) DO NOTHING; -- Evita erro se o código já existir. Para o Canadá, como +1 já existe para EUA, este não seria inserido.
    -- Melhor seria ter uma lista curada ou uma fonte confiável para estes dados.
    -- Vamos remover o Canadá por agora para evitar o conflito de UNIQUE com +1 dos EUA.

-- Atualizando a inserção para evitar conflitos e ter uma lista mais simples para começar:
DELETE FROM countries; -- Limpa antes de inserir para garantir que os exemplos abaixo sejam os únicos
INSERT INTO countries (name, code, flag_emoji) VALUES
    ('Brasil', '+55', '🇧🇷'),
    ('Estados Unidos', '+1', '🇺🇸'),
    ('Portugal', '+351', '🇵🇹'),
    ('Reino Unido', '+44', '🇬🇧'),
    ('Argentina', '+54', '🇦🇷'),
    ('Espanha', '+34', '🇪🇸'),
    ('França', '+33', '🇫🇷'),
    ('Alemanha', '+49', '🇩🇪'),
    ('Japão', '+81', '🇯🇵')
ON CONFLICT (code) DO NOTHING;

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers originais
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_branches_updated_at BEFORE UPDATE ON company_branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_representatives_updated_at BEFORE UPDATE ON company_representatives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_services_updated_at BEFORE UPDATE ON company_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reimbursements_updated_at BEFORE UPDATE ON reimbursements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_financial_history_updated_at BEFORE UPDATE ON employee_financial_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para as novas tabelas de schema_updated
-- (Removido DROP TRIGGER IF EXISTS pois CREATE OR REPLACE FUNCTION já lida com isso, e CREATE TRIGGER não deve falhar se não existir)
CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_updated_at 
    BEFORE UPDATE ON agency 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_partners_updated_at 
    BEFORE UPDATE ON agency_partners 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 