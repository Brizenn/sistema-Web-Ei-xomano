const app = require('../server');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'eixomano_secret_key';
const mockToken = jwt.sign({ id: 1, email: 'nathan@teste.com', role: 'UA' }, JWT_SECRET);

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

const http = require('http');

function makeRequest(path, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve) => {
    const start = Date.now();
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          latency: Date.now() - start,
          success: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });

    req.on('error', (e) => {
      resolve({
        statusCode: 500,
        latency: Date.now() - start,
        success: false,
        error: e.message
      });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runStressTest() {
  console.log('\n======================================================');
  console.log('🔥 INICIANDO TESTE DE ESTRESSE DA API - EI XOMANO 🔥');
  console.log('======================================================');
  console.log(`Alvo: ${BASE_URL}`);
  console.log('Carga: 1.000 Requisições Totais (100 concorrentes por lote)');
  console.log('------------------------------------------------------\n');

  const totalRequests = 1000;
  const batchSize = 100;
  const results = [];

  const startTest = Date.now();

  for (let i = 0; i < totalRequests; i += batchSize) {
    const batchPromises = [];
    for (let j = 0; j < batchSize && (i + j) < totalRequests; j++) {
      // Alterna entre rotas públicas e rotas privadas protegidas
      const path = j % 2 === 0 ? '/health' : '/restaurantes';
      const headers = j % 2 === 0 ? {} : { 'Authorization': `Bearer ${mockToken}` };
      batchPromises.push(makeRequest(path, 'GET', headers));
    }
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    process.stdout.write(`Progresso: ${results.length}/${totalRequests} requisições concluídas...\r`);
  }

  const durationMs = Date.now() - startTest;
  const durationSec = durationMs / 1000;

  // Estatísticas
  const successCount = results.filter(r => r.success).length;
  const failureCount = totalRequests - successCount;
  const latencies = results.map(r => r.latency);
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);
  const rps = totalRequests / durationSec;

  console.log('\n\n======================================================');
  console.log('📊 RELATÓRIO DO TESTE DE ESTRESSE');
  console.log('======================================================');
  console.log(`Tempo Total decorrido : ${durationSec.toFixed(2)} segundos`);
  console.log(`Vazão (RPS)           : ${rps.toFixed(2)} req/seg`);
  console.log(`Requisições de Sucesso: ${successCount} (${((successCount / totalRequests) * 100).toFixed(1)}%)`);
  console.log(`Requisições com Falha : ${failureCount} (${((failureCount / totalRequests) * 100).toFixed(1)}%)`);
  console.log('------------------------------------------------------');
  console.log('⏱️  Métricas de Latência:');
  console.log(`Mínima : ${minLatency} ms`);
  console.log(`Máxima : ${maxLatency} ms`);
  console.log(`Média  : ${avgLatency.toFixed(2)} ms`);
  console.log('======================================================\n');
}

// Inicializa o servidor temporário para o teste de estresse
const server = app.listen(PORT, async () => {
  try {
    await runStressTest();
  } catch (error) {
    console.error('Erro ao executar o teste de estresse:', error);
  } finally {
    server.close(() => {
      console.log('Servidor de teste de estresse finalizado.');
      process.exit(0);
    });
  }
});
