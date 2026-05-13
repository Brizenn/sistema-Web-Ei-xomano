const request = require('supertest');
const app = require('../server');

describe('Testes Automatizados - Ei Xomano API', () => {
  it('GET /health deve retornar status 200 e confirmar que o servidor está rodando', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('POST /auth/login com credenciais inválidas deve ser rejeitado', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'naoexiste@eixomano.com',
      senha: 'senhaerrada123'
    });
    // O sistema deve rejeitar o login com 400 ou 401 ou 404
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
  
  it('Acesso a rota inexistente deve retornar 404', async () => {
    const res = await request(app).get('/rota-que-nao-existe');
    expect(res.statusCode).toEqual(404);
  });
});
