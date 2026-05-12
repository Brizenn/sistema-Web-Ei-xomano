const express = require('express');
const router = express.Router();
const pool = require('../db');

// Listar todos os restaurantes (Para o Admin Global UA)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurantes WHERE deletado_em IS NULL');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar restaurantes' });
  }
});

// Listar restaurantes por dono (Para o UR)
router.get('/dono/:dono_id', async (req, res) => {
  const { dono_id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM restaurantes WHERE dono_id = $1 AND deletado_em IS NULL', [dono_id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar restaurantes' });
  }
});

// Criar restaurante
router.post('/', async (req, res) => {
  const { nome, dono_id, plano } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO restaurantes (nome, dono_id, plano) VALUES ($1, $2, $3) RETURNING *',
      [nome, dono_id, plano]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar restaurante' });
  }
});

// Atualizar restaurante
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, plano, ativo } = req.body;
  try {
    const result = await pool.query(
      'UPDATE restaurantes SET nome = COALESCE($1, nome), plano = COALESCE($2, plano), ativo = COALESCE($3, ativo) WHERE id = $4 RETURNING *',
      [nome, plano, ativo, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Restaurante não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar restaurante' });
  }
});

// Soft delete restaurante
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE restaurantes SET deletado_em = CURRENT_TIMESTAMP, ativo = false WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Restaurante não encontrado' });
    res.json({ message: 'Restaurante excluído (soft delete)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar restaurante' });
  }
});

module.exports = router;
