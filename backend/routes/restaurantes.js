const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

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
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'UA') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores globais podem listar todos os restaurantes.' });
  }
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
router.get('/dono/:dono_id', authMiddleware, async (req, res) => {
  const { dono_id } = req.params;
  
  if (req.user.role !== 'UA' && Number(req.user.id) !== Number(dono_id)) {
    return res.status(403).json({ error: 'Acesso negado. Você só pode ver os restaurantes associados ao seu próprio usuário.' });
  }

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
router.post('/', authMiddleware, async (req, res) => {
  const { nome, dono_id, plano } = req.body;

  if (req.user.role !== 'UA' && Number(req.user.id) !== Number(dono_id)) {
    return res.status(403).json({ error: 'Acesso negado. Você só pode criar um restaurante para seu próprio usuário.' });
  }

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
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { nome, plano, ativo } = req.body;
  try {
    // Verificar propriedade se não for Admin UA
    if (req.user.role !== 'UA') {
      const check = await pool.query('SELECT dono_id FROM restaurantes WHERE id = $1', [id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ error: 'Restaurante não encontrado' });
      }
      if (Number(check.rows[0].dono_id) !== Number(req.user.id)) {
        return res.status(403).json({ error: 'Acesso negado. Você não é o proprietário deste restaurante.' });
      }
    }

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
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar propriedade se não for Admin UA
    if (req.user.role !== 'UA') {
      const check = await pool.query('SELECT dono_id FROM restaurantes WHERE id = $1', [id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ error: 'Restaurante não encontrado' });
      }
      if (Number(check.rows[0].dono_id) !== Number(req.user.id)) {
        return res.status(403).json({ error: 'Acesso negado. Você não é o proprietário deste restaurante.' });
      }
    }

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
