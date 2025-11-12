# Pet Pal Manager (PPM) 🐾

Sistema completo de gestão para clínicas veterinárias, pet shops e hospitais veterinários.

## 🚀 Funcionalidades Implementadas

### 🔐 Sistema de Autenticação
- Login com JWT
- Registro de novos usuários
- Recuperação de senha
- Rotas protegidas
- Contexto de autenticação React

### 👥 Gestão de Clientes
- Cadastro completo de empresas veterinárias
- Múltiplas unidades por cliente
- Representantes com informações detalhadas
- Novos campos empresariais:
  - Número de Registro CFMV/CRMV
  - Data de Abertura
  - Capital Social
  - Faturamento Anual
  - Situação da empresa
  - Optante pelo Simples Nacional
  - Identificação de sócios

### 🏢 Gestão de Colaboradores
- Cadastro de funcionários
- Controle de cargos e permissões
- Histórico de alterações

### 📋 Sistema de Contratos
- Geração automática de contratos
- Seleção de serviços
- Assinatura digital
- Gestão de entidades contratuais

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **React Router** para navegação
- **Lucide React** para ícones
- **Axios** para requisições HTTP

### Backend
- **Node.js** com Express
- **JWT** para autenticação
- **bcrypt** para hash de senhas
- **CORS** configurado
- **SQLite** para desenvolvimento

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📱 Acesso ao Sistema

### Usuário Admin Padrão
- **Email:** admin@petpal.com
- **Senha:** admin123

### URLs Principais
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🌐 Deploy

### Vercel (Frontend)
O frontend está configurado para deploy automático na Vercel. Conecte o repositório GitHub à Vercel para deploy contínuo.

### Backend
Configure as variáveis de ambiente no seu provedor de hospedagem:
```env
JWT_SECRET=sua_chave_secreta_jwt
PORT=3001
NODE_ENV=production
```

## 📋 Funcionalidades Pendentes

Consulte os arquivos:
- `FUNCIONALIDADES_PENDENTES.md`
- `Funcionalidade Pendentes 2.md`

## 🔧 Estrutura do Projeto

```
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── data/
│   └── package.json
└── README.md
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas, entre em contato através do GitHub Issues.

---

Desenvolvido com ❤️ pela equipe Pet Pal Manager