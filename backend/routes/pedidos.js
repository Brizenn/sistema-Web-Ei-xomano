const express = require('express');
const router = express.Router();
const pool = require('../db');

// Listar pedidos de um restaurante
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

// Criar pedido (Registra a contabilidade protegida)
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
