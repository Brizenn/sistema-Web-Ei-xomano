const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { verificarPermissaoPlanos } = require('../utils/businessRules');

/**
 * @swagger
 * /mesas/{restaurante_id}:
 *   get:
 *     summary: Listar mesas de um restaurante
 *     tags: [Mesas]
 */
router.get('/:restaurante_id', authMiddleware, async (req, res) => {
  const { restaurante_id } = req.params;
  
  if (req.user.role !== 'UA') {
    try {
      const restCheck = await pool.query('SELECT dono_id FROM restaurantes WHERE id = $1', [restaurante_id]);
      if (restCheck.rows.length === 0) return res.status(404).json({ error: 'Restaurante não encontrado' });
      if (Number(restCheck.rows[0].dono_id) !== Number(req.user.id)) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao validar propriedade.' });
    }
  }

  try {
    const result = await pool.query('SELECT * FROM mesas WHERE restaurante_id = $1 ORDER BY numero ASC', [restaurante_id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar mesas no banco.' });
  }
});

/**
 * @swagger
 * /mesas:
 *   post:
 *     summary: Criar uma nova mesa
 *     tags: [Mesas]
 */
router.post('/', authMiddleware, async (req, res) => {
  const { restaurante_id, numero, nome } = req.body;

  if (!restaurante_id || !numero) {
    return res.status(400).json({ error: 'Número da mesa e ID do restaurante são obrigatórios.' });
  }

  if (req.user.role !== 'UA') {
    try {
      const restCheck = await pool.query('SELECT dono_id FROM restaurantes WHERE id = $1', [restaurante_id]);
      if (restCheck.rows.length === 0) return res.status(404).json({ error: 'Restaurante não encontrado' });
      if (Number(restCheck.rows[0].dono_id) !== Number(req.user.id)) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao validar propriedade.' });
    }
  }

  // Validação de Negócio
  try {
    const restData = await pool.query('SELECT plano FROM restaurantes WHERE id = $1', [restaurante_id]);
    if (restData.rows.length > 0) {
      const plano = restData.rows[0].plano;
      const countData = await pool.query('SELECT COUNT(*) FROM mesas WHERE restaurante_id = $1', [restaurante_id]);
      const currentCount = parseInt(countData.rows[0].count, 10);

      if (!verificarPermissaoPlanos(plano, 'ADICIONAR_MESA', currentCount)) {
        return res.status(403).json({ error: `Limite de mesas excedido para o plano ${plano}.` });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao validar limites do plano.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO mesas (numero, nome, restaurante_id) VALUES ($1, $2, $3) RETURNING *',
      [numero, nome || `Mesa ${numero}`, restaurante_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar mesa no banco.' });
  }
});

/**
 * @swagger
 * /mesas/{id}:
 *   delete:
 *     summary: Excluir mesa
 *     tags: [Mesas]
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query('SELECT restaurante_id FROM mesas WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Mesa não encontrada.' });
    
    const restId = check.rows[0].restaurante_id;

    if (req.user.role !== 'UA') {
      const restCheck = await pool.query('SELECT dono_id FROM restaurantes WHERE id = $1', [restId]);
      if (Number(restCheck.rows[0].dono_id) !== Number(req.user.id)) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }
    }

    await pool.query('DELETE FROM mesas WHERE id = $1', [id]);
    res.json({ message: 'Mesa excluída com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir mesa.' });
  }
});

module.exports = router;
