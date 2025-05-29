# PetPal Manager (PPM) - Sistema de Gestão Empresarial

Sistema de gestão empresarial integrado desenvolvido especificamente para agências que atendem o setor veterinário, com foco em conformidade com a LGPD e funcionalidades específicas para o mercado pet.

## 🚀 Características Principais

- **Interface Moderna**: Desenvolvida com shadcn/ui e Tailwind CSS
- **Tema Claro/Escuro**: Toggle para alternar entre temas
- **Responsivo**: Interface adaptável para desktop e mobile
- **Dados Mockados**: Sistema funcional com dados de teste
- **Arquitetura Modular**: Organização clara e escalável

## 🎯 Módulos do Sistema

### 1. Dashboard
- Visão geral com estatísticas em tempo real
- Cards informativos com métricas importantes
- Atividades recentes
- Resumo financeiro

### 2. Gestão de Colaboradores
- Cadastro completo de colaboradores
- Validação de CPF e CRMV para veterinários
- Controle de contratos e salários
- Sistema de reembolsos
- Histórico financeiro

### 3. Gestão de Clientes
- Cadastro empresarial com validação de CNPJ
- Gestão de representantes e sócios
- Contratos digitais com assinatura eletrônica
- Faturamento e cobrança
- Múltiplos telefones e endereços

### 4. Gestão de Serviços
- Cadastro de serviços oferecidos
- Controle de valores e periodicidade
- Associação com contratos
- Relatórios de performance

### 5. Cadastro da Agência
- Dados da agência e sócios
- Documentos e certificações
- Informações para contratos

### 6. Gerenciamento de Usuários
- Controle de acesso por perfis
- Permissões granulares
- Associação com colaboradores/sócios

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **shadcn/ui** para componentes
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **React Router** para navegação
- **React Query** para gerenciamento de estado

### Componentes UI
- **Radix UI** como base dos componentes
- **class-variance-authority** para variantes
- **clsx** e **tailwind-merge** para classes condicionais

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd PPM
```

2. Instale as dependências do frontend:
```bash
cd frontend
npm install
```

3. Execute o frontend:
```bash
npm run dev
```

4. Acesse o sistema:
```
http://localhost:5173
```

### Credenciais de Teste
- **Email**: admin@petpalmanager.com
- **Senha**: admin123

## 🎨 Design System

### Temas
- **Tema Claro**: Interface limpa e profissional
- **Tema Escuro**: Reduz fadiga visual em ambientes com pouca luz
- **Toggle**: Alternância fácil entre temas

### Componentes
- **Cards**: Informações organizadas em containers
- **Tables**: Listagens com filtros e ações
- **Buttons**: Variantes para diferentes ações
- **Badges**: Status e categorias
- **Forms**: Formulários responsivos

### Efeitos Visuais
- **Hover Effects**: Sombras e transições suaves
- **Loading States**: Indicadores de carregamento
- **Animations**: Transições fluidas
- **Responsive**: Adaptação automática para diferentes telas

## 📊 Dados Mockados

O sistema inclui dados de teste para demonstração:

### Colaboradores
- Dr. João Silva Santos (Veterinário - CRMV 12345/SP)
- Maria Oliveira Costa (Colaboradora)
- Dra. Ana Paula Ferreira (Veterinária - CRMV 67890/SP)

### Clientes
- Clínica Veterinária Pet Care Ltda
- Hospital Veterinário Animal Life S.A.
- Pet Shop Mundo Animal ME

### Serviços
- Plano Beagle (R$ 3.157,00/mês)
- Plano Golden Retriever (R$ 5.500,00/mês)
- Plano Chihuahua (R$ 1.800,00/mês)
- Consultoria Estratégica (R$ 2.500,00/trimestre)

### Agência
- PetPal Manager Agência Digital Ltda
- Sócios: Natália Cassus e Dr. Pedro Henrique Oliveira

## 🔐 Perfis de Usuário

### Administrador
- Acesso total ao sistema
- Gestão de usuários e permissões
- Configurações da agência

### Financeiro
- Gestão financeira
- Aprovação de reembolsos
- Relatórios financeiros

### Colaborador
- Dados pessoais
- Contratos
- Solicitação de reembolsos

### Cliente (Sócio)
- Dados da empresa
- Contratos
- Histórico de faturas

## 🚧 Funcionalidades Implementadas

### ✅ Concluído
- [x] Interface moderna com shadcn/ui
- [x] Sistema de temas claro/escuro
- [x] Dashboard com estatísticas
- [x] Gestão de colaboradores
- [x] Gestão de clientes
- [x] Gestão de serviços
- [x] Cadastro da agência
- [x] Gerenciamento de usuários
- [x] Dados mockados para teste
- [x] Design responsivo
- [x] Efeitos visuais e animações

### 🔄 Em Desenvolvimento
- [ ] Integração com APIs reais
- [ ] Sistema de autenticação completo
- [ ] Validação de CPF/CNPJ via API
- [ ] Verificação de CRMV
- [ ] Assinatura digital de contratos
- [ ] Integração com Cora API
- [ ] Sistema de backup
- [ ] Relatórios avançados

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- **Desktop**: Layout completo com sidebar
- **Tablet**: Layout adaptado com navegação otimizada
- **Mobile**: Interface compacta com menu hambúrguer

## 🎯 Próximos Passos

1. **Backend**: Implementação da API REST
2. **Banco de Dados**: Estrutura PostgreSQL
3. **Autenticação**: Sistema JWT com MFA
4. **Integrações**: APIs externas (CPF, CNPJ, CRMV, Cora)
5. **Documentos**: Sistema de upload e assinatura
6. **Relatórios**: Geração de PDFs e Excel
7. **Notificações**: Email e WhatsApp
8. **Deploy**: Configuração para produção

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Contribuição

Contribuições são bem-vindas! Por favor, leia as diretrizes de contribuição antes de submeter pull requests.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato através dos canais oficiais da PetPal Manager.

---

**PetPal Manager** - Transformando a gestão do setor veterinário com tecnologia e inovação. 🐾 