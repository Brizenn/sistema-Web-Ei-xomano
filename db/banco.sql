DROP TABLE IF EXISTS logs_erro CASCADE;
DROP TABLE IF EXISTS dashboard_metricas CASCADE;
DROP TABLE IF EXISTS itens_pedido CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS mesas CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS funcionarios CASCADE;
DROP TABLE IF EXISTS restaurantes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 1. TABELA DE USUÁRIOS
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    cargo VARCHAR(5) DEFAULT 'UR', -- UA: Admin Global, UR: Dono de Restaurante
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE RESTAURANTES (Segurança Máxima)
CREATE TABLE restaurantes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    dono_id INTEGER REFERENCES usuarios(id) ON DELETE RESTRICT, -- Bloqueia se tentar apagar o dono
    plano VARCHAR(5), -- UE, UP, UG
    ativo BOOLEAN DEFAULT TRUE,
    deletado_em TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 3. TABELA DE FUNCIONÁRIOS
CREATE TABLE funcionarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cargo VARCHAR(50) NOT NULL, -- 'waiter' (garçom) ou 'cook' (cozinheiro)
    restaurante_id INTEGER NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA DE PRODUTOS
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    restaurante_id INTEGER REFERENCES restaurantes(id) ON DELETE RESTRICT, -- Bloqueia se tentar apagar restaurante com pratos
    nome VARCHAR(100) NOT NULL,
    preco NUMERIC(10,2) NOT NULL,
    categoria VARCHAR(50)
);

-- 4.5. TABELA DE MESAS
CREATE TABLE mesas (
    id SERIAL PRIMARY KEY,
    numero INTEGER NOT NULL,
    nome VARCHAR(100),
    restaurante_id INTEGER NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA DE PEDIDOS (Contabilidade Protegida)
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    restaurante_id INTEGER REFERENCES restaurantes(id) ON DELETE RESTRICT, -- PROTEÇÃO: Histórico não pode ser apagado
    valor_total NUMERIC(15,2) DEFAULT 0.00,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. DASHBOARD DE MÉTRICAS (Métricas de Contabilidade)
CREATE TABLE dashboard_metricas (
    id SERIAL PRIMARY KEY,
    restaurante_id INTEGER REFERENCES restaurantes(id) ON DELETE RESTRICT, -- Histórico blindado
    periodo_mes_ano VARCHAR(7) NOT NULL, -- Ex: '05-2026'
    faturamento_total NUMERIC(15,2) DEFAULT 0.00,
    qtd_pedidos_total INTEGER DEFAULT 0,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABELA DE LOGS (Para o seu Dashboard de Erros)
CREATE TABLE logs_erro (
    id SERIAL PRIMARY KEY,
    mensagem TEXT,
    origem VARCHAR(50),
    data_erro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
