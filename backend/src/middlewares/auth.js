const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('ERRO CRÍTICO NO MIDDLEWARE: JWT_SECRET não está definido durante a verificação do token!');
    return res.status(500).json({ message: 'Erro de configuração do servidor: JWT_SECRET ausente.' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    console.log('[AuthMiddleware] Token Decodificado:', decoded);
    
    // Verificar se o usuário ainda existe e está ativo
    const result = await db.query(
      'SELECT id, email, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    req.user = result.rows[0];
    console.log('[AuthMiddleware] Usuário autenticado:', req.user);
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Erro na verificação do token:', error);
    return res.status(403).json({ message: 'Token inválido' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log('[AuthMiddleware] Verificando Roles. Requeridas:', roles, 'Usuário:', req.user);
    if (!req.user) {
      console.log('[AuthMiddleware] Usuário não autenticado para authorizeRoles.');
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      console.log('[AuthMiddleware] Acesso negado. Role do usuário:', req.user.role, 'Roles requeridas:', roles);
      return res.status(403).json({ message: 'Acesso negado' });
    }
    console.log('[AuthMiddleware] Acesso permitido pelas roles.');
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
}; 