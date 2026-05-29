const pool = require('./db');

async function test() {
  try {
    const res = await pool.query("INSERT INTO dashboard_metricas (restaurante_id, periodo_mes_ano, faturamento_total, qtd_pedidos_total) VALUES (1, '05-2026', 100.00, 2) RETURNING *");
    console.log("Inserted:", res.rows);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}
test();
