const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { verificarPermissaoPlanos } = require('../utils/businessRules');

/**
 * @swagger
 * /funcionarios/{restaurante_id}:
 *   get:
 *     summary: Listar funcionários de um restaurante
 *     tags: [Funcionários]
 *     parameters:
 *       - in: path
 *         name: restaurante_id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:restaurante_id', authMiddleware, async (req, res) => {
  const { restaurante_id } = req.params;
  
  // Apenas Administrador UA ou o próprio dono UR correspondente podem ver
  if (req.user.role !== 'UA') {
    try {
      const restCheck = await pool.query('SELECT dono_id FROM restaurantes WHERE id = $1', [restaurante_id]);
      if (restCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Restaurante não encontrado' });
      }
      if (Number(restCheck.rows[0].dono_id) !== Number(req.user.id)) {
        return res.status(403).json({ error: 'Acesso negado. Você não é proprietário deste restaurante.' });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Erro ao validar propriedade.' });
    }
  }

  try {
    const result = await pool.query('SELECT * FROM funcionarios WHERE restaurante_id = $1 ORDER BY criado_em DESC', [restaurante_id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar funcionários no banco.' });
  }
});

/**
 * @swagger
 * /funcionarios:
 *   post:
 *     summary: Criar um novo funcionário
 *     tags: [Funcionários]
 */
router.post('/', authMiddleware, async (req, res) => {
  const { restaurante_id, nome, cargo } = req.body;

  if (!restaurante_id || !nome || !cargo) {
    return res.status(400).json({ error: 'Nome, cargo e ID do restaurante são obrigatórios.' });
  }

  // Apenas dono ou admin UA
  if (req.user.role !== 'UA') {
    try {
      const restCheck = await pool.query('SELECT dono_id FROM restaurantes WHERE id = $1', [restaurante_id]);
      if (restCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Restaurante não encontrado' });
      }
      if (Number(restCheck.rows[0].dono_id) !== Number(req.user.id)) {
        return res.status(403).json({ error: 'Acesso negado. Você não é proprietário deste restaurante.' });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Erro ao validar propriedade.' });
    }
  }

  // --- INÍCIO DA VALIDAÇÃO DE NEGÓCIO ---
  try {
    const restData = await pool.query('SELECT plano FROM restaurantes WHERE id = $1', [restaurante_id]);
    if (restData.rows.length > 0) {
      const plano = restData.rows[0].plano;
      const countData = await pool.query('SELECT COUNT(*) FROM funcionarios WHERE restaurante_id = $1', [restaurante_id]);
      const currentCount = parseInt(countData.rows[0].count, 10);

      if (!verificarPermissaoPlanos(plano, 'ADICIONAR_FUNCIONARIO', currentCount)) {
        return res.status(403).json({ error: `Limite de funcionários excedido para o plano ${plano}.` });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao validar limites do plano.' });
  }
  // --- FIM DA VALIDAÇÃO DE NEGÓCIO ---

  try {
    const result = await pool.query(
      'INSERT INTO funcionarios (nome, cargo, restaurante_id) VALUES ($1, $2, $3) RETURNING *',
      [nome, cargo, restaurante_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar funcionário no banco.' });
  }
});

/**
 * @swagger
 * /funcionarios/{id}:
 *   delete:
 *     summary: Excluir funcionário
 *     tags: [Funcionários]
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar funcionário para descobrir a qual restaurante pertence
    const check = await pool.query('SELECT restaurante_id FROM funcionarios WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado.' });
    }
    const restId = check.rows[0].restaurante_id;

    // Verificar permissão
    if (req.user.role !== 'UA') {
      const restCheck = await pool.query('SELECT dono_id FROM restaurantes WHERE id = $1', [restId]);
      if (Number(restCheck.rows[0].dono_id) !== Number(req.user.id)) {
        return res.status(403).json({ error: 'Acesso negado. Você não é proprietário deste restaurante.' });
      }
    }

    await pool.query('DELETE FROM funcionarios WHERE id = $1', [id]);
    res.json({ message: 'Funcionário excluído com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir funcionário no banco.' });
  }
});

module.exports = router;
