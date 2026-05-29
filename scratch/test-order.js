async function run() {
  try {
    const res = await fetch('http://localhost:3000/pedidos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ restaurante_id: 2, valor_total: 24.00 })
    });
    console.log('Status:', res.status);
    const json = await res.json();
    console.log('Response:', json);
  } catch (e) {
    console.error('Error:', e);
  }
}

run();
