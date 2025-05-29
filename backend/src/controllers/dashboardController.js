const db = require('../config/database');

// Obter estatísticas do dashboard
const getDashboardStats = async (req, res) => {
  try {
    // Contar colaboradores ativos
    const employeesResult = await db.query(
      'SELECT COUNT(*) as total FROM employees WHERE is_active = true'
    );

    // Contar empresas ativas
    const companiesResult = await db.query(
      'SELECT COUNT(*) as total FROM companies WHERE is_active = true'
    );

    // Contar reembolsos pendentes
    const reimbursementsResult = await db.query(
      'SELECT COUNT(*) as total FROM reimbursements WHERE status = $1',
      ['pending']
    );

    // Calcular faturamento mensal (soma dos serviços ativos)
    const revenueResult = await db.query(`
      SELECT COALESCE(SUM(service_value), 0) as total
      FROM company_services 
      WHERE is_active = true 
      AND billing_frequency = 'mensal'
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    `);

    // Buscar reembolsos recentes
    const recentReimbursements = await db.query(`
      SELECT 
        r.id, r.amount, r.description, r.status, r.submitted_at,
        e.full_name as employee_name
      FROM reimbursements r
      JOIN employees e ON r.employee_id = e.id
      ORDER BY r.submitted_at DESC
      LIMIT 5
    `);

    // Buscar empresas recentes
    const recentCompanies = await db.query(`
      SELECT 
        id, company_name, cnpj, created_at
      FROM companies
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({
      stats: {
        totalEmployees: parseInt(employeesResult.rows[0].total),
        totalCompanies: parseInt(companiesResult.rows[0].total),
        pendingReimbursements: parseInt(reimbursementsResult.rows[0].total),
        monthlyRevenue: parseFloat(revenueResult.rows[0].total)
      },
      recentReimbursements: recentReimbursements.rows,
      recentCompanies: recentCompanies.rows
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Obter dados para gráficos
const getChartData = async (req, res) => {
  try {
    // Reembolsos por mês (últimos 6 meses)
    const reimbursementsByMonth = await db.query(`
      SELECT 
        DATE_TRUNC('month', submitted_at) as month,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM reimbursements
      WHERE submitted_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', submitted_at)
      ORDER BY month
    `);

    // Empresas por estado
    const companiesByState = await db.query(`
      SELECT 
        state,
        COUNT(*) as count
      FROM companies
      WHERE is_active = true
      GROUP BY state
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({
      reimbursementsByMonth: reimbursementsByMonth.rows,
      companiesByState: companiesByState.rows
    });
  } catch (error) {
    console.error('Erro ao buscar dados dos gráficos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

module.exports = {
  getDashboardStats,
  getChartData,
}; 