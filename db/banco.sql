-- TABELA DE USUÁRIOS
CREATE TABLE usuarios (
id SERIAL PRIMARY KEY,
nome VARCHAR(100) NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
senha TEXT NOT NULL,
cargo VARCHAR(5) DEFAULT 'UR', -- UA: Admin Global, UR: Dono
plano VARCHAR(5) DEFAULT 'UG', -- UG: Grátis, UP: Premium, UE: Enterprise
criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- RESTAURANTES
CREATE TABLE restaurantes (
id SERIAL PRIMARY KEY,
nome VARCHAR(100) NOT NULL,
dono_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
plano VARCHAR(5),
criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- FUNCIONÁRIOS
CREATE TABLE funcionarios (
id SERIAL PRIMARY KEY,
restaurante_id INTEGER REFERENCES restaurantes(id) ON DELETE CASCADE,
nome VARCHAR(100) NOT NULL,
funcao VARCHAR(50), -- garcom, cozinheiro
criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- PRODUTOS (CARDÁPIO)
CREATE TABLE produtos (
id SERIAL PRIMARY KEY,
restaurante_id INTEGER REFERENCES restaurantes(id) ON DELETE CASCADE,
nome VARCHAR(100) NOT NULL,
preco NUMERIC(10,2) NOT NULL,
categoria VARCHAR(50),
descricao TEXT,
imagem_url TEXT
);
-- MESAS
CREATE TABLE mesas (
id SERIAL PRIMARY KEY,
restaurante_id INTEGER REFERENCES restaurantes(id) ON DELETE CASCADE,
numero INTEGER NOT NULL,
status VARCHAR(20) DEFAULT 'livre'
);
-- PEDIDOS
CREATE TABLE pedidos (
id SERIAL PRIMARY KEY,
restaurante_id INTEGER REFERENCES restaurantes(id) ON DELETE CASCADE,
mesa_id INTEGER REFERENCES mesas(id),
status VARCHAR(20) DEFAULT 'preparando', -- preparando, pronto, entregue
funcionario_id INTEGER REFERENCES funcionarios(id),
criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ITENS DO PEDIDO
CREATE TABLE itens_pedido (
id SERIAL PRIMARY KEY,
pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
produto_id INTEGER REFERENCES produtos(id),
quantidade INTEGER NOT NULL,
preco_unitario NUMERIC(10,2) NOT NULL
);
