const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * /dashboard/admin/geral:
 *   get:
 *     summary: Obter métricas gerais de todos os restaurantes (Apenas UA - Admin Global)
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Métricas gerais agrupadas por período
 */
router.get('/admin/geral', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'UA') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores globais podem acessar este recurso.' });
    }

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

/**
 * @swagger
 * /dashboard/{restaurante_id}:
 *   get:
 *     summary: Obter métricas de um restaurante específico
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: restaurante_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do restaurante
 *       - in: query
 *         name: periodo_mes_ano
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtro opcional de período (ex. 05-2026)
 *     responses:
 *       200:
 *         description: Métricas de faturamento e quantidade de pedidos
 */
router.get('/:restaurante_id', authMiddleware, async (req, res) => {
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

/**
 * @swagger
 * /dashboard/atualizar:
 *   post:
 *     summary: Atualizar ou inserir métricas do restaurante no mês
 *     tags: [Dashboard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurante_id
 *               - periodo_mes_ano
 *             properties:
 *               restaurante_id:
 *                 type: integer
 *               periodo_mes_ano:
 *                 type: string
 *                 example: 05-2026
 *               faturamento_adicional:
 *                 type: number
 *                 example: 50.00
 *               pedidos_adicionais:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Métrica atualizada/criada com sucesso
 */
router.post('/atualizar', authMiddleware, async (req, res) => {
  const { restaurante_id, periodo_mes_ano, faturamento_adicional, pedidos_adicionais } = req.body;
  try {
    // Verificar propriedade se não for Admin UA
    if (req.user.role !== 'UA') {
      const check = await pool.query('SELECT dono_id FROM restaurantes WHERE id = $1', [restaurante_id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ error: 'Restaurante não encontrado' });
      }
      if (Number(check.rows[0].dono_id) !== Number(req.user.id)) {
        return res.status(403).json({ error: 'Acesso negado. Você não é o proprietário deste restaurante.' });
      }
    }

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
