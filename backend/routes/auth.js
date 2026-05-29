const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'eixomano_secret_key';

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário e seu restaurante
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               pass:
 *                 type: string
 *               name:
 *                 type: string
 *               restName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário e Restaurante criados com sucesso
 *       400:
 *         description: Erro de validação ou E-mail já cadastrado
 */
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
      [name, email, pass] // bcrypt.compare(pass, user.senha) ATENÇÃO: Senha em texto plano para desenvolvimento. Num app real, use bcrypt.
    );
    
    const newUser = userResult.rows[0];

    // Inserir restaurante
    const restResult = await client.query(
      `INSERT INTO restaurantes (nome, dono_id, plano) 
       VALUES ($1, $2, 'UG') RETURNING *`,
      [restName, newUser.id]
    );

    const newRest = restResult.rows[0];

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.cargo },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      token,
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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica um usuário existente
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               pass:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *       401:
 *         description: Credenciais inválidas
 */
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

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.cargo },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
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

/**
 * @swagger
 * /auth/update-profile:
 *   put:
 *     summary: Atualiza nome e cargo do usuário logado
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               nome:
 *                 type: string
 *               cargo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.put('/update-profile', authMiddleware, async (req, res) => {
  const { userId, nome, cargo } = req.body;
  
  // Apenas Administradores Globais (UA) podem editar perfis alheios
  if (req.user.role !== 'UA' && Number(req.user.id) !== Number(userId)) {
    return res.status(403).json({ success: false, msg: 'Acesso negado. Você só pode atualizar seu próprio perfil.' });
  }

  // Apenas UA pode alterar cargo de usuários (ou elevar para UA/UR)
  if (cargo && req.user.role !== 'UA' && cargo !== req.user.role) {
    return res.status(403).json({ success: false, msg: 'Você não tem permissão para alterar cargos.' });
  }
  
  try {
    const result = await pool.query(
      'UPDATE usuarios SET nome = COALESCE($1, nome), cargo = COALESCE($2, cargo) WHERE id = $3 RETURNING *',
      [nome, cargo, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, msg: 'Usuário não encontrado.' });
    }
    
    res.status(200).json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ success: false, msg: 'Erro interno no servidor.' });
  }
});

module.exports = router;
