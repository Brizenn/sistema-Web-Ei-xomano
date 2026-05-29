const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../db/banco.sql'), 'utf8');
    await pool.query(sql);
    
    // Semeando o Banco de Dados (Seeds)
    await pool.query(`
      INSERT INTO usuarios (nome, email, senha, cargo) VALUES 
      ('Administrador Supremo', 'admin@eixomano.com', 'admin', 'UA'),
      ('João Dono', 'dono@restaurante.com', '123', 'UR')
    `);

    const donoRes = await pool.query("SELECT id FROM usuarios WHERE email = 'dono@restaurante.com'");
    const donoId = donoRes.rows[0].id;

    await pool.query(`
      INSERT INTO restaurantes (nome, dono_id, plano) VALUES 
      ('Restaurante Exemplo', $1, 'UP')
    `, [donoId]);

    const restRes = await pool.query("SELECT id FROM restaurantes WHERE dono_id = $1", [donoId]);
    const restId = restRes.rows[0].id;

    await pool.query(`
      INSERT INTO produtos (restaurante_id, nome, preco, categoria) VALUES 
      ($1, 'Hambúrguer Clássico', 25.90, 'Lanches')
    `, [restId]);

    console.log('Database schema and seeds applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error applying schema/seeds:', err);
    process.exit(1);
  }
}

run();
