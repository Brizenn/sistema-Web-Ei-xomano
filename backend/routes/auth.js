const express = require('express');
const router = express.Router();
const pool = require('../db');

// Registro de Usuário e Restaurante
router.post('/register', async (req, res) => {
  const { email, pass, name, restName } = req.body;
  
  if (!email || !pass || !name || !restName) {
    return res.status(400).json({ success: false, msg: 'Preencha todos os campos obrigatórios.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Verificar se o email já existe
    const userCheck = await client.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, msg: 'E-mail já cadastrado.' });
    }

    // Inserir usuário
    const userResult = await client.query(
      `INSERT INTO usuarios (nome, email, senha, cargo) 
       VALUES ($1, $2, $3, 'UR') RETURNING *`,
      [name, email, pass] // ATENÇÃO: Senha em texto plano para desenvolvimento. Num app real, use bcrypt.
    );
    
    const newUser = userResult.rows[0];

    // Inserir restaurante
    const restResult = await client.query(
      `INSERT INTO restaurantes (nome, dono_id, plano) 
       VALUES ($1, $2, 'UG') RETURNING *`,
      [restName, newUser.id]
    );

    const newRest = restResult.rows[0];

    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      user: newUser,
      restaurant: newRest
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro no registro:', error);
    res.status(500).json({ success: false, msg: 'Erro interno no servidor.' });
  } finally {
    client.release();
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, pass } = req.body;
  
  try {
    // Buscar usuário
    const userQuery = await pool.query('SELECT * FROM usuarios WHERE email = $1 AND senha = $2', [email, pass]);
    
    if (userQuery.rows.length === 0) {
      return res.status(401).json({ success: false, msg: 'Credenciais inválidas.' });
    }
    
    const user = userQuery.rows[0];
    
    // Buscar restaurante do usuário (se for dono 'UR')
    let restaurant = null;
    if (user.cargo === 'UR') {
      const restQuery = await pool.query('SELECT * FROM restaurantes WHERE dono_id = $1', [user.id]);
      if (restQuery.rows.length > 0) {
        restaurant = restQuery.rows[0];
      }
    }
    
    // Para simplificar, vamos retornar o usuário da mesma forma que o localStorage esperaria, 
    // mapeando os nomes dos campos para o que o app.js usa.
    const mappedUser = {
      id: user.id,
      email: user.email,
      pass: user.senha,
      name: user.nome,
      role: user.cargo,
      plan: restaurant ? restaurant.plano : null
    };

    res.status(200).json({
      success: true,
      user: mappedUser,
      restaurant: restaurant ? {
        id: restaurant.id,
        name: restaurant.nome,
        ownerEmail: user.email,
        plan: restaurant.plano,
        createdAt: new Date(restaurant.criado_em).getTime()
      } : null
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ success: false, msg: 'Erro interno no servidor.' });
  }
});

module.exports = router;
