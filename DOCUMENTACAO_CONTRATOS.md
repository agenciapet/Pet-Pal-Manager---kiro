## Documentação do Sistema de Gestão de Contratos - PetPal Manager (PPM)

**Versão:** 1.0 (Implementação Inicial)
**Data:** 20/07/2024

### 1. Visão Geral

O Sistema de Gestão de Contratos é um módulo integrado ao PetPal Manager (PPM) projetado para facilitar a criação, o gerenciamento e o acompanhamento de contratos com clientes e colaboradores. Ele permite a padronização de documentos através de templates, a geração dinâmica de contratos preenchidos com dados do sistema e, futuramente, a gestão do processo de assinatura eletrônica.

### 2. Estrutura de Dados Principal

O sistema se baseia em três interfaces de dados principais, localizadas em `frontend/src/data/mockData.ts`:

*   **`ContratoTemplate`**: Define a estrutura dos modelos de contrato.
    *   `id`: Identificador único do template.
    *   `nome`: Nome descritivo do template (ex: "Contrato de Prestação de Serviços PJ").
    *   `tipo`: Especifica se o template é para `'colaborador'` ou `'cliente'`.
    *   `conteudo`: String HTML contendo o corpo do contrato, com placeholders para variáveis (ex: `{NOME_COMPLETO}`, `{RAZAO_SOCIAL}`).
    *   `variaveis_disponiveis`: Array de strings listando todos os placeholders válidos para aquele template.
    *   `versao`: String para controle de versionamento do template (ex: "1.0", "1.1-beta").
    *   `is_active`: Booleano indicando se o template está ativo e pode ser usado para gerar novos contratos.
    *   `created_at`, `updated_at`: Timestamps de criação e última atualização.

*   **`SignatarioContrato`**: Representa uma parte que deve assinar um contrato gerado.
    *   `tipo_parte`: Define o tipo de signatário (ex: `'colaborador'`, `'cliente_representante'`, `'agencia_socio'`).
    *   `id_parte`: ID da entidade no sistema (colaborador, representante, sócio) associada ao signatário.
    *   `nome`: Nome completo do signatário.
    *   `email`: E-mail do signatário para o processo de assinatura.
    *   `cpf_cnpj`: CPF ou CNPJ do signatário.
    *   `status_assinatura`: Status atual da assinatura (`'pendente'`, `'assinado'`).
    *   `data_assinatura`: Data da assinatura (opcional).

*   **`ContratoGerado`**: Representa um contrato efetivamente criado a partir de um template.
    *   `id`: Identificador único do contrato gerado.
    *   `template_id`, `template_nome`, `template_versao`: Referência ao template utilizado.
    *   `tipo_contrato`: `'colaborador'` ou `'cliente'`.
    *   `entidade_id`, `entidade_nome`: Identificação do cliente ou colaborador ao qual o contrato se refere.
    *   `pdf_url_original`, `pdf_url_assinado`: URLs para os PDFs do contrato (a serem implementados).
    *   `signatarios`: Array de objetos `SignatarioContrato`.
    *   `status_geral`: Status geral do contrato (ex: `'rascunho'`, `'aguardando_assinaturas'`, `'assinado'`).
    *   `dados_snapshot`: Objeto JSON armazenando os dados exatos (do template, entidade, agência e variáveis) utilizados no momento da geração do contrato, para fins de auditoria.
    *   `data_geracao`, `data_envio_assinatura`, `data_ultima_assinatura`, `data_conclusao`: Datas relevantes do ciclo de vida do contrato.
    *   `created_at`, `updated_at`: Timestamps.

### 3. Funcionalidades Implementadas

#### 3.1. Gerenciamento de Templates de Contrato

*   **Acesso**: Menu "Templates de Contrato" (visível para perfil `admin`).
*   **Localização**: `frontend/src/pages/Contratos/TemplatesContrato.tsx`.
*   **Listagem de Templates**:
    *   Exibe todos os templates cadastrados em formato de cards.
    *   Cada card mostra: Nome, Versão, Tipo (Cliente/Colaborador), Status (Ativo/Inativo), um trecho das variáveis disponíveis e datas de criação/atualização.
    *   Ações disponíveis por template:
        *   **Gerar Contrato**: Inicia o fluxo de geração de um novo contrato usando aquele template.
        *   **Visualizar**: (Placeholder) Visualizar detalhes do template.
        *   **Editar**: Abre o formulário para modificar o template.
        *   **Excluir**: (Placeholder) Remover o template.
    *   Botão "Novo Template" para acessar o formulário de criação.
*   **Formulário de Template (Cadastro e Edição)**:
    *   **Localização**: `frontend/src/pages/Contratos/FormTemplateContrato.tsx`.
    *   **Campos**:
        *   Nome do Template (obrigatório).
        *   Tipo (select: "Para Cliente" ou "Para Colaborador", obrigatório).
        *   Versão (obrigatório, ex: "1.0").
        *   Template Ativo (checkbox).
        *   Conteúdo do Template (Textarea para HTML, obrigatório):
            *   Permite a inserção de código HTML que formará o corpo do contrato.
            *   Suporta o uso de placeholders (variáveis) entre chaves, como `{VARIAVEL_EXEMPLO}`.
        *   Variáveis Disponíveis:
            *   Interface para adicionar e remover as strings dos placeholders (ex: `{NOME_CLIENTE}`, `{CPF_COLABORADOR}`) que são utilizados no conteúdo HTML.
            *   O sistema formata automaticamente as variáveis para incluir chaves `{}` se não forem inseridas.
            *   Pelo menos uma variável deve ser adicionada.
    *   **Ações**: Salvar (criar/atualizar) ou Cancelar.

#### 3.2. Geração de Contratos

Este é um fluxo de múltiplas etapas:

1.  **Início**: A partir da lista de templates, clicando em "Gerar Contrato" em um template específico.
2.  **Seleção da Entidade**:
    *   **Localização**: `frontend/src/pages/Contratos/SelecionarEntidadeContrato.tsx`.
    *   O sistema identifica o `tipo` do template (cliente ou colaborador).
    *   Lista os clientes ativos ou colaboradores ativos correspondentes.
    *   Permite filtrar a lista por nome/razão social, CPF/CNPJ.
    *   Ao selecionar uma entidade, o usuário avança para a próxima etapa.
3.  **Preenchimento e Pré-visualização do Contrato**:
    *   **Localização**: `frontend/src/pages/Contratos/PreencherContrato.tsx`.
    *   **Carregamento de Dados**:
        *   Carrega o `ContratoTemplate` selecionado.
        *   Carrega os dados da `Entidade` (Cliente ou Colaborador) selecionada.
        *   Carrega dados da `Agencia` (PetPal Manager) para preenchimento de variáveis da contratada.
    *   **Pré-visualização Dinâmica**:
        *   O conteúdo HTML do template é renderizado.
        *   As variáveis (placeholders) no HTML são substituídas pelos dados reais da agência, cliente/colaborador.
            *   Exemplos: `{AGENCIA_RAZAO_SOCIAL}`, `{COLABORADOR_NOME_COMPLETO}`, `{CLIENTE_CNPJ}`.
            *   Variáveis não encontradas são marcadas como `[PENDENTE]` no preview.
    *   **Signatários**:
        *   Uma lista inicial de signatários é automaticamente sugerida com base no tipo de contrato e nas entidades envolvidas (ex: o próprio colaborador, o primeiro representante da matriz do cliente, o primeiro sócio da agência).
        *   (Funcionalidade de adicionar/editar/remover signatários manualmente ainda não implementada nesta tela).
    *   **Salvamento**:
        *   Botão "Salvar Rascunho do Contrato".
        *   Cria um novo registro `ContratoGerado` com:
            *   Status: `'rascunho'`.
            *   Referências ao template e entidade.
            *   `dados_snapshot`: Um JSON com todos os dados relevantes (template, entidade, agência, variáveis preenchidas) usados na geração.
            *   Lista de signatários inicial.
        *   Os dados do contrato gerado são salvos no `localStorage` (simulando persistência) e no array `mockContratosGerados` em memória.
        *   O usuário é redirecionado para a lista de "Contratos Gerados".

#### 3.3. Gerenciamento de Contratos Gerados

*   **Acesso**: Menu "Contratos Gerados" (visível para perfil `admin`).
*   **Localização**: `frontend/src/pages/Contratos/ContratosGerados.tsx`.
*   **Listagem de Contratos**:
    *   Exibe todos os contratos gerados, carregados do `localStorage` e ordenados por data de criação (mais recentes primeiro).
    *   Cada card mostra: Nome do template, Versão do template, Nome da entidade, Tipo (Cliente/Colaborador), Status atual, Datas de geração/atualização e um resumo dos signatários.
    *   **Filtros**:
        *   Por nome da entidade ou nome do template.
        *   Por Status do contrato (Rascunho, Aguardando Assinaturas, etc.).
        *   Por Tipo de contrato (Cliente, Colaborador).
    *   **Ações disponíveis por contrato (variam conforme o status)**:
        *   **Ver Detalhes**: (Placeholder) Abrir uma tela com todos os detalhes do contrato.
        *   **Editar**: Se o contrato estiver como `'rascunho'`, permite reabrir na tela de "Preenchimento e Pré-visualização" para continuar a edição.
        *   **Enviar/Reenviar**: (Placeholder) Iniciar/Retomar o processo de envio para assinatura (para status `'rascunho'` ou `'aguardando_assinaturas'`).
        *   **Cancelar**: Altera o status do contrato para `'cancelado'` (se não estiver já assinado ou cancelado). A alteração é persistida no `localStorage`.
    *   Botão "Gerar Novo Contrato" que redireciona para a lista de templates.

### 4. Componentes UI Reutilizáveis Adicionados

*   `frontend/src/components/ui/textarea.tsx`: Componente `Textarea` customizado.
*   `frontend/src/components/ui/select.tsx`: Componente `Select` customizado, utilizando `@radix-ui/react-select`.

### 5. Fluxo de Navegação Principal

1.  Usuário (admin) acessa "Templates de Contrato".
2.  Cria um novo template ou escolhe um existente e clica em "Gerar Contrato".
3.  É direcionado para "Selecionar Entidade", onde escolhe um cliente ou colaborador.
4.  É direcionado para "Revisar e Gerar Contrato", onde confere o preview e os signatários.
5.  Clica em "Salvar Rascunho do Contrato".
6.  É direcionado para "Contratos Gerados", onde o novo contrato aparece listado.
7.  Na lista de "Contratos Gerados", pode filtrar, visualizar (futuro), editar (se rascunho), enviar (futuro) ou cancelar.

### 6. Considerações Técnicas

*   **Estado e Dados Mockados**: Atualmente, os dados são gerenciados em memória (`mockData.ts`) e parcialmente persistidos no `localStorage` para simular um backend. Em uma aplicação real, seria necessário integrar com uma API e banco de dados.
*   **Variáveis de Template**: O sistema de substituição de variáveis é simples e baseado em `string.replace()`. Para cenários mais complexos, um motor de templating mais robusto poderia ser considerado.
*   **Segurança**: As rotas de contrato são protegidas e acessíveis apenas por usuários com perfil `admin`.

### 7. Próximas Etapas e Melhorias Potenciais

*   **Visualização Detalhada de Contratos Gerados**: Implementar uma página dedicada para exibir todas as informações de um contrato, incluindo o conteúdo HTML renderizado (ou o PDF) e o status detalhado de cada signatário.
*   **Geração de PDF**: Integrar uma biblioteca (ex: `html2pdf.js`, `jsPDF` com `html2canvas`) para converter o conteúdo HTML do contrato em um arquivo PDF que possa ser baixado ou armazenado.
*   **Sistema de Assinatura Eletrônica**:
    *   Desenvolver um fluxo para enviar e-mails/notificações aos signatários com links únicos para uma página de assinatura.
    *   Criar uma página de assinatura onde o usuário pode visualizar o contrato e "assinar" (inicialmente, pode ser um simples checkbox de aceite ou um campo para desenhar a assinatura).
    *   Atualizar o status de cada signatário e o status geral do contrato conforme as assinaturas são coletadas.
*   **Edição de Signatários**: Permitir adicionar, remover ou modificar os signatários na tela de "Preenchimento e Pré-visualização do Contrato".
*   **Inputs para Variáveis Pendentes**: Na tela de pré-visualização, se houver variáveis marcadas como `[PENDENTE]`, oferecer campos de input para o usuário preenchê-las manualmente antes de salvar o rascunho.
*   **Versionamento e Histórico de Contratos Gerados**: Manter um histórico de versões ou alterações importantes em contratos gerados.
*   **Notificações**: Implementar notificações para eventos importantes (ex: contrato assinado, assinatura pendente).
*   **Melhorias na UI/UX**: Refinamentos visuais, feedback mais claro ao usuário, e otimizações de usabilidade.
*   **Testes**: Adicionar testes unitários e de integração. 