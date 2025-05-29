// Tipos para Colaborador
export interface Colaborador {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string | null;
  email: string;
  telefones?: any[];
  endereco?: any;
  cargo: string;
  salario: number;
  data_contratacao: string;
  is_active: boolean;
  is_veterinario?: boolean;
  crmv?: string | null;
  crmv_uf?: string | null;
  crmv_status?: 'verificado' | 'pendente' | 'invalido' | 'nao_aplicavel' | null | undefined;
  dados_bancarios?: any;
  contrato_id?: string | null;
  created_at?: string;
  updated_at?: string;
} 