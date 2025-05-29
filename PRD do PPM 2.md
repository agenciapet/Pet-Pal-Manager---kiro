# **Documento de Requisitos do Produto (PRD)**

## **Sistema de Gestão Empresarial Integrado: PetPal Manager \- PPM**

### **1\. Visão Geral**

**Objetivo**: Desenvolver o PPM **PetPal Manager**, um sistema de gestão empresarial integrado para uma agência, com dois módulos principais: Gestão de Colaboradores e Gestão de Clientes (Empresas). O sistema será intuitivo, seguro, escalável e em conformidade com a LGPD, atendendo às necessidades operacionais e financeiras da agência, totalmente em português do Brasil (pt-br).

**Público-Alvo**:

* Administradores da agência (gestão de colaboradores, clientes, serviços e usuários).  
* Colaboradores (acesso a dados pessoais, contratos e reembolsos).  
* Clientes empresariais (empresas de diversos setores, com acesso a dados, contratos e faturas).  
* Sócios da agência e de empresas clientes (acesso a dados e contratos).

**Escopo**:

* **Módulo 1**: Gestão de Colaboradores – Cadastro, contratos, finanças e reembolsos.  
* **Módulo 2**: Gestão de Clientes – Cadastro empresarial, gestão de filiais, representantes, contratos e financeiro.  
* **Módulo 3**: Gestão de Serviços – Cadastro e gerenciamento de serviços prestados.  
* **Módulo 4**: Cadastro da Agência – Dados da agência e seus sócios.  
* **Módulo 5**: Gerenciamento de Usuários – Controle de acesso e permissões.  
* Requisitos técnicos: Interface amigável, banco de dados relacional, backups, permissões, relatórios e conformidade com LGPD.  
* Todo o sistema, incluindo interface, mensagens, relatórios e documentação, será em português do Brasil (pt-br).

**Definição de MVP**:

* Funcionalidades marcadas com **\[MVP\]** são prioritárias para a primeira versão.  
* Funcionalidades marcadas com **\[Futuro\]** serão implementadas em iterações posteriores.

### **2\. Requisitos Funcionais**

#### **2.1 Módulo 1 \- Gestão de Colaboradores**

**Objetivo**: Gerenciar informações de colaboradores, contratos, finanças e reembolsos de forma centralizada, integrando com a API do banco Cora para pagamentos.

**Funcionalidades**:

1. **Cadastro de Colaboradores \[MVP\]**

   * Campos obrigatórios:  
     * Dados pessoais: Nome completo, CPF, RG digitalizado (upload de arquivo), data de nascimento.  
     * **Endereço \[MVP\]**:  
       * CEP (preenchimento automático via API, ex.: ViaCEP, retornando logradouro, bairro, cidade, estado).  
       * Campos manuais (caso API não retorne): Logradouro, bairro, cidade, estado, país.  
     * **Telefones \[MVP\]**:  
       * Suporte a múltiplos telefones.  
       * Campos: País (dropdown com Brasil como padrão), número do telefone.  
       * Validação por país:  
         * Brasil: DDD (2 dígitos) \+ Telefone (8 ou 9 dígitos).  
         * Portugal: 9 dígitos.  
         * Outros países: Padrão conforme biblioteca internacional (ex.: libphonenumber).  
     * Contratuais: Data de contratação, versão do contrato (seleção de contrato ativo), salário.  
     * Bancários: Banco, agência, conta, chave PIX.  
   * **Validação de CPF \[MVP\]**:  
     * Após digitação, verificar existência do CPF via API pública (ex.: Receita Federal ou similar).  
     * Exibir mensagem de erro em pt-br se inválido (ex.: "CPF inválido ou não encontrado").  
   * **Verificação de Veterinário \[MVP\]**:  
     * Toggle: “É veterinário?”.  
     * Se ativado, exibir campos: Número do CRMV, Estado (UF).  
     * Ícone de verificação ao lado do CRMV:  
       * **Busca no CFMV \[MVP\]**:  
         * Armazenar CRMV \+ UF.  
         * Via scraping com cache e controle de requisições, consultar o portal do CFMV ([https://www.cfmv.gov.br/busca-por-profissionais/servicos/2018/10/09/](https://www.cfmv.gov.br/busca-por-profissionais/servicos/2018/10/09/)).  
         * Retornar: Nome do profissional, status do registro (ativo/inativo), estado de atuação, data de verificação.  
         * Respeitar termos de uso do CFMV, evitando sobrecarga do servidor.  
       * Exibir status em pt-br (ex.: “Ativo \- João Silva \- SP”) ou erro se inválido (ex.: “CRMV inválido”).  
   * Validações: CPF único, formatos válidos para RG, CEP, chave PIX, CRMV.  
   * Interface e mensagens em pt-br (ex.: "Preencha todos os campos obrigatórios").  
2. **Gestão de Contratos \[MVP\]**

   * **Armazenamento de Textos \[MVP\]**:  
     * Administrador cadastra textos de contratos em editor de texto rico (em pt-br).  
     * Campos: Nome do contrato, versão (ex.: “v1.0”), texto, data de criação.  
     * Suporte a variáveis no texto do contrato (ex.: `{NOME_COMPLETO}`, `{CPF}`, `{DATA_CONTRATACAO}`, `{AGENCIA_RAZAO_SOCIAL}`, `{AGENCIA_CNPJ}`, `{AGENCIA_SOCIO_NOME}`), definidas pelo administrador.  
     * Variáveis são substituídas automaticamente pelos dados do colaborador, agência e sócios da agência ao gerar o contrato.  
   * **Versionamento Manual \[MVP\]**:  
     * Administrador informa quando criar nova versão (ex.: “v1.1”).  
     * Sistema armazena histórico de versões.  
   * **Assinatura Digital via Gov.br \[MVP\]**:  
     * **Geração de PDF**:  
       * Na tela de cadastro do colaborador, opção para gerar contrato em PDF/A-1b.  
       * Sistema preenche variáveis do contrato com dados do colaborador, agência e pelo menos um sócio da agência.  
       * PDF gerado com identificador único (hash ou UUID).  
     * **Link Seguro**:  
       * Geração de link criptografado e expirável (ex.: válido por 7 dias, com token JWT).  
       * Link associado ao colaborador e à versão do contrato.  
       * Envio do link por e-mail automático em pt-br para o colaborador, agência e pelo menos um sócio da agência (assunto: “Assinatura do Contrato \[Nome do Contrato\]”).  
     * **Tela do Link**:  
       * Botão para download do PDF (rótulo: “Baixar Contrato”).  
       * Instruções para assinatura via Gov.br (em pt-br):  
         * Acesse o site: [https://www.gov.br/pt-br/servicos/assinatura-eletronica](https://www.gov.br/pt-br/servicos/assinatura-eletronica) (link clicável, nova aba).  
         * Faça login com sua conta Gov.br (nível prata ou ouro).  
         * Envie o PDF baixado para a plataforma Gov.br.  
         * Siga os passos para assinar eletronicamente.  
         * Baixe o PDF assinado e retorne para upload.  
       * Campo para upload do PDF assinado (rótulo: “Enviar Contrato Assinado”).  
     * **Validação da Assinatura \[MVP\]**:  
       * **Opção 1: Verificação Local**:  
         * Usar bibliotecas (ex.: PyPDF2, pikepdf, PyHanko) para detectar camadas de assinatura, extrair assinante, data/hora, certificado e verificar integridade.  
       * **Opção 2: Validação Externa**:  
         * Usar API de validação (ex.: ICP-Brasil, Serpro) para confirmação jurídica.  
       * Habilitar botão “Enviar Contrato Assinado” após validação.  
       * Armazenar contrato assinado no banco de dados, vinculado ao colaborador, agência e sócios da agência.  
       * Notificação automática em pt-br ao administrador (ex.: “Contrato de \[Nome do Colaborador\] assinado”).  
   * **Notificação de Atualização \[MVP\]**:  
     * Ao criar nova versão, gerar template de e-mail em pt-br:  
       * Assunto: “Atualização do Contrato \[Nome do Contrato\]”.  
       * Corpo: Informar novas regras/cláusulas (inseridas manualmente pelo administrador).  
       * Enviar para o colaborador, agência e sócios da agência associados ao contrato.  
   * Upload de contratos digitalizados (PDF) associado à versão \[Futuro\].  
3. **Sistema de Reembolsos \[MVP\]**

   * Upload de comprovantes (PDF ou imagem, limite de 5 MB).  
   * Campos: Valor solicitado, descrição, data do pedido.  
   * Workflow: Submissão → Revisão (aprovado/rejeitado) → Registro no histórico financeiro.  
   * **Integração com Cora API \[MVP\]**:  
     * Enviar reembolsos aprovados via API do Cora ([https://developers.cora.com.br/docs/utiliza%C3%A7%C3%A3o-das-apis](https://developers.cora.com.br/docs/utiliza%C3%A7%C3%A3o-das-apis)).  
     * Confirmar compensação do pagamento.  
   * Notificações por e-mail em pt-br para aprovação/rejeição (ex.: “Seu reembolso foi aprovado”).  
   * Interface e mensagens em pt-br.  
4. **Histórico Financeiro Unificado \[MVP\]**

   * Exibição de:  
     * Pagamentos de salários (data, valor, comprovante) via Cora API \[MVP\].  
     * Reembolsos aprovados (data, valor, comprovante) via Cora API \[MVP\].  
     * Pagamentos extras (bônus, 13º, etc.) via Cora API \[MVP\].  
   * Filtros: Período, tipo de transação \[MVP\].  
   * Exportação: PDF ou Excel \[Futuro\].  
   * Interface e relatórios em pt-br (ex.: “Histórico Financeiro de \[Nome do Colaborador\]”).

#### **2.2 Módulo 2 \- Gestão de Clientes (Empresas)**

**Objetivo**: Gerenciar informações de empresas, suas filiais, representantes, contratos e aspectos financeiros, integrando com a API do Cora para faturamento e notificações.

**Funcionalidades**:

1. **Cadastro Empresarial \[MVP\]**

   * Campos obrigatórios:  
     * Dados da empresa: Razão social, CNPJ, data de início.  
     * Documentação: Contratos digitalizados (upload de PDF), versão (seleção de contrato ativo), signatário.  
     * **Endereço \[MVP\]**:  
       * CEP (preenchimento automático via API, ex.: ViaCEP, retornando logradouro, bairro, cidade, estado).  
       * Campos manuais (caso API não retorne): Logradouro, bairro, cidade, estado, país.  
     * **Telefones \[MVP\]**:  
       * Suporte a múltiplos telefones.  
       * Campos: País (dropdown com Brasil como padrão), número do telefone.  
       * Validação por país (ex.: Brasil: DDD \+ 8/9 dígitos; Portugal: 9 dígitos).  
   * **Validação de CNPJ \[MVP\]**:  
     * Após digitação, verificar existência do CNPJ via API pública (ex.: Receita Federal).  
     * Exibir mensagem de erro em pt-br se inválido (ex.: “CNPJ inválido ou não encontrado”).  
   * Interface e mensagens em pt-br.  
2. **Gestão de Contratos \[MVP\]**

   * **Armazenamento de Textos \[MVP\]**:  
     * Administrador cadastra textos de contratos em editor de texto rico (em pt-br).  
     * Campos: Nome do contrato, versão (ex.: “v1.0”), texto, data de criação, serviço associado (seleção do cadastro de serviços).  
     * Suporte a variáveis no texto do contrato (ex.: `{RAZAO_SOCIAL}`, `{CNPJ}`, `{REPRESENTANTE}`, `{CPF}`, `{DATA_INICIO}`, `{SERVICO_NOME}`, `{SERVICO_VALOR}`, `{AGENCIA_RAZAO_SOCIAL}`, `{AGENCIA_CNPJ}`, `{AGENCIA_SOCIO_NOME}`, `{SOCIO_NOME}`, `{SOCIO_CPF}`), definidas pelo administrador.  
     * Variáveis são substituídas automaticamente pelos dados da empresa, serviço, agência e sócios (da empresa e da agência) ao gerar o contrato.  
   * **Versionamento Manual \[MVP\]**:  
     * Administrador informa quando criar nova versão (ex.: “v1.1”).  
     * Sistema armazena histórico de versões.  
   * **Assinatura Digital via Gov.br \[MVP\]**:  
     * **Geração de PDF**:  
       * Na tela de cadastro da empresa, opção para gerar contrato em PDF/A-1b.  
       * Sistema preenche variáveis do contrato com dados da empresa, serviço selecionado, agência e sócios (da empresa e da agência).  
       * PDF gerado com identificador único (hash ou UUID).  
     * **Link Seguro**:  
       * Geração de link criptografado e expirável (ex.: válido por 7 dias, com token JWT).  
       * Link associado à empresa, sócios da empresa e à versão do contrato.  
       * Envio do link por e-mail automático em pt-br para a empresa, sócios selecionados, agência e pelo menos um sócio da agência (assunto: “Assinatura do Contrato \[Nome do Contrato\]”).  
     * **Tela do Link**:  
       * Botão para download do PDF (rótulo: “Baixar Contrato”).  
       * Instruções para assinatura via Gov.br (em pt-br):  
         * Acesse o site: [https://www.gov.br/pt-br/servicos/assinatura-eletronica](https://www.gov.br/pt-br/servicos/assinatura-eletronica) (link clicável, nova aba).  
         * Faça login com sua conta Gov.br (nível prata ou ouro).  
         * Envie o PDF baixado para a plataforma Gov.br.  
         * Siga os passos para assinar eletronicamente.  
         * Baixe o PDF assinado e retorne para upload.  
       * Campo para upload do PDF assinado (rótulo: “Enviar Contrato Assinado”).  
     * **Validação da Assinatura \[MVP\]**:  
       * **Opção 1: Verificação Local**:  
         * Usar bibliotecas (ex.: PyPDF2, pikepdf, PyHanko) para detectar camadas de assinatura, extrair assinante, data/hora, certificado e verificar integridade.  
       * **Opção 2: Validação Externa**:  
         * Usar API de validação (ex.: ICP-Brasil, Serpro) para confirmação jurídica.  
       * Habilitar botão “Enviar Contrato Assinado” após validação.  
       * Armazenar contrato assinado no banco de dados, vinculado à empresa, sócios da empresa, agência e sócios da agência.  
       * Notificação automática em pt-br ao administrador (ex.: “Contrato de \[Razão Social\] assinado”).  
   * **Notificação de Atualização \[MVP\]**:  
     * Ao criar nova versão, gerar template de e-mail em pt-br:  
       * Assunto: “Atualização do Contrato \[Nome do Contrato\]”.  
       * Corpo: Informar novas regras/cláusulas (inseridas manualmente pelo administrador).  
       * Enviar para a empresa, sócios selecionados, agência e sócios da agência associados ao contrato.  
   * Upload de contratos digitalizados (PDF) associado à versão \[Futuro\].  
3. **Representantes/Sócios \[MVP\]**

   * Cadastro múltiplo por empresa com:  
     * Dados pessoais: Nome completo, CPF, RG, data de nascimento.  
     * **Endereço \[MVP\]**:  
       * CEP (preenchimento automático via API, ex.: ViaCEP).  
       * Campos manuais: Logradouro, bairro, cidade, estado, país.  
     * **Telefones \[MVP\]**:  
       * Suporte a múltiplos telefones.  
       * Campos: País (dropdown com Brasil como padrão), número do telefone.  
       * Validação por país (ex.: Brasil: DDD \+ 8/9 dígitos; Portugal: 9 dígitos).  
     * **Validação de CPF \[MVP\]**:  
       * Verificar existência do CPF via API pública.  
     * **Verificação de Veterinário \[MVP\]**:  
       * Toggle: “É veterinário?”.  
       * Se ativado, exibir campos: Número do CRMV, Estado (UF).  
       * Ícone de verificação ao lado do CRMV:  
         * Busca no CFMV (mesmo processo descrito no Módulo 1).  
         * Exibir status em pt-br (ex.: “Ativo \- Maria Souza \- RJ”).  
     * Indicador de responsável técnico (checkbox).  
   * Associação de representantes a filiais específicas \[Futuro\].  
   * Interface e mensagens em pt-br.  
4. **Gestão Financeira \[MVP\]**

   * **Serviços Contratados \[MVP\]**:  
     * Lista de serviços (selecionados do cadastro de serviços), valores e periodicidade (mensal, trimestral, etc.).  
   * **Faturas e Pagamentos \[MVP\]**:  
     * Geração automática de boletos via Cora API com base na data de pagamento mensal.  
     * Envio de boletos por e-mail ou WhatsApp via Cora API.  
     * Confirmação de compensação de pagamentos via Cora API.  
     * Download de boletos em PDF.  
   * **Notas Fiscais \[Futuro\]**:  
     * Registro e upload de notas fiscais (PDF).  
   * **Notificações \[MVP\]**:  
     * Envio automático de lembretes de pagamento via Cora API (e-mail/WhatsApp, em pt-br).  
   * Relatórios: Pagamentos recebidos, inadimplência, previsão de receita \[Futuro\].  
   * Interface e mensagens em pt-br (ex.: “Fatura gerada com sucesso”).

#### **2.3 Módulo 3 \- Gestão de Serviços**

**Objetivo**: Gerenciar os serviços prestados pela agência, permitindo cadastro, edição, visualização e exclusão (CRUD).

**Funcionalidades**:

1. **Cadastro de Serviços \[MVP\]**

   * Tela CRUD (Criar, Ler, Atualizar, Deletar) acessível apenas por administradores.  
   * Campos obrigatórios:  
     * Nome do serviço (ex.: “Plano Beagle”).  
     * Descrição (ex.: “Inclui 12 artes para redes sociais, anúncios no Meta, anúncios no Google e manutenção do site”).  
     * Valor (ex.: R$ 3.157,00).  
     * Periodicidade (dropdown: mensal, trimestral, semestral, anual).  
   * Validações:  
     * Nome único.  
     * Valor numérico positivo.  
     * Descrição com até 500 caracteres.  
   * Interface e mensagens em pt-br (ex.: “Serviço cadastrado com sucesso”).  
2. **Associação a Contratos \[MVP\]**

   * Na geração de contratos (Módulo 2), permitir seleção de um serviço cadastrado.  
   * Variáveis do serviço (ex.: `{SERVICO_NOME}`, `{SERVICO_VALOR}`) disponíveis para inclusão no texto do contrato.

#### **2.4 Módulo 4 \- Cadastro da Agência**

**Objetivo**: Cadastrar e gerenciar os dados da agência e seus sócios, com estrutura idêntica ao cadastro de empresas clientes.

**Funcionalidades**:

1. **Cadastro da Agência \[MVP\]**

   * Tela CRUD acessível apenas por administradores.  
   * Campos obrigatórios:  
     * Dados da agência: Razão social, CNPJ, data de fundação.  
     * **Endereço \[MVP\]**:  
       * CEP (preenchimento automático via API, ex.: ViaCEP, retornando logradouro, bairro, cidade, estado).  
       * Campos manuais: Logradouro, bairro, cidade, estado, país.  
     * **Telefones \[MVP\]**:  
       * Suporte a múltiplos telefones.  
       * Campos: País (dropdown com Brasil como padrão), número do telefone.  
       * Validação por país (ex.: Brasil: DDD \+ 8/9 dígitos; Portugal: 9 dígitos).  
     * **Validação de CNPJ \[MVP\]**:  
       * Verificar existência do CNPJ via API pública (ex.: Receita Federal).  
       * Exibir mensagem de erro em pt-br se inválido (ex.: “CNPJ inválido ou não encontrado”).  
   * Interface e mensagens em pt-br.  
2. **Cadastro de Sócios da Agência \[MVP\]**

   * Cadastro múltiplo de sócios (mínimo 1\) com:  
     * Dados pessoais: Nome completo, CPF, RG, data de nascimento.  
     * **Endereço \[MVP\]**:  
       * CEP (preenchimento automático via API, ex.: ViaCEP).  
       * Campos manuais: Logradouro, bairro, cidade, estado, país.  
     * **Telefones \[MVP\]**:  
       * Suporte a múltiplos telefones.  
       * Campos: País (dropdown com Brasil como padrão), número do telefone.  
       * Validação por país (ex.: Brasil: DDD \+ 8/9 dígitos; Portugal: 9 dígitos).  
     * **Validação de CPF \[MVP\]**:  
       * Verificar existência do CPF via API pública.  
     * **Verificação de Veterinário \[MVP\]**:  
       * Toggle: “É veterinário?”.  
       * Se ativado, exibir campos: Número do CRMV, Estado (UF).  
       * Ícone de verificação ao lado do CRMV:  
         * Busca no CFMV (mesmo processo descrito no Módulo 1).  
         * Exibir status em pt-br (ex.: “Ativo \- Maria Souza \- RJ”).  
   * Interface e mensagens em pt-br.  
3. **Integração com Contratos \[MVP\]**

   * Dados da agência e de pelo menos um sócio são usados para preencher variáveis nos contratos (ex.: `{AGENCIA_RAZAO_SOCIAL}`, `{AGENCIA_CNPJ}`, `{AGENCIA_SOCIO_NOME}`).

#### **2.5 Módulo 5 \- Gerenciamento de Usuários**

**Objetivo**: Permitir que o administrador gerencie os usuários do sistema, definindo permissões e controlando acesso às telas.

**Funcionalidades**:

1. **Tela de Gerenciamento de Usuários \[MVP\]**

   * Tela CRUD acessível apenas por administradores.  
   * Campos:  
     * Nome, e-mail, perfil (Administrador, Financeiro, Colaborador, Sócio).  
     * Status (Ativo/Inativo).  
     * Associação: Colaborador (vinculado a um cadastro de colaborador) ou Sócio (vinculado a uma empresa e um cadastro de sócio).  
   * Ações: Criar, editar, desativar/ativar usuário, redefinir senha.  
   * Interface e mensagens em pt-br (ex.: “Usuário criado com sucesso”).  
2. **Permissões por Perfil \[MVP\]**

   * **Administrador**:  
     * Acesso total a todas as telas (Colaboradores, Clientes, Serviços, Agência, Usuários).  
     * Pode criar/editar/deletar cadastros, contratos, serviços e usuários.  
   * **Financeiro**:  
     * Acesso às telas de gestão financeira (reembolsos, faturas, histórico financeiro).  
     * Pode aprovar/rejeitar reembolsos e visualizar faturas.  
   * **Colaborador**:  
     * Tela de visualização de dados pessoais (nome, CPF, endereço, telefones, dados bancários).  
     * Campos editáveis: Endereço, telefones, dados bancários.  
     * Visualização do contrato (PDF assinado, se disponível).  
     * Acesso à tela de reembolsos (solicitar, visualizar histórico).  
   * **Sócio (de empresa cliente)**:  
     * Tela de visualização de dados da empresa (razão social, CNPJ, endereço, telefones).  
     * Tela de visualização de dados pessoais (nome, CPF, endereço, telefones).  
     * Campos editáveis: Endereço, telefones.  
     * Visualização do contrato (PDF assinado, se o nome do sócio estiver no contrato).  
     * Visualização do histórico de faturas e notas fiscais emitidas para a empresa \[Futuro\].  
   * Interface e mensagens em pt-br (ex.: “Acesso restrito a dados pessoais”).

#### **2.6 Fluxo de Envio de Contrato para Empresa e Sócios**

**Objetivo**: Enviar contratos para empresas e seus sócios, com base no serviço escolhido, incluindo a agência e seus sócios como signatários.

**Funcionalidades \[MVP\]**:

1. **Seleção de Serviço e Sócios**:

   * Na tela de cadastro da empresa, o administrador seleciona:  
     * Serviço contratado (ex.: “Plano Beagle”).  
     * Sócios da empresa que assinarão o contrato (múltipla seleção).  
     * Sócios da agência que assinarão o contrato (mínimo 1).  
   * Sistema valida se há pelo menos um sócio da empresa e um da agência selecionados.  
2. **Geração do Contrato**:

   * Sistema gera PDF/A-1b com base no modelo de contrato associado ao serviço.  
   * Variáveis preenchidas automaticamente (ex.: `{RAZAO_SOCIAL}`, `{SERVICO_NOME}`, `{AGENCIA_RAZAO_SOCIAL}`, `{AGENCIA_SOCIO_NOME}`, `{SOCIO_NOME}`).  
   * PDF gerado com identificador único (hash ou UUID).  
3. **Envio do Link Seguro**:

   * Geração de link criptografado e expirável (ex.: válido por 7 dias, com token JWT).  
   * Link associado à empresa, sócios selecionados, agência e sócios da agência.  
   * Envio de e-mail automático em pt-br para:  
     * E-mail da empresa (cadastrado no sistema).  
     * E-mails dos sócios selecionados da empresa.  
     * E-mail da agência.  
     * E-mails dos sócios selecionados da agência.  
     * Assunto: “Assinatura do Contrato \[Nome do Contrato\]”.  
     * Corpo: Instruções para acessar o link e assinar o contrato.  
4. **Tela do Link**:

   * Botão para download do PDF (rótulo: “Baixar Contrato”).  
   * Instruções para assinatura via Gov.br (em pt-br, conforme descrito no Módulo 1).  
   * Campo para upload do PDF assinado (rótulo: “Enviar Contrato Assinado”).  
5. **Validação e Armazenamento**:

   * Validação da assinatura (local com PyPDF2/pikepdf/PyHanko ou externa com ICP-Brasil/Serpro).  
   * Após validação, habilitar botão “Enviar Contrato Assinado”.  
   * Armazenar contrato assinado no banco de dados, vinculado à empresa, sócios, agência e sócios da agência.  
   * Notificação automática em pt-br ao administrador (ex.: “Contrato de \[Razão Social\] assinado”).

### **3\. Requisitos Não Funcionais**

1. **Interface Intuitiva \[MVP\]**

   * Design responsivo (desktop e mobile).  
   * Navegação clara com menus e busca rápida, em pt-br.  
   * Tempo de carregamento de páginas ≤ 2 segundos.  
   * Textos, rótulos e mensagens em pt-br (ex.: “Salvar”, “Cancelar”, “Erro ao carregar dados”).  
2. **Banco de Dados Relacional \[MVP\]**

   * Estrutura para suportar cadastros, históricos, contratos, serviços e documentos.  
   * Índices para buscas rápidas (ex.: CPF, CNPJ, CRMV).  
   * Conformidade com LGPD (criptografia de dados sensíveis, consentimento de uso).  
3. **Sistema de Backup \[MVP\]**

   * Backups automáticos diários com retenção de 30 dias.  
   * Opção de restauração manual por administradores (interface em pt-br).  
4. **Controle de Acesso/Permissões \[MVP\]**

   * Perfis: Administrador, Financeiro, Colaborador, Sócio.  
   * Permissões granulares (ex.: Colaboradores só visualizam/editam dados permitidos).  
   * Autenticação: Login/senha com MFA (autenticação de dois fatores).  
   * Mensagens de erro/acesso em pt-br (ex.: “Acesso não autorizado”).  
5. **Relatórios Gerenciais \[Futuro\]**

   * Relatórios disponíveis:  
     * Módulo 1: Turnover de colaboradores, resumo financeiro, reembolsos pendentes.  
     * Módulo 2: Clientes ativos, faturamento por período, inadimplência.  
   * Exportação em PDF e Excel.  
   * Filtros: Período, tipo de relatório, filial.  
   * Relatórios e interface em pt-br (ex.: “Relatório de Inadimplência”).  
6. **Conformidade com LGPD \[MVP\]**

   * Consentimento explícito para coleta de dados pessoais (em pt-br).  
   * Criptografia de dados sensíveis (CPF, CNPJ, RG, dados bancários).  
   * Direito de exclusão e portabilidade de dados.  
   * Registro de acessos a dados sensíveis (logs).  
   * Interface de consentimento e mensagens em pt-br (ex.: “Concordo com a coleta de dados”).

### **4\. Requisitos Técnicos**

* **Tecnologias Sugeridas**:

  * **Backend**: Node.js ou Python (Django/Flask) com REST API.  
  * **Frontend**: React.js para interface responsiva, com textos em pt-br.  
  * **Banco de Dados**: PostgreSQL (relacional, suporte a LGPD).  
  * **Armazenamento de Arquivos**: AWS S3 ou similar para documentos.  
  * **Autenticação**: OAuth 2.0 com MFA.  
  * **Integrações**:  
    * Cora API para pagamentos, boletos e notificações ([https://developers.cora.com.br/docs/utiliza%C3%A7%C3%A3o-das-apis](https://developers.cora.com.br/docs/utiliza%C3%A7%C3%A3o-das-apis)).  
    * APIs públicas para validação de CPF/CNPJ (ex.: Receita Federal).  
    * ViaCEP ou similar para busca de endereço.  
    * Scraping controlado no portal CFMV para verificação de CRMV.  
    * Bibliotecas para validação de assinatura de PDF (ex.: PyPDF2, pikepdf, PyHanko) ou APIs externas (ex.: ICP-Brasil, Serpro) \[MVP\].  
* **Infraestrutura**:

  * Hospedagem em nuvem (AWS, Azure ou GCP).  
  * Escalabilidade horizontal para suportar crescimento.  
  * Monitoramento de uptime e performance (ex.: New Relic).  
* **Segurança**:

  * HTTPS para todas as comunicações.  
  * Criptografia AES-256 para dados sensíveis.  
  * Links de assinatura com tokens JWT criptografados e expiráveis.  
  * Firewall e proteção contra ataques DDoS.

### **5\. Critérios de Aceitação**

1. **Módulo 1 \- Gestão de Colaboradores**

   * Cadastro completo com validação de CPF e CRMV (incluindo busca no CFMV).  
   * Gestão de contratos com versionamento manual, variáveis preenchidas automaticamente (incluindo dados da agência e sócios) e envio de e-mails de atualização em pt-br.  
   * Geração de PDF de contrato com dados do colaborador e agência, link criptografado enviado por e-mail, upload de contrato assinado e validação de assinatura.  
   * Reembolsos com aprovação/rejeição, integração com Cora API e notificações por e-mail em pt-br.  
   * Histórico financeiro com integração Cora API.  
   * Estrutura consistente de endereço (CEP com API, campos manuais).  
   * Múltiplos telefones com validação por país.  
   * Interface e mensagens em pt-br.  
2. **Módulo 2 \- Gestão de Clientes**

   * Cadastro empresarial com validação de CNPJ e CRMV (incluindo busca no CFMV).  
   * Gestão de contratos com versionamento manual, variáveis preenchidas automaticamente (incluindo dados da empresa, serviço, agência e sócios) e envio de e-mails de atualização em pt-br.  
   * Geração de PDF de contrato com dados da empresa, serviço e agência, link criptografado enviado por e-mail para empresa, sócios, agência e sócios da agência, upload de contrato assinado e validação de assinatura.  
   * Geração/envio de boletos e confirmação de pagamentos via Cora API.  
   * Notificações por e-mail/WhatsApp via Cora API, em pt-br.  
   * Estrutura consistente de endereço para empresas e representantes.  
   * Múltiplos telefones com validação por país.  
   * Interface e mensagens em pt-br.  
3. **Módulo 3 \- Gestão de Serviços**

   * Tela CRUD para cadastro de serviços com nome, descrição, valor e periodicidade.  
   * Associação de serviços a contratos, com variáveis preenchidas no texto do contrato.  
   * Interface e mensagens em pt-br.  
4. **Módulo 4 \- Cadastro da Agência**

   * Cadastro da agência com estrutura idêntica ao cadastro empresarial.  
   * Cadastro de sócios da agência com estrutura idêntica ao cadastro de sócios de empresas.  
   * Inclusão de dados da agência e sócios nos contratos.  
   * Interface e mensagens em pt-br.  
5. **Módulo 5 \- Gerenciamento de Usuários**

   * Tela CRUD para gerenciamento de usuários com perfis e permissões.  
   * Telas específicas para colaboradores (dados pessoais, contrato, reembolsos) e sócios (dados da empresa, dados pessoais, contrato, histórico de faturas/notas fiscais).  
   * Campos editáveis restritos conforme perfil.  
   * Interface e mensagens em pt-br.  
6. **Fluxo de Envio de Contrato**

   * Seleção de serviço e sócios na tela de cadastro da empresa.  
   * Geração de contrato com variáveis preenchidas (empresa, serviço, agência, sócios).  
   * Envio de link criptografado por e-mail para empresa, sócios, agência e sócios da agência.  
   * Validação e armazenamento do contrato assinado.  
   * Notificações em pt-br.  
7. **Requisitos Não Funcionais**

   * Interface responsiva e intuitiva (testada em desktop e mobile, em pt-br).  
   * Tempo de resposta ≤ 2 segundos para operações comuns.  
   * Conformidade com LGPD (criptografia, consentimento, logs).  
   * Backups diários com restauração funcional.  
   * Sistema de permissões testado para todos os perfis de usuário.  
   * Links criptografados para assinatura de contratos.  
   * Todas as mensagens, rótulos e relatórios em pt-br.

### **6\. Premissas**

* A agência fornecerá modelos iniciais de contratos com variáveis definidas.  
* APIs públicas (CEP, CPF, CNPJ) e Cora API estarão disponíveis.  
* Portal CFMV permitirá scraping controlado dentro dos termos de uso.  
* Usuários terão acesso à internet estável.  
* Equipe de desenvolvimento terá conhecimento em LGPD, integrações de APIs e geração/validação de PDFs.

