// Dados mockados para teste do sistema PPM

export interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
}

export interface DadosBancarios {
  banco: string;
  agencia: string;
  conta: string;
  tipo_conta?: 'corrente' | 'poupanca';
  chave_pix?: string;
  tipo_chave_pix?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria' | 'outro';
}

export interface Colaborador {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento?: string;
  contact_email: string;
  telefones: { numero: string; tipo?: 'principal' | 'celular' | 'trabalho' | 'outro' }[];
  endereco: Endereco;
  cargo: string;
  salario: number;
  data_contratacao: string;
  is_active: boolean;
  is_veterinario: boolean;
  crmv?: string;
  crmv_uf?: string;
  crmv_status?: 'verificado' | 'pendente' | 'invalido';
  dados_bancarios: DadosBancarios;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Servico {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  periodicidade: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnidadeCliente {
  id: string;
  nome_unidade: string;
  endereco: Endereco;
  telefones: { numero: string; tipo?: 'principal' | 'celular' | 'trabalho' | 'outro' }[];
  representantes: RepresentanteCliente[];
  is_matriz?: boolean;
}

export interface RepresentanteCliente {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento?: string;
  email: string;
  telefones: { numero: string; tipo?: 'principal' | 'celular' | 'trabalho' | 'outro' }[];
  cargo: string;
  is_responsavel_tecnico: boolean;
  is_veterinario: boolean;
  crmv?: string;
  crmv_uf?: string;
  crmv_status?: 'verificado' | 'pendente' | 'invalido';
}

export interface ServicoContratado {
  id: string;
  servico_id: string;
  servico_nome: string;
  valor: number;
  data_inicio: string;
  is_active: boolean;
}

export interface Cliente {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  email: string;
  telefones: { numero: string; tipo?: 'principal' | 'celular' | 'trabalho' | 'outro' }[];
  tipo_empresa: 'Consultório' | 'Clínica' | 'Hospital' | 'Veterinário Volante' | 'Veterinário Autônomo' | 'PetShop' | 'Petshop com Clínica' | 'Parceria' | 'Outros';
  porte: 'Pequena' | 'Média' | 'Grande' | 'Multinacional';
  unidades: UnidadeCliente[];
  servicos_contratados: ServicoContratado[];
  status: 'ativo' | 'inadimplente' | 'contrato_cancelado' | 'inativo' | 'em_negociacao' | 'prospect';
  historico_alteracoes?: { data_alteracao: string; usuario_responsavel: string; detalhes_alteracao: string[]; }[];
  created_at: string;
  updated_at: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'financeiro' | 'colaborador' | 'cliente';
  status: 'ativo' | 'inativo';
  avatar?: string; // opcional, pode ser a URL da imagem ou iniciais
  associacao_id?: string; // ID do colaborador ou sócio
  associacao_nome?: string; // Nome do colaborador ou sócio para exibição
  associacao_empresa?: string; // Nome da empresa, se for sócio
  created_at: string;
}

export interface Reembolso {
  id: string;
  colaborador_id: string;
  colaborador_nome: string;
  valor: number;
  descricao: string;
  data_solicitacao: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  comprovante_url?: string;
  data_aprovacao_rejeicao?: string;
  motivo_rejeicao?: string;
}

export interface Agencia {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  data_fundacao: string;
  endereco: Endereco;
  telefones: { numero: string; tipo?: 'principal' | 'celular' | 'trabalho' | 'outro' }[];
  socios: SocioAgencia[];
  logo_url?: string;
  favicon_url?: string;
}

export interface SocioAgencia {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento?: string;
  email: string;
  telefone: string;
  is_veterinario: boolean;
  crmv?: string;
  crmv_uf?: string;
  crmv_status?: 'verificado' | 'pendente' | 'invalido';
}

// Interface para as estatísticas do Dashboard
export interface DashboardStats {
  totalColaboradores: number;
  totalClientes: number;
  reembolsosPendentes: number;
  faturamentoMensal: number;
  atividadesRecentes: AtividadeRecente[];
  // Adicionar outros campos conforme necessário
}

// Interface para Atividade Recente
export interface AtividadeRecente {
  id: string;
  acao: string;
  timestamp: string;
  usuario_email: string;
}

// Novas Interfaces para Gestão de Contratos
export interface ContratoTemplate {
  id: string;
  nome: string;
  tipo: 'colaborador' | 'cliente'; // Para qual entidade este template se aplica
  conteudo: string; // HTML/texto do template com placeholders como {NOME_COMPLETO}, {RAZAO_SOCIAL}
  variaveis_disponiveis: string[]; // Lista de placeholders que podem ser usados neste template
  versao: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SignatarioContrato {
  id: string; // Adicionado para possível uso futuro, pode ser o email ou um UUID
  nome: string;
  email: string;
  tipo: 'cliente' | 'colaborador' | 'testemunha' | 'outros'; // Tipo de signatário
  ordem_assinatura?: number; // Para fluxos de assinatura sequenciais
  status_assinatura: 'pendente' | 'assinado' | 'rejeitado';
  data_assinatura?: string | null;
  link_assinatura?: string; // Link único para este signatário
  dadosAuditoria?: {
    ip_simulado?: string;
    user_agent?: string;
    data_assinatura_cliente?: string; // Data/hora do cliente no momento da assinatura
    nome_confirmado?: string; // Nome que o usuário digitou ao assinar
  };
}

export interface ContratoGerado {
  id: string;
  template_id: string;
  template_nome: string;
  template_versao: string;
  tipo_contrato: 'colaborador' | 'cliente';
  entidade_id: string; // ID do Colaborador ou Cliente
  entidade_nome: string; // Nome do Colaborador ou Razão Social do Cliente
  servico_contratado_id?: string; // Se for contrato de cliente, ID do serviço (opcional, pode haver contratos sem serviço específico)
  servico_contratado_nome?: string;
  
  pdf_url_original: string; // URL/path do PDF gerado antes da assinatura
  pdf_url_assinado?: string; // URL/path do PDF após todas as assinaturas
  
  link_unico_assinatura?: string; // Link único para a página de assinatura (se aplicável, ou pode ser por signatário)
  link_expiracao?: string;

  signatarios: SignatarioContrato[];
  
  status_geral: 
    | 'rascunho' 
    | 'aguardando_assinaturas' 
    | 'parcialmente_assinado' // Se algumas, mas não todas as partes assinaram
    | 'assinado' // Todas as partes obrigatórias assinaram
    | 'expirado' 
    | 'cancelado';
  
  dados_snapshot: any; // JSON dos dados usados para gerar o contrato (para auditoria e histórico)
  
  data_geracao: string;
  data_envio_assinatura?: string;
  data_ultima_assinatura?: string;
  data_conclusao?: string; // Data em que foi totalmente assinado
  
  created_at: string;
  updated_at: string;
}

// Dados mockados
const mockColaboradores: Colaborador[] = [
  {
    id: '1',
    nome_completo: 'Ana Silva',
    cpf: '123.456.789-00',
    data_nascimento: '1990-05-15',
    contact_email: 'ana.silva@example.com',
    telefones: [{ numero: '+55 (11) 98765-4321', tipo: 'principal' }],
    endereco: {
      cep: '01001-000',
      logradouro: 'Praça da Sé',
      numero: '100',
      bairro: 'Sé',
      cidade: 'São Paulo',
      estado: 'SP',
      pais: 'Brasil',
    },
    cargo: 'Desenvolvedor Frontend',
    salario: 7500,
    data_contratacao: '2022-08-01',
    is_active: true,
    is_veterinario: false,
    dados_bancarios: {
      banco: '001 - Banco do Brasil',
      agencia: '1234-5',
      conta: '12345-6',
      tipo_conta: 'corrente',
      chave_pix: 'ana.silva@email.com',
      tipo_chave_pix: 'email',
    },
    avatar_url: '/avatars/avatar-ana.png',
    created_at: '2022-08-01T09:00:00Z',
    updated_at: '2023-11-15T14:30:00Z',
  },
  {
    id: '2',
    nome_completo: 'Carlos Eduardo Mendes',
    cpf: '234.567.890-11',
    data_nascimento: '1985-10-20',
    contact_email: 'carlos.mendes@example.com',
    telefones: [{ numero: '+55 (21) 91234-5678', tipo: 'principal' }, { numero: '+55 (21) 2233-4455', tipo: 'trabalho' }],
    endereco: {
      cep: '20040-030',
      logradouro: 'Rua da Assembleia',
      numero: '50',
      bairro: 'Centro',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      pais: 'Brasil',
    },
    cargo: 'Veterinário Responsável Técnico',
    salario: 12000,
    data_contratacao: '2021-05-10',
    is_active: true,
    is_veterinario: true,
    crmv: 'CRMV-RJ 12345',
    crmv_uf: 'RJ',
    crmv_status: 'verificado',
    dados_bancarios: {
      banco: '237 - Bradesco',
      agencia: '5678-9',
      conta: '56789-0',
      tipo_conta: 'corrente',
      chave_pix: '23456789011',
      tipo_chave_pix: 'cpf',
    },
    avatar_url: '/avatars/avatar-carlos.png',
    created_at: '2021-05-10T09:00:00Z',
    updated_at: '2023-10-20T10:00:00Z',
  },
  {
    id: '3',
    nome_completo: 'Beatriz Oliveira',
    cpf: '345.678.901-22',
    data_nascimento: '1995-02-28',
    contact_email: 'beatriz.oliveira@example.com',
    telefones: [{ numero: '+55 (31) 92345-6789', tipo: 'principal' }],
    endereco: {
      cep: '30110-005',
      logradouro: 'Avenida Afonso Pena',
      numero: '4000',
      bairro: 'Savassi',
      cidade: 'Belo Horizonte',
      estado: 'MG',
      pais: 'Brasil',
    },
    cargo: 'Designer Gráfico',
    salario: 6000,
    data_contratacao: '2023-01-15',
    is_active: false,
    is_veterinario: false,
    dados_bancarios: {
      banco: '341 - Itaú Unibanco',
      agencia: '0123-4',
      conta: '01234-5',
      chave_pix: 'beatriz.oliveira@email.com',
      tipo_chave_pix: 'email',
    },
    avatar_url: '/avatars/avatar-beatriz.png',
    created_at: '2023-01-15T09:00:00Z',
    updated_at: '2023-09-01T16:00:00Z',
  },
  {
    id: '4',
    nome_completo: 'Dr. Roberto Lima Alves',
    cpf: '456.789.012-33',
    data_nascimento: '1978-07-10',
    contact_email: 'roberto.alves@example.com',
    telefones: [{ numero: '+55 (71) 93456-7890', tipo: 'principal' }],
    endereco: {
      cep: '40020-000',
      logradouro: 'Rua Chile',
      numero: '10',
      bairro: 'Comércio',
      cidade: 'Salvador',
      estado: 'BA',
      pais: 'Brasil',
    },
    cargo: 'Veterinário Cirurgião',
    salario: 15000,
    data_contratacao: '2020-02-20',
    is_active: true,
    is_veterinario: true,
    crmv: 'CRMV-BA 54321',
    crmv_uf: 'BA',
    crmv_status: 'verificado',
    dados_bancarios: {
      banco: '033 - Santander',
      agencia: '4567-8',
      conta: '45678-9',
      chave_pix: 'roberto.alves.vet@email.com',
      tipo_chave_pix: 'email',
    },
    avatar_url: '/avatars/avatar-roberto.png',
    created_at: '2020-02-20T09:00:00Z',
    updated_at: '2023-11-01T11:45:00Z',
  },
];

const mockServicos: Servico[] = [
  {
    id: '1',
    nome: 'Plano Poodle (Marketing Completo)',
    descricao: 'Gestão de redes sociais (Instagram, Facebook), criação de 12 posts/mês, 2 campanhas de tráfego pago (Meta Ads), relatório mensal de desempenho.',
    valor: 2500.00,
    periodicidade: 'mensal',
    is_active: true,
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2023-10-01T00:00:00Z'
  },
  {
    id: '2',
    nome: 'Plano Labrador (Google Ads Avançado)',
    descricao: 'Criação e otimização de campanhas no Google Ads (Search, Display, YouTube), análise de palavras-chave, monitoramento de conversões, relatórios quinzenais.',
    valor: 1800.00,
    periodicidade: 'mensal',
    is_active: true,
    created_at: '2023-03-01T00:00:00Z',
    updated_at: '2023-11-01T00:00:00Z'
  },
  {
    id: '3',
    nome: 'Plano Siames (Consultoria SEO)',
    descricao: 'Análise SEO completa do site, otimização on-page, estratégia de link building, relatório de posicionamento e recomendações. Pacote trimestral.',
    valor: 3200.00,
    periodicidade: 'trimestral',
    is_active: false,
    created_at: '2023-05-20T00:00:00Z',
    updated_at: '2023-08-15T00:00:00Z'
  },
  {
    id: '4',
    nome: 'Plano Bulldog (Identidade Visual)',
    descricao: 'Criação de logotipo, manual da marca, paleta de cores, tipografia, templates para redes sociais. Pagamento único.',
    valor: 4500.00,
    periodicidade: 'anual', // Representando pagamento único como "anual" para fins de filtro, mas pode ser melhorado
    is_active: true,
    created_at: '2023-07-10T00:00:00Z',
    updated_at: '2023-07-10T00:00:00Z'
  }
];

const mockClientes: Cliente[] = [
  {
    id: '1',
    razao_social: 'Clínica Veterinária AuMiau Ltda.',
    nome_fantasia: 'AuMiau VetCare',
    cnpj: '11.222.333/0001-44',
    email: 'contato@aumiauvet.com.br',
    telefones: [{ numero: '+55 (11) 2345-6789', tipo: 'principal' }],
    tipo_empresa: 'Clínica',
    porte: 'Pequena',
    unidades: [
      {
        id: 'un1-1',
        nome_unidade: 'Matriz Vila Mariana',
        endereco: {
          cep: '04010-000',
          logradouro: 'Rua das Palmeiras',
          numero: '123',
          bairro: 'Vila Mariana',
          cidade: 'São Paulo',
          estado: 'SP',
          pais: 'Brasil',
        },
        telefones: [{ numero: '+55 (11) 2345-6789', tipo: 'principal' }],
        is_matriz: true,
        representantes: [
          {
            id: 'rep1-1-1',
            nome_completo: 'Dr. Ricardo Almeida',
            cpf: '111.222.333-44',
            data_nascimento: '1990-05-15',
            email: 'ricardo.almeida@aumiauvet.com.br',
            telefones: [{ numero: '+55 (11) 91111-2222', tipo: 'principal' }],
            cargo: 'Diretor Clínico',
            is_responsavel_tecnico: true,
            is_veterinario: true,
            crmv: 'CRMV-SP 67890',
            crmv_uf: 'SP',
            crmv_status: 'verificado'
          },
          {
            id: 'rep1-1-2',
            nome_completo: 'Fernanda Costa',
            cpf: '222.333.444-55',
            data_nascimento: '1995-02-28',
            email: 'fernanda.costa@aumiauvet.com.br',
            telefones: [{ numero: '+55 (11) 92222-3333', tipo: 'principal' }],
            cargo: 'Gerente Administrativa',
            is_responsavel_tecnico: false,
            is_veterinario: false,
          }
        ]
      },
      {
        id: 'un1-2',
        nome_unidade: 'Filial Pinheiros',
        endereco: {
          cep: '05401-000',
          logradouro: 'Rua dos Pinheiros',
          numero: '789',
          bairro: 'Pinheiros',
          cidade: 'São Paulo',
          estado: 'SP',
          pais: 'Brasil',
        },
        telefones: [{ numero: '+55 (11) 3456-7890', tipo: 'principal' }],
        representantes: [
          {
            id: 'rep1-2-1',
            nome_completo: 'Dra. Camila Santos',
            cpf: '333.444.555-66',
            data_nascimento: '1995-02-28',
            email: 'camila.santos@aumiauvet.com.br',
            telefones: [{ numero: '+55 (11) 93333-4444', tipo: 'principal' }],
            cargo: 'Veterinária Chefe',
            is_responsavel_tecnico: true,
            is_veterinario: true,
            crmv: 'CRMV-SP 67891',
            crmv_uf: 'SP',
            crmv_status: 'verificado'
          }
        ]
      }
    ],
    servicos_contratados: [
      { id: 'sc1', servico_id: '1', servico_nome: 'Plano Poodle (Marketing Completo)', valor: 2500.00, data_inicio: '2023-05-01', is_active: true },
      { id: 'sc2', servico_id: '2', servico_nome: 'Plano Labrador (Google Ads Avançado)', valor: 1800.00, data_inicio: '2023-07-01', is_active: true }
    ],
    status: 'ativo',
    historico_alteracoes: [],
    created_at: '2023-04-10T00:00:00Z',
    updated_at: '2023-11-10T00:00:00Z'
  },
  {
    id: '2',
    razao_social: 'PetShop Cão Feliz e Cia Ltda.',
    nome_fantasia: 'Cão Feliz PetStore',
    cnpj: '44.555.666/0001-77',
    email: 'contato@caofeliz.com',
    telefones: [{ numero: '(21) 9876-5432', tipo: 'principal' }],
    tipo_empresa: 'Petshop com Clínica',
    porte: 'Média',
    unidades: [
      {
        id: 'un2-1',
        nome_unidade: 'Unidade Principal Tijuca',
        endereco: {
          cep: '20520-054',
          logradouro: 'Rua Conde de Bonfim',
          numero: '400',
          bairro: 'Tijuca',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          pais: 'Brasil',
        },
        telefones: [{ numero: '(21) 9876-5432', tipo: 'principal' }],
        is_matriz: true,
        representantes: [
          {
            id: 'rep2-1-1',
            nome_completo: 'Mariana Rodrigues Silva',
            cpf: '555.666.777-88',
            data_nascimento: '1985-10-20',
            email: 'mariana.silva@caofeliz.com',
            telefones: [{ numero: '(21) 95555-6666', tipo: 'principal' }],
            cargo: 'Sócia-Proprietária',
            is_responsavel_tecnico: false,
            is_veterinario: true,
            crmv: 'CRMV-RJ 12321',
            crmv_uf: 'RJ',
            crmv_status: 'verificado'
          }
        ]
      }
    ],
    servicos_contratados: [
      { id: 'sc3', servico_id: '1', servico_nome: 'Plano Poodle (Marketing Completo)', valor: 2300.00, data_inicio: '2022-11-20', is_active: true },
      { id: 'sc4', servico_id: '4', servico_nome: 'Plano Bulldog (Identidade Visual)', valor: 4500.00, data_inicio: '2022-10-15', is_active: false }
    ],
    status: 'ativo',
    historico_alteracoes: [],
    created_at: '2022-10-01T00:00:00Z',
    updated_at: '2023-11-05T00:00:00Z'
  },
  {
    id: '3',
    razao_social: 'Hospital Veterinário Salvando Vidas S.A.',
    nome_fantasia: 'HV Salvando Vidas',
    cnpj: '88.999.000/0001-11',
    email: 'diretoria@hvsalvandovidas.com.br',
    telefones: [{ numero: '(31) 3000-4000', tipo: 'principal' }],
    tipo_empresa: 'Hospital',
    porte: 'Grande',
    unidades: [
      {
        id: 'un3-1',
        nome_unidade: 'Sede Funcionários',
        endereco: {
          cep: '30130-170',
          logradouro: 'Rua Piauí',
          numero: '1000',
          bairro: 'Funcionários',
          cidade: 'Belo Horizonte',
          estado: 'MG',
          pais: 'Brasil',
        },
        telefones: [{ numero: '(31) 3000-4000', tipo: 'principal' }],
        is_matriz: true,
        representantes: [
          {
            id: 'rep3-1-1',
            nome_completo: 'Dr. Fernando Pereira',
            cpf: '888.999.000-11',
            data_nascimento: '1985-10-20',
            email: 'fernando.pereira@hvsalvandovidas.com.br',
            telefones: [{ numero: '(31) 98888-9999', tipo: 'principal' }],
            cargo: 'CEO e Diretor Técnico',
            is_responsavel_tecnico: true,
            is_veterinario: true,
            crmv: 'CRMV-MG 98765',
            crmv_uf: 'MG',
            crmv_status: 'verificado'
          }
        ]
      }
    ],
    servicos_contratados: [
      { id: 'sc5', servico_id: '1', servico_nome: 'Plano Poodle (Marketing Completo)', valor: 2500.00, data_inicio: '2024-01-05', is_active: true }
    ],
    status: 'ativo',
    historico_alteracoes: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '4',
    razao_social: 'Consultório Vet Fofura EIRELI',
    nome_fantasia: 'Consultório Vet Fofura',
    cnpj: '12.121.212/0001-21',
    email: 'contato@vetfofura.com',
    telefones: [{ numero: '(41) 3333-4444', tipo: 'principal' }],
    tipo_empresa: 'Consultório',
    porte: 'Pequena',
    unidades: [
      {
        id: 'un4-1',
        nome_unidade: 'Consultório Batel',
        endereco: {
          cep: '80420-090',
          logradouro: 'Av. do Batel',
          numero: '1800',
          bairro: 'Batel',
          cidade: 'Curitiba',
          estado: 'PR',
          pais: 'Brasil',
        },
        telefones: [{ numero: '(41) 3333-4444', tipo: 'principal' }],
        is_matriz: true,
        representantes: [
          {
            id: 'rep4-1-1',
            nome_completo: 'Dra. Sofia Bernardes',
            cpf: '121.314.516-17',
            data_nascimento: '1978-07-10',
            email: 'sofia.b@vetfofura.com',
            telefones: [{ numero: '(41) 91213-1415', tipo: 'principal' }],
            cargo: 'Veterinária Proprietária',
            is_responsavel_tecnico: true,
            is_veterinario: true,
            crmv: 'CRMV-PR 23456',
            crmv_uf: 'PR',
            crmv_status: 'verificado'
          }
        ]
      }
    ],
    servicos_contratados: [],
    status: 'ativo',
    historico_alteracoes: [],
    created_at: '2023-03-01T00:00:00Z',
    updated_at: '2023-03-01T00:00:00Z'
  },
  {
    id: '5',
    razao_social: 'PetShop Amigo Fiel ME',
    nome_fantasia: 'Amigo Fiel PetShop',
    cnpj: '98.765.432/0001-10',
    email: 'compras@amigofielpet.com',
    telefones: [{ numero: '(51) 3210-9876', tipo: 'principal' }],
    tipo_empresa: 'PetShop',
    porte: 'Média',
    unidades: [
      {
        id: 'un5-1',
        nome_unidade: 'Loja Moinhos de Vento',
        endereco: {
          cep: '90570-080',
          logradouro: 'Rua Padre Chagas',
          numero: '300',
          bairro: 'Moinhos de Vento',
          cidade: 'Porto Alegre',
          estado: 'RS',
          pais: 'Brasil',
        },
        telefones: [{ numero: '(51) 3210-9876', tipo: 'principal' }],
        is_matriz: true,
        representantes: [
          {
            id: 'rep5-1-1',
            nome_completo: 'João Pedro Azevedo',
            cpf: '987.654.321-00',
            data_nascimento: '1995-02-28',
            email: 'joaopedro@amigofielpet.com',
            telefones: [{ numero: '(51) 98765-4321', tipo: 'principal' }],
            cargo: 'Gerente Comercial',
            is_responsavel_tecnico: false,
            is_veterinario: false
          }
        ]
      }
    ],
    servicos_contratados: [],
    status: 'ativo',
    historico_alteracoes: [],
    created_at: '2023-03-01T00:00:00Z',
    updated_at: '2023-03-01T00:00:00Z'
  }
];

const mockUsuarios: Usuario[] = [
  {
    id: 'usr1',
    nome: 'Natália Cassus (Admin)',
    email: 'natalia.cassus@petpal.com',
    perfil: 'admin',
    status: 'ativo',
    avatar: '/avatars/avatar-natalia.png',
    created_at: '2023-01-01T08:00:00Z'
  },
  {
    id: 'usr2',
    nome: 'Ana Silva (Colaborador)',
    email: 'ana.silva@example.com',
    perfil: 'colaborador',
    status: 'ativo',
    avatar: '/avatars/avatar-ana.png',
    associacao_id: '1',
    associacao_nome: 'Ana Silva',
    created_at: '2023-01-10T10:00:00Z'
  },
  {
    id: 'usr3',
    nome: 'Roberto Lima Alves (Veterinário)',
    email: 'roberto.alves@example.com',
    perfil: 'colaborador',
    status: 'ativo',
    avatar: '/avatars/avatar-roberto.png',
    associacao_id: '4',
    associacao_nome: 'Dr. Roberto Lima Alves',
    created_at: '2023-01-15T11:00:00Z'
  },
  {
    id: 'usr4',
    nome: 'Ricardo Almeida (Sócio Cliente)',
    email: 'ricardo.almeida@aumiauvet.com.br',
    perfil: 'cliente',
    status: 'ativo',
    avatar: '/avatars/avatar-ricardo.png',
    associacao_id: 'rep1-1-1',
    associacao_nome: 'Dr. Ricardo Almeida',
    associacao_empresa: 'AuMiau VetCare',
    created_at: '2023-02-01T14:00:00Z'
  },
  {
    id: 'usr5',
    nome: 'Julia Ferreira (Financeiro)',
    email: 'julia.ferreira@petpal.com',
    perfil: 'financeiro',
    status: 'ativo',
    avatar: '/avatars/avatar-julia.png',
    created_at: '2023-02-20T09:30:00Z'
  },
  {
    id: 'usr6',
    nome: 'Beatriz Oliveira (Inativo)',
    email: 'beatriz.oliveira@example.com',
    perfil: 'colaborador',
    status: 'inativo',
    avatar: '/avatars/avatar-beatriz.png',
    associacao_id: '3',
    associacao_nome: 'Beatriz Oliveira',
    created_at: '2023-03-05T16:20:00Z'
  }
];

const mockReembolsos: Reembolso[] = [
  {
    id: 'reemb1',
    colaborador_id: '1',
    colaborador_nome: 'Ana Silva',
    valor: 150.75,
    descricao: 'Despesas com transporte para visita a cliente XYZ',
    data_solicitacao: '2023-11-10T10:00:00Z',
    status: 'aprovado',
    data_aprovacao_rejeicao: '2023-11-11T14:00:00Z'
  },
  {
    id: 'reemb2',
    colaborador_id: '2',
    colaborador_nome: 'Carlos Eduardo Mendes',
    valor: 320.00,
    descricao: 'Compra de material para congresso veterinário',
    data_solicitacao: '2023-11-15T15:30:00Z',
    status: 'pendente',
    comprovante_url: '/comprovantes/congresso.pdf'
  },
  {
    id: 'reemb3',
    colaborador_id: '4',
    colaborador_nome: 'Dr. Roberto Lima Alves',
    valor: 85.50,
    descricao: 'Almoço com cliente PetShop Grande Porte',
    data_solicitacao: '2023-11-20T12:00:00Z',
    status: 'rejeitado',
    data_aprovacao_rejeicao: '2023-11-21T09:15:00Z',
    motivo_rejeicao: 'Despesa não autorizada previamente.'
  },
  {
    id: 'reemb4',
    colaborador_id: '1',
    colaborador_nome: 'Ana Silva',
    valor: 55.00,
    descricao: 'Café da manhã com equipe para planejamento',
    data_solicitacao: '2023-12-01T09:00:00Z',
    status: 'pendente',
  }
];

const mockAgencia: Agencia = {
  id: '1',
  razao_social: 'PetPal Agência de Marketing Digital Ltda.',
  nome_fantasia: 'PetPal Manager',
  cnpj: '12.345.678/0001-99',
  data_fundacao: '2022-01-01',
  endereco: {
    cep: '01310-100',
    logradouro: 'Av. Paulista',
    numero: '2000',
    complemento: 'Andar 10',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    pais: 'Brasil',
  },
  telefones: [{ numero: '+55 (11) 3000-1000', tipo: 'principal' }, {numero: '+55 (11) 99999-1000', tipo: 'celular'}],
  socios: [
    {
      id: 'socio_ag_1',
      nome_completo: 'Natália Cassus',
      cpf: '777.888.999-00',
      data_nascimento: '1988-07-15',
      email: 'natalia@petpalmanager.com',
      telefone: '(11) 99999-7777',
      is_veterinario: false
    },
    {
      id: 'socio_ag_2',
      nome_completo: 'Dr. Pedro Henrique Oliveira',
      cpf: '888.999.000-11',
      data_nascimento: '1982-11-30',
      email: 'pedro@petpalmanager.com',
      telefone: '(11) 99999-8888',
      is_veterinario: true,
      crmv: 'CRMV-SP 99999',
      crmv_uf: 'SP',
      crmv_status: 'verificado' // "Ativo - Pedro Henrique Oliveira - SP"
    }
  ],
  logo_url: '/logos/petpal-logo-completa.png',
  favicon_url: '/logos/petpal-favicon.png'
};

const mockContratoTemplates: ContratoTemplate[] = [
  {
    id: 'tmpl_colab_001',
    nome: 'Contrato Padrão de Prestação de Serviços (Colaborador PJ)',
    tipo: 'colaborador',
    conteudo: `
      <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>
      <p>Contratante: {AGENCIA_RAZAO_SOCIAL}, CNPJ {AGENCIA_CNPJ}</p>
      <p>Contratado: {COLABORADOR_NOME_COMPLETO}, CPF {COLABORADOR_CPF}</p>
      <p>Objeto: Prestação de serviços de {COLABORADOR_CARGO}.</p>
      <p>Remuneração: R$ {COLABORADOR_SALARIO}</p>
      <p>Data de Início: {COLABORADOR_DATA_CONTRATACAO}</p>
      <p>Cláusulas...</p>
      <p>Assinaturas:</p>
      <p>_________________________</p>
      <p>{AGENCIA_SOCIO_ASSINATURA_NOME} (Sócio Agência)</p>
      <p>_________________________</p>
      <p>{COLABORADOR_NOME_COMPLETO} (Colaborador)</p>
    `,
    variaveis_disponiveis: [
      '{AGENCIA_RAZAO_SOCIAL}', '{AGENCIA_CNPJ}', '{AGENCIA_ENDERECO}', '{AGENCIA_SOCIO_ASSINATURA_NOME}', '{AGENCIA_SOCIO_ASSINATURA_CPF}',
      '{COLABORADOR_NOME_COMPLETO}', '{COLABORADOR_CPF}', '{COLABORADOR_RG}', '{COLABORADOR_ENDERECO}', 
      '{COLABORADOR_CARGO}', '{COLABORADOR_SALARIO}', '{COLABORADOR_DATA_CONTRATACAO}'
    ],
    versao: '1.0',
    is_active: true,
    created_at: '2023-10-01T10:00:00Z',
    updated_at: '2023-10-01T10:00:00Z',
  },
  {
    id: 'tmpl_cli_001',
    nome: 'Contrato Padrão de Agenciamento (Cliente)',
    tipo: 'cliente',
    conteudo: `
      <h1>CONTRATO DE AGENCIAMENTO E PRESTAÇÃO DE SERVIÇOS</h1>
      <p>Contratante: {CLIENTE_RAZAO_SOCIAL}, CNPJ {CLIENTE_CNPJ}</p>
      <p>Representada por: {CLIENTE_REPRESENTANTE_NOME}, CPF {CLIENTE_REPRESENTANTE_CPF}</p>
      <p>Contratada: {AGENCIA_RAZAO_SOCIAL}, CNPJ {AGENCIA_CNPJ}</p>
      <p>Representada por: {AGENCIA_SOCIO_ASSINATURA_NOME}, CPF {AGENCIA_SOCIO_ASSINATURA_CPF}</p>
      <h2>SERVIÇOS CONTRATADOS</h2>
      <p>Serviço: {SERVICO_NOME}</p>
      <p>Descrição: {SERVICO_DESCRICAO}</p>
      <p>Valor Mensal: R$ {SERVICO_VALOR}</p>
      <p>Data de Início: {DATA_INICIO_CONTRATO}</p>
      <p>Cláusulas...</p>
      <p>Assinaturas:</p>
      <p>_________________________</p>
      <p>{CLIENTE_REPRESENTANTE_NOME} (Representante Cliente)</p>
      <p>_________________________</p>
      <p>{AGENCIA_SOCIO_ASSINATURA_NOME} (Sócio Agência)</p>
    `,
    variaveis_disponiveis: [
      '{CLIENTE_RAZAO_SOCIAL}', '{CLIENTE_CNPJ}', '{CLIENTE_NOME_FANTASIA}', '{CLIENTE_ENDERECO_PRINCIPAL}', 
      '{CLIENTE_REPRESENTANTE_NOME}', '{CLIENTE_REPRESENTANTE_CPF}', '{CLIENTE_REPRESENTANTE_EMAIL}', '{CLIENTE_REPRESENTANTE_CARGO}',
      '{AGENCIA_RAZAO_SOCIAL}', '{AGENCIA_CNPJ}', '{AGENCIA_ENDERECO}', '{AGENCIA_SOCIO_ASSINATURA_NOME}', '{AGENCIA_SOCIO_ASSINATURA_CPF}',
      '{SERVICO_NOME}', '{SERVICO_DESCRICAO}', '{SERVICO_VALOR}', '{SERVICO_PERIODICIDADE}',
      '{DATA_INICIO_CONTRATO}', '{DATA_FIM_CONTRATO}', '{NUMERO_CONTRATO}'
    ],
    versao: '1.2',
    is_active: true,
    created_at: '2023-11-05T14:00:00Z',
    updated_at: '2024-01-15T09:30:00Z',
  }
];

const mockContratosGerados: ContratoGerado[] = []; // Começa vazio, será populado pela aplicação

// Mock para DashboardStats
const mockDashboardStats: DashboardStats = {
  totalColaboradores: mockColaboradores.filter(c => c.is_active).length,
  totalClientes: mockClientes.filter(c => c.status === 'ativo').length,
  reembolsosPendentes: mockReembolsos.filter(r => r.status === 'pendente').length,
  faturamentoMensal: mockClientes.reduce((total, cliente) => {
    return total + cliente.servicos_contratados
      .filter(s => s.is_active)
      .reduce((subtotal, servico) => subtotal + servico.valor, 0);
  }, 0),
  atividadesRecentes: [
    { id: 'act1', acao: 'Novo cliente "PetShop Cão Feliz e Cia Ltda." cadastrado.', timestamp: '2023-12-01T10:00:00Z', usuario_email: 'natalia.cassus@petpal.com' },
    { id: 'act2', acao: 'Colaborador "Ana Silva" atualizou seu perfil.', timestamp: '2023-12-01T09:30:00Z', usuario_email: 'ana.silva@example.com' },
    { id: 'act3', acao: 'Reembolso de R$ 150,75 para "Ana Silva" aprovado.', timestamp: '2023-11-30T14:00:00Z', usuario_email: 'julia.ferreira@petpal.com' },
    { id: 'act4', acao: 'Novo template de contrato "Contrato Padrão Cliente" criado.', timestamp: '2023-11-29T11:00:00Z', usuario_email: 'natalia.cassus@petpal.com' },
  ],
};

const mockData = {
  mockColaboradores,
  mockServicos,
  mockClientes,
  mockUsuarios,
  mockReembolsos,
  mockAgencia,
  mockContratoTemplates,
  mockContratosGerados,
  mockDashboardStats, // Adicionando mockDashboardStats aqui
};

// Exportações nomeadas para facilitar importação
export { mockColaboradores };
export { mockServicos };
export { mockClientes };
export { mockUsuarios };
export { mockReembolsos };
export { mockAgencia };
export { mockContratoTemplates };
export { mockContratosGerados };
export { mockDashboardStats };

export default mockData; 