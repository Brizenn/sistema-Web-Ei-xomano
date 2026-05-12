const express = require('express');
const router = express.Router();
const pool = require('../db');

// Listar produtos de um restaurante
router.get('/:restaurante_id', async (req, res) => {
  const { restaurante_id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM produtos WHERE restaurante_id = $1', [restaurante_id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Criar produto
router.post('/', async (req, res) => {
  const { restaurante_id, nome, preco, categoria } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO produtos (restaurante_id, nome, preco, categoria) VALUES ($1, $2, $3, $4) RETURNING *',
      [restaurante_id, nome, preco, categoria]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// Atualizar produto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, preco, categoria } = req.body;
  try {
    const result = await pool.query(
      'UPDATE produtos SET nome = COALESCE($1, nome), preco = COALESCE($2, preco), categoria = COALESCE($3, categoria) WHERE id = $4 RETURNING *',
      [nome, preco, categoria, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// Deletar produto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM produtos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

module.exports = router;
