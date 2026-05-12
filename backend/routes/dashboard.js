const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obter métricas de um restaurante específico (Para o UR e UA)
router.get('/:restaurante_id', async (req, res) => {
  const { restaurante_id } = req.params;
  const { periodo_mes_ano } = req.query; // opcional
  try {
    let query = 'SELECT * FROM dashboard_metricas WHERE restaurante_id = $1';
    const params = [restaurante_id];
    
    if (periodo_mes_ano) {
      query += ' AND periodo_mes_ano = $2';
      params.push(periodo_mes_ano);
    }
    
    query += ' ORDER BY ultima_atualizacao DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar métricas' });
  }
});

// Obter métricas gerais de todos os restaurantes (Apenas UA - Admin Global)
router.get('/admin/geral', async (req, res) => {
  try {
    // Retorna somatório geral agrupado por período
    const query = `
      SELECT 
        periodo_mes_ano, 
        SUM(faturamento_total) as faturamento_total_rede, 
        SUM(qtd_pedidos_total) as pedidos_totais_rede
      FROM dashboard_metricas 
      GROUP BY periodo_mes_ano 
      ORDER BY periodo_mes_ano DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar métricas gerais' });
  }
});

// Atualizar ou inserir métricas do restaurante no mês
router.post('/atualizar', async (req, res) => {
  const { restaurante_id, periodo_mes_ano, faturamento_adicional, pedidos_adicionais } = req.body;
  try {
    // Tenta encontrar a métrica atual
    const check = await pool.query(
      'SELECT id, faturamento_total, qtd_pedidos_total FROM dashboard_metricas WHERE restaurante_id = $1 AND periodo_mes_ano = $2',
      [restaurante_id, periodo_mes_ano]
    );

    let result;
    if (check.rows.length > 0) {
      // Atualiza
      const current = check.rows[0];
      const newFaturamento = parseFloat(current.faturamento_total) + parseFloat(faturamento_adicional || 0);
      const newPedidos = parseInt(current.qtd_pedidos_total) + parseInt(pedidos_adicionais || 0);
      
      result = await pool.query(
        'UPDATE dashboard_metricas SET faturamento_total = $1, qtd_pedidos_total = $2, ultima_atualizacao = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        [newFaturamento, newPedidos, current.id]
      );
    } else {
      // Insere novo mês
      result = await pool.query(
        'INSERT INTO dashboard_metricas (restaurante_id, periodo_mes_ano, faturamento_total, qtd_pedidos_total) VALUES ($1, $2, $3, $4) RETURNING *',
        [restaurante_id, periodo_mes_ano, faturamento_adicional || 0, pedidos_adicionais || 0]
      );
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar métricas' });
  }
});

module.exports = router;
