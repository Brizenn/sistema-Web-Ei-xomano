const request = require('supertest');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'eixomano_secret_key';
const mockToken = jwt.sign({ id: 1, email: 'nathan@teste.com', role: 'UA' }, JWT_SECRET);

// Mock da conexão com o banco de dados antes de carregar o app para evitar chamadas de rede e travamentos
const pool = require('../db');
jest.mock('../db', () => {
  const mClient = {
    query: jest.fn(),
    release: jest.fn(),
  };
  return {
    query: jest.fn(),
    connect: jest.fn(() => Promise.resolve(mClient)),
    on: jest.fn()
  };
});

const app = require('../server');

describe('Testes de Componente - Ei Xomano API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('deve retornar status 200 e confirmar que o servidor está rodando', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });

  describe('POST /auth/login', () => {
    it('deve autenticar um usuário com sucesso', async () => {
      // Mockar o retorno do banco para o usuário e restaurante correspondentes
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, nome: 'Nathan', email: 'nathan@teste.com', senha: '123', cargo: 'UR' }]
      });
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 10, nome: 'Meu Restaurante', plano: 'UG', dono_id: 1, criado_em: new Date().toISOString() }]
      });

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'nathan@teste.com', pass: '123' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.name).toBe('Nathan');
      expect(res.body.restaurant.name).toBe('Meu Restaurante');
    });

    it('deve rejeitar login com credenciais inválidas', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'errado@eixomano.com', pass: 'senhaerrada' });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.msg).toBe('Credenciais inválidas.');
    });
  });

  describe('GET /restaurantes', () => {
    it('deve retornar a lista de restaurantes ativos', async () => {
      const mockRestaurantes = [
        { id: 1, nome: 'Restaurante A', plano: 'UG', ativo: true },
        { id: 2, nome: 'Restaurante B', plano: 'UP', ativo: true }
      ];
      pool.query.mockResolvedValueOnce({ rows: mockRestaurantes });

      const res = await request(app)
        .get('/restaurantes')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].nome).toBe('Restaurante A');
    });
  });

  describe('POST /produtos', () => {
    it('deve cadastrar um novo produto com sucesso', async () => {
      const novoProduto = { id: 5, restaurante_id: 10, nome: 'X-Salada', preco: '25.00', categoria: 'Hambúrgueres' };
      pool.query.mockResolvedValueOnce({ rows: [novoProduto] });

      const res = await request(app)
        .post('/produtos')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ restaurante_id: 10, nome: 'X-Salada', preco: 25.00, categoria: 'Hambúrgueres' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.nome).toBe('X-Salada');
      expect(res.body.preco).toBe('25.00');
    });
  });

  describe('Rotas inexistentes', () => {
    it('deve retornar 404 para rotas não configuradas', async () => {
      const res = await request(app).get('/rota-inexistente-123');
      expect(res.statusCode).toEqual(404);
    });
  });
});
