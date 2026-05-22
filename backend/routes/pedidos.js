const express = require('express');
const router = express.Router();
const pool = require('../db');

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
router.get('/:restaurante_id', async (req, res) => {
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
  try {
    const result = await pool.query(
      'INSERT INTO pedidos (restaurante_id, valor_total) VALUES ($1, $2) RETURNING *',
      [restaurante_id, valor_total || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
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
router.put('/:id', async (req, res) => {
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
