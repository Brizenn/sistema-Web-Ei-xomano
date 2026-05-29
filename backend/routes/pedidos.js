const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * /pedidos/{restaurante_id}:
 *   get:
 *     summary: Listar pedidos de um restaurante
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: restaurante_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do restaurante
 *     responses:
 *       200:
 *         description: Lista de pedidos do restaurante
 */
router.get('/:restaurante_id', authMiddleware, async (req, res) => {
  const { restaurante_id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM pedidos WHERE restaurante_id = $1 ORDER BY criado_em DESC', [restaurante_id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

/**
 * @swagger
 * /pedidos:
 *   post:
 *     summary: Criar um novo pedido
 *     tags: [Pedidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurante_id
 *             properties:
 *               restaurante_id:
 *                 type: integer
 *               valor_total:
 *                 type: number
 *                 example: 0.00
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 */
router.post('/', async (req, res) => {
  const { restaurante_id, valor_total } = req.body;
  
  if (!restaurante_id) {
    return res.status(400).json({ error: 'ID do restaurante é obrigatório.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Criar o pedido na tabela pedidos
    const orderResult = await client.query(
      'INSERT INTO pedidos (restaurante_id, valor_total) VALUES ($1, $2) RETURNING *',
      [restaurante_id, valor_total || 0]
    );
    const newOrder = orderResult.rows[0];
    
    // 2. Obter período atual formato MM-YYYY (ex: 05-2026)
    const mesAno = new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }).replace('/', '-');
    
    // 3. Tenta encontrar a métrica existente para este restaurante e período
    const check = await client.query(
      'SELECT id, faturamento_total, qtd_pedidos_total FROM dashboard_metricas WHERE restaurante_id = $1 AND periodo_mes_ano = $2',
      [restaurante_id, mesAno]
    );

    if (check.rows.length > 0) {
      // Atualiza a métrica existente somando faturamento e quantidade
      const current = check.rows[0];
      const newFaturamento = parseFloat(current.faturamento_total) + parseFloat(valor_total || 0);
      const newPedidos = parseInt(current.qtd_pedidos_total) + 1;
      
      await client.query(
        'UPDATE dashboard_metricas SET faturamento_total = $1, qtd_pedidos_total = $2, ultima_atualizacao = CURRENT_TIMESTAMP WHERE id = $3',
        [newFaturamento, newPedidos, current.id]
      );
    } else {
      // Insere nova métrica para o novo período
      await client.query(
        'INSERT INTO dashboard_metricas (restaurante_id, periodo_mes_ano, faturamento_total, qtd_pedidos_total) VALUES ($1, $2, $3, $4)',
        [restaurante_id, mesAno, valor_total || 0, 1]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(newOrder);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar pedido e atualizar métricas:', error);
    res.status(500).json({ error: 'Erro ao criar pedido e atualizar métricas no banco de dados.' });
  } finally {
    client.release();
  }
});

// A tabela de pedidos é protegida (ON DELETE RESTRICT no restaurante e não permitimos DELETE aqui por padrão)
// Se precisar atualizar valor (caso raro):
/**
 * @swagger
 * /pedidos/{id}:
 *   put:
 *     summary: Atualizar valor de um pedido existente
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - valor_total
 *             properties:
 *               valor_total:
 *                 type: number
 *     responses:
 *       200:
 *         description: Pedido atualizado com sucesso
 *       404:
 *         description: Pedido não encontrado
 */
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { valor_total } = req.body;
  try {
    const result = await pool.query(
      'UPDATE pedidos SET valor_total = $1 WHERE id = $2 RETURNING *',
      [valor_total, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar pedido' });
  }
});

module.exports = router;
