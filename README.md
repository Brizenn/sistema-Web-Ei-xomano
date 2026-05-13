# 🚀 Plataforma Ei Xomano

Bem-vindo ao repositório oficial da plataforma **Ei Xomano**! Este projeto é uma solução completa para gerenciamento de restaurantes, contando com um Backend robusto estruturado em API REST, integrações de banco de dados modernas com Prisma ORM e testes automatizados.

---

## 🛠️ Como rodar o projeto na sua máquina

Para que a equipe consiga baixar e rodar o projeto sem enfrentar problemas de versão ou configuração, siga o passo a passo abaixo:

### 1. Requisitos Prévios
- **Node.js** instalado (Recomendamos a versão LTS).
- Acesso ao banco de dados PostgreSQL.

### 2. Passo a passo para Instalação
1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd EiXomano_Final_V10
   ```

2. **Configure as Variáveis de Ambiente:**
   Crie um arquivo chamado `.env` na raiz do projeto (mesmo local onde fica este README). O arquivo `.env` não sobe para o Git por questões de segurança. Adicione a sua URL do banco de dados no seguinte formato:
   ```env
   DATABASE_URL="postgres://usuario:senha@host:porta/nomedobanco?sslmode=require"
   ```

3. **Instale as Dependências (Raiz e Backend):**
   ```bash
   npm install
   cd backend
   npm install
   cd ..
   ```

4. **Prepare o Banco de Dados (Prisma ORM):**
   Na raiz do projeto, rode os comandos para alinhar seu código com o banco e gerar a base de dados padrão:
   ```bash
   npx prisma generate
   npx prisma db seed
   ```
   *Nota: O comando de `seed` popula o banco com um Administrador, Dono de Restaurante e Produtos básicos para você poder testar.*

5. **Inicie o Servidor:**
   Volte para a pasta do backend e inicie a API:
   ```bash
   cd backend
   npm start
   ```
   A API estará rodando em `http://localhost:3000`.

---

## 🏗️ Arquitetura e Estrutura Principal

Para facilitar a compreensão do projeto durante apresentações ou desenvolvimento, aqui estão as localizações e o funcionamento dos módulos mais importantes:

### 1. CRUDs Funcionais + Dashboard com Métricas do UA
**📍 Localização:**
- **Backend:** `backend/routes/restaurantes.js`, `backend/routes/produtos.js`, `backend/routes/pedidos.js` e `backend/routes/dashboard.js`.
- **Frontend:** Lógicas localizadas no `frontend/app.js` e no arquivo HTML principal.

**⚙️ Funcionamento:**
Nossos CRUDs gerenciam ativamente os restaurantes, produtos do cardápio e o fluxo de pedidos. Toda criação, deleção ou edição reflete instantaneamente no banco de dados. O arquivo `dashboard.js` puxa esses dados usando funções de agregação do Prisma (somando o lucro, calculando média de pedidos) e injeta em tempo real no dashboard do Usuário Administrador (UA).

### 2. Autenticação e Permissões
**📍 Localização:**
- **Login e Validação:** `backend/routes/auth.js`
- **Controle de Acessos (Leão de Chácara):** `backend/middleware/authMiddleware.js`

**⚙️ Funcionamento:**
A segurança da plataforma é feita utilizando **Tokens JWT (JSON Web Tokens)**. Ao fazer o login, o sistema verifica as credenciais e devolve um Token de Acesso exclusivo e criptografado contendo o `cargo` (`UA` para Admin Global, ou `UR` para Dono de Restaurante).
Sempre que uma rota sensível é acessada, a requisição passa pelo `authMiddleware.js`, que intercepta a chamada, valida a autenticidade do token e decide se aquele nível de usuário tem permissão para realizar a ação.

### 3. Implementação da API REST
**📍 Localização:**
- **Servidor (Coração da API):** `backend/server.js`
- **Banco de Dados:** `backend/db.js` e schema em `prisma/schema.prisma`

**⚙️ Funcionamento:**
A aplicação segue os rigorosos padrões de arquitetura REST. O `server.js` centraliza o escopo da aplicação com o framework **Express**. A divisão foi feita de forma modular, recebendo e enviando dados **apenas no formato JSON**. Isso garante que a nossa regra de negócios fique completamente separada da interface do usuário (Frontend), oferecendo maior segurança, organização e velocidade.

### 4. Testes Automatizados
**📍 Localização:**
- **Suite de Testes:** `backend/tests/api.test.js`

**⚙️ Funcionamento:**
Implementamos testes de API automatizados para garantir a qualidade do sistema em cada nova modificação. Utilizando o ecossistema `Jest` combinado ao `Supertest`, simulamos requisições diretas ao servidor validando cenários como: 
- O Servidor está de pé? (Status 200).
- Tentativas de ataque ou logins inválidos são blindadas? (Status 4xx).
- Rotas desconhecidas acusam erro 404 adequadamente?

Para rodar a bateria de testes e atestar a saúde do sistema, execute:
```bash
cd backend
npm run test
```

---

Desenvolvido com 🩵 e muita dedicação para simplificar a gestão de bares e restaurantes!
