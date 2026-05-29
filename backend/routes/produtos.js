const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { verificarPermissaoPlanos } = require('../utils/businessRules');

/**
 * @swagger
 * /produtos/{restaurante_id}:
 *   get:
 *     summary: Listar produtos de um restaurante
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: restaurante_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do restaurante
 *     responses:
 *       200:
 *         description: Lista de produtos do restaurante
 */
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

/**
 * @swagger
 * /produtos:
 *   post:
 *     summary: Criar produto
 *     tags: [Produtos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurante_id
 *               - nome
 *               - preco
 *               - categoria
 *             properties:
 *               restaurante_id:
 *                 type: integer
 *               nome:
 *                 type: string
 *               preco:
 *                 type: number
 *               categoria:
 *                 type: string
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 */
router.post('/', authMiddleware, async (req, res) => {
  const { restaurante_id, nome, preco, categoria } = req.body;
  try {
    // --- INÍCIO DA VALIDAÇÃO DE NEGÓCIO ---
    const restData = await pool.query('SELECT plano FROM restaurantes WHERE id = $1', [restaurante_id]);
    if (restData.rows.length === 0) return res.status(404).json({ error: 'Restaurante não encontrado' });
    const plano = restData.rows[0].plano;
    
    const countData = await pool.query('SELECT COUNT(*) FROM produtos WHERE restaurante_id = $1', [restaurante_id]);
    const currentCount = parseInt(countData.rows[0].count, 10);

    if (!verificarPermissaoPlanos(plano, 'ADICIONAR_PRODUTO', currentCount)) {
      return res.status(403).json({ error: `Limite de produtos excedido para o plano ${plano}.` });
    }
    // --- FIM DA VALIDAÇÃO DE NEGÓCIO ---

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

/**
 * @swagger
 * /produtos/{id}:
 *   put:
 *     summary: Atualizar produto
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               preco:
 *                 type: number
 *               categoria:
 *                 type: string
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       404:
 *         description: Produto não encontrado
 */
router.put('/:id', authMiddleware, async (req, res) => {
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

/**
 * @swagger
 * /produtos/{id}:
 *   delete:
 *     summary: Deletar produto
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso
 *       404:
 *         description: Produto não encontrado
 */
router.delete('/:id', authMiddleware, async (req, res) => {
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
