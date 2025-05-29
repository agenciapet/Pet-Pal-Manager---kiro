### Checklist de Funcionalidades Pendentes (Visão Geral)

#### Gestão de Agência
*   [X] Visualizar dados da Agência
*   [X] Editar dados da Agência (incluindo múltiplos telefones, país no endereço, data de nascimento para sócios)
*   [ ] Gerenciar documentos da agência (Contrato Social, Alvará, etc. - atualmente apenas mockado na visualização)
*   [ ] Gestão de permissões para sócios (quem pode editar o quê)

#### Gestão de Colaboradores
*   [X] Cadastrar novo colaborador
*   [X] Visualizar detalhes do colaborador (com múltiplos telefones, idade, país, etc.)
*   [X] Editar dados do colaborador
*   [X] Listar colaboradores
*   [X] Histórico de alterações para Colaboradores (implementado implicitamente via `updated_at`, mas poderia ser detalhado como fizemos para clientes)
*   [X] Inativar/Reativar colaborador (implementado com validação de UUID, logs de auditoria e interface frontend completa)
*   [ ] Gestão de Férias/Ausências
*   [ ] Avaliação de Desempenho
*   [ ] Documentos do colaborador (contrato, RG, CPF - upload e visualização)

#### Gestão de Clientes
*   [X] Cadastrar novo cliente
*   [X] Visualizar detalhes do cliente (com múltiplos telefones, país, data de nascimento para representantes, status, histórico de alterações)
*   [X] Editar dados do cliente
*   [X] Listar clientes (com filtros e exibição de status)
*   [X] Alterar status do cliente (ativo, inadimplente, cancelado, inativo, etc.)
*   [X] Múltiplas unidades por cliente
*   [X] Múltiplos representantes por unidade
*   [ ] Múltiplos telefones para:
    *   [X] Cliente (Empresa) - *Implementamos o primeiro telefone no formulário, mas a interface `Cliente` em `mockData` já suporta `telefones: array`.*
    *   [X] Unidades do Cliente
    *   [X] Representantes do Cliente
*   [ ] Gestão de Serviços Contratados por Cliente:
    *   [X] Listar serviços contratados na tela de detalhes do cliente (básico)
    *   [ ] Adicionar/Remover/Editar serviços contratados para um cliente (atualmente apenas via mock)
    *   [ ] Histórico de serviços contratados (ativações, cancelamentos, alterações de plano)
*   [ ] Gestão de Contratos de Clientes (vinculado à funcionalidade de Contratos Gerados)
*   [ ] Segmentação avançada de clientes (tags, categorias personalizadas)

#### Gestão de Serviços (Oferecidos pela Agência)
*   [ ] CRUD completo para Serviços (criar, ler, atualizar, deletar) - *Atualmente apenas listados e usados em mock.*
*   [ ] Definir tipos de serviço, categorias, precificação detalhada

#### Gestão de Contratos (Templates e Geração)
*   [X] CRUD para Templates de Contrato (criar, ler, atualizar, deletar) - *Assumindo que há uma interface para isso, mas não a construímos visualmente.*
*   [X] Gerar Contrato a partir de um Template para Colaborador ou Cliente
*   [X] Página de Assinatura de Contrato (com coleta de dados de auditoria)
*   [X] Visualizar Contratos Gerados e seus status
*   [X] Listar signatários e seus status de assinatura
*   [X] Visualizar dados de auditoria da assinatura
*   [ ] Envio de lembretes de assinatura
*   [ ] Upload de contratos externos (PDFs já assinados)
*   [ ] Versionamento de templates de contrato (já na interface, mas sem UI para gerenciar)
*   [ ] Fluxos de aprovação interna antes do envio para assinatura

#### Financeiro
*   [ ] Gestão de Reembolsos (CRUD completo, aprovação/rejeição com justificativa) - *Temos a listagem e o mock.*
*   [ ] Lançamento de Contas a Pagar/Receber
*   [ ] Conciliação Bancária
*   [ ] Geração de Faturas/Boletos para clientes (baseado nos serviços contratados)
*   [ ] Relatórios financeiros (fluxo de caixa, DRE simplificado, inadimplência)
*   [ ] Integração com gateways de pagamento

#### Dashboard e Relatórios
*   [X] Dashboard inicial com estatísticas básicas (colaboradores, clientes, reembolsos, faturamento)
*   [ ] Relatórios mais detalhados (performance de clientes, crescimento, etc.)
*   [ ] Personalização do Dashboard

#### Usuários e Permissões
*   [X] Listagem de Usuários (básica)
*   [ ] CRUD de Usuários
*   [ ] Atribuição de Perfis de Acesso (Admin, Financeiro, Colaborador, Cliente)
*   [ ] Controle de permissões mais granular por funcionalidade

#### Configurações Gerais do Sistema
*   [ ] Configurações da aplicação (ex: nome da empresa para templates, e-mails padrão)
*   [ ] Gerenciamento de Notificações (preferências)

#### Questões Técnicas e Melhorias
*   [ ] **Persistência de Dados Real**: Atualmente, tudo é salvo em `mockData` e, em alguns casos, no `localStorage`. Um backend real com banco de dados é essencial.
*   [ ] **Autenticação e Autorização Seguras**: Implementar um sistema de login robusto.
*   [ ] **Tratamento de Erros e Feedback ao Usuário**: Melhorar mensagens de erro, toasts para sucesso/falha.
*   [ ] **Validações de Formulário**: Aprimorar validações (tanto no frontend quanto no backend).
*   [ ] **Testes Automatizados**: Unitários, integração, E2E.
*   [ ] **Otimização de Performance**: Especialmente com listas grandes.
*   [ ] **Melhorias de UI/UX**: Refinamentos visuais, acessibilidade.
*   [X] **Resolução de TODOs e comentários no código.** (Fizemos alguns)
*   [ ] **Remoção completa de `console.log` de debug.**
*   [ ] **Internacionalização (i18n)**: Se o sistema precisar suportar múltiplos idiomas.
*   [X] **Tipagem TypeScript**: Manter a consistência e corrigir erros (trabalho contínuo).
*   [ ] **Documentação técnica e de usuário.** 