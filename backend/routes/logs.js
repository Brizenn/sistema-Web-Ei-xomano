const express = require('express');
const router = express.Router();
const pool = require('../db');

// Listar todos os logs (Para o UA)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM logs_erro ORDER BY data_erro DESC LIMIT 100');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar logs' });
  }
});

// Registrar um log de erro
router.post('/', async (req, res) => {
  const { mensagem, origem } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO logs_erro (mensagem, origem) VALUES ($1, $2) RETURNING *',
      [mensagem, origem]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar log' });
  }
});

module.exports = router;
