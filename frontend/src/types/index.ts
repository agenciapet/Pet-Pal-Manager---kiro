/*
export interface Telefone {
  id?: string; // Se vier da API com ID
  numero: string;
  tipo: 'principal' | 'celular' | 'trabalho' | 'casa' | 'outro';
  is_primary?: boolean;
}

export interface Endereco {
  id?: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais?: string;
}

export interface DadosBancarios {
  id?: string;
  banco: string;
  agencia: string;
  conta: string;
  tipo_conta?: 'corrente' | 'poupanca' | 'pagamento';
  chave_pix?: string;
  tipo_chave_pix?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
}
*/

export interface Colaborador {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string | null; // API pode retornar string ou null
  email: string;
  // telefones: Telefone[]; // Comentado temporariamente devido à dependência
  // endereco: Endereco; // Comentado temporariamente devido à dependência
  cargo: string;
  salario: number;
  data_contratacao: string; // API pode retornar string
  is_active: boolean;
  is_veterinario?: boolean;
  crmv?: string | null;
  crmv_uf?: string | null;
  crmv_status?: 'verificado' | 'pendente' | 'invalido' | 'nao_aplicavel' | null | undefined;
  // dados_bancarios?: DadosBancarios; // Comentado temporariamente devido à dependência
  contrato_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Você pode adicionar outras interfaces/tipos globais aqui

export default {}; // Adicionado para ajudar na detecção do módulo 