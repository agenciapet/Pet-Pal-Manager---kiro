const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
console.log('[SERVER_DEBUG] Tentando carregar .env de:', path.resolve(__dirname, '../.env'));
console.log('[SERVER_DEBUG] JWT_SECRET após dotenv.config():', process.env.JWT_SECRET);
const express = require('express');
const cors = require('cors');
const app = express();

// Importar rotas
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const companyRoutes = require('./routes/companies');
const dashboardRoutes = require('./routes/dashboard');
const serviceRoutes = require('./routes/services');
const agencyRoutes = require('./routes/agency');
const userRoutes = require('./routes/users');
const utilsRoutes = require('./routes/utilsRoutes');
const contractsRoutes = require('./routes/contractsRoutes');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo ao PetPal Manager API' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/agency', agencyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/utils', utilsRoutes);
app.use('/api/contracts', contractsRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 