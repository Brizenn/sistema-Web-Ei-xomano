const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * @swagger
 * /restaurantes:
 *   get:
 *     summary: Lista todos os restaurantes ativos (Apenas Admin Global UA)
 *     tags: [Restaurantes]
 *     responses:
 *       200:
 *         description: Lista de restaurantes ativos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurantes WHERE deletado_em IS NULL');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar restaurantes' });
  }
});

/**
 * @swagger
 * /restaurantes/dono/{dono_id}:
 *   get:
 *     summary: Lista os restaurantes de um dono específico (UR)
 *     tags: [Restaurantes]
 *     parameters:
 *       - in: path
 *         name: dono_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário dono
 *     responses:
 *       200:
 *         description: Lista de restaurantes do dono
 */
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

/**
 * @swagger
 * /restaurantes:
 *   post:
 *     summary: Cria um novo restaurante
 *     tags: [Restaurantes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - dono_id
 *             properties:
 *               nome:
 *                 type: string
 *               dono_id:
 *                 type: integer
 *               plano:
 *                 type: string
 *                 example: UG
 *     responses:
 *       201:
 *         description: Restaurante criado com sucesso
 */
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

/**
 * @swagger
 * /restaurantes/{id}:
 *   put:
 *     summary: Atualiza os dados de um restaurante existente
 *     tags: [Restaurantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do restaurante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               plano:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Restaurante atualizado com sucesso
 *       404:
 *         description: Restaurante não encontrado
 */
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

/**
 * @swagger
 * /restaurantes/{id}:
 *   delete:
 *     summary: Executa exclusão lógica (soft delete) de um restaurante
 *     tags: [Restaurantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do restaurante
 *     responses:
 *       200:
 *         description: Restaurante excluído com sucesso
 *       404:
 *         description: Restaurante não encontrado
 */
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
