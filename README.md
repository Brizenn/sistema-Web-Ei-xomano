# 🚀 Plataforma Ei Xomano

Bem-vindo ao repositório oficial da plataforma **Ei Xomano**! Este projeto é uma solução completa para gerenciamento de restaurantes, contando com um Backend robusto estruturado em API REST, integrações de banco de dados modernas com Prisma ORM, segurança avançada com JWT, testes de componentes automatizados e testes de estresse de alta vazão.

---

## 🔒 Status de Segurança da API: O que está Aberto e o que está Fechado?

Para garantir a melhor experiência dos clientes finais sem abrir mão da segurança, dividimos as rotas da nossa API de forma inteligente:

### 🔴 Rotas FECHADAS (100% Protegidas com Token JWT)
Estas rotas exigem que o cabeçalho `Authorization: Bearer <seu-token-jwt>` seja enviado na requisição. Caso contrário, o servidor bloqueará o acesso imediatamente com o status **HTTP 401 Unauthorized** e a mensagem `larga de ser caba safado`.

*   **Restaurantes (`/restaurantes`)**:
    *   `GET /restaurantes` (Listar todos os restaurantes - restrito apenas para o cargo **UA**).
    *   `GET /restaurantes/dono/:dono_id` (Listar restaurantes de um dono - restrito apenas para o próprio dono **UR** correspondente ou **UA**).
    *   `POST /restaurantes` (Criar restaurante - apenas o usuário **UR** autenticado para si mesmo ou **UA**).
    *   `PUT /restaurantes/:id` e `DELETE /restaurantes/:id` (Editar/Deletar logicamente o restaurante - apenas o respectivo proprietário ou **UA**).
*   **Produtos e Cardápio (`/produtos`)**:
    *   `POST /produtos`, `PUT /produtos/:id`, `DELETE /produtos/:id` (Gerenciar o cardápio do restaurante - apenas o proprietário **UR** logado correspondente).
*   **Pedidos (`/pedidos`)**:
    *   `GET /pedidos/:restaurante_id` e `PUT /pedidos/:id` (Visualizar pedidos do KDS e atualizar status - apenas proprietários ou equipe autorizada do restaurante).
*   **Dashboard e Métricas (`/dashboard`)**:
    *   `GET /dashboard/admin/geral` (Listar métricas consolidadas globais - apenas administradores **UA**).
    *   `GET /dashboard/:restaurante_id` (Métricas financeiras de um restaurante específico - apenas o próprio dono ou **UA**).
    *   `POST /dashboard/atualizar` (Atualizar faturamento e quantidade de pedidos - restrito apenas a conexões autenticadas do próprio restaurante).
*   **Logs do Sistema (`/logs`)**:
    *   `GET /logs` (Apenas administradores globais **UA**).
*   **Atualização de Perfil (`/auth/update-profile`)**:
    *   `PUT /auth/update-profile` (Apenas o próprio usuário autenticado pode alterar seus dados, e apenas **UA** pode alterar privilégios/cargos).

### 🟢 Rotas ABERTAS (Públicas por Design)
Estas rotas precisam ser públicas para que novos clientes e usuários consigam acessar o sistema básico do restaurante nas mesas sem a necessidade de uma conta administrativa de funcionário.

*   `GET /produtos/:restaurante_id`: Aberto para que o cliente final consiga escanear o QR Code da mesa e carregar os produtos do cardápio sem precisar de login.
*   `POST /pedidos`: Aberto para que o cliente consiga enviar seu pedido diretamente da mesa para o painel de cozinha (KDS).
*   `POST /auth/login` e `POST /auth/register`: Portas de entrada para autenticação e registro na plataforma.
*   `GET /health`: Verificador de saúde do servidor para monitoramento de integridade e DevOps.

---

## 👥 Entendendo Cargos de Usuários e Planos de Assinatura

Para evitar confusões no banco de dados e no Prisma Studio, aqui está o mapeamento dos termos e siglas usados no projeto:

### 🔑 Cargos de Usuários (Campo `cargo` na tabela `usuarios`)
Representa as permissões de acesso ao sistema administrativo global e do restaurante:
1.  **`UA` (User Administrator / Administrador Global):** É o cargo máximo da plataforma. Tem acesso ao painel global, pode ver logs de erro, listar todos os restaurantes ativos e monitorar a receita agregada de toda a rede.
2.  **`UR` (User Restaurant / Dono de Restaurante):** É o proprietário do estabelecimento. Possui acesso total de gerência sobre o seu próprio restaurante, incluindo faturamento mensal, mapa de mesas, controle de equipe e edição de cardápio.
3.  *Equipe Interna (`cook` / `waiter`):* São os colaboradores cadastrados pelo proprietário (`UR`) no painel de funcionários. Eles não possuem conta de login direto na API administrativa global, atuando através dos painéis integrados de KDS da Cozinha e Garçom.

### 💳 Planos de Assinatura (Campo `plano` na tabela `restaurantes`)
Define os limites operacionais e recursos liberados para o restaurante:
*   **`UG` (Plano Gratuito):** Limite de até 15 produtos cadastrados, até 6 funcionários, mapa de mesas bloqueado e geração manual de QR Code para no máximo 7 mesas.
*   **`UP` (Plano Essencial):** Produtos ilimitados, limite de até 10 funcionários, mapa de mesas com até 12 mesas e relatórios de faturamento básicos.
*   **`UE` (Plano Empresarial):** Tudo ilimitado! Mesas ilimitadas, funcionários ilimitados, geração em lote de QR Codes e acesso ao painel de inteligência comercial consolidada (BI/Analytics avançado).
*   **`UA` (Plano Administrativo):** Plano virtual com recursos ilimitados exclusivo do administrador global.

---

## 🛠️ Como rodar o projeto na sua máquina

### 1. Requisitos Prévios
- **Node.js** instalado (Recomendamos a versão 18 LTS ou superior).
- Banco de dados PostgreSQL rodando (local ou na nuvem).

### 2. Configurando o Ambiente
1. **Configure as Variáveis de Ambiente:**
   Crie um arquivo chamado `.env` na raiz do projeto e adicione a URL de conexão com o seu banco de dados PostgreSQL e a chave do JWT:
   ```env
   DATABASE_URL="postgresql://usuario:senha@host:porta/nomedobanco?sslmode=require"
   JWT_SECRET="eixomano_secret_key"
   PORT=3000
   ```

2. **Instale as Dependências (Raiz e Backend):**
   ```bash
   npm install
   cd backend
   npm install
   ```

3. **Sincronize o Banco de Dados (Prisma ORM):**
   Ainda na pasta raiz do projeto, execute os comandos para criar as tabelas e popular o banco com os dados iniciais:
   ```bash
   npx prisma generate
   npx prisma db seed
   ```
   *(Nota: O comando de `seed` popula o banco de dados com um Administrador Global UA, um Dono de Restaurante UR e produtos básicos).*

4. **Inicie o Servidor Backend:**
   Acesse a pasta `backend` e inicie o servidor de desenvolvimento:
   ```bash
   cd backend
   npm run dev
   ```
   O servidor estará rodando em `http://localhost:3000`.

---

## 🚀 Comandos Úteis de Execução e Testes

Todos os comandos abaixo devem ser executados dentro da pasta `backend`:

```bash
cd backend
```

### 1. Executar os Testes Lógicos (Unitários + Integração)
Roda a bateria de 107 testes automatizados com Jest, validando cálculos, descontos, regras de planos e chamadas de API mockadas (sem impacto em banco de dados real):
```bash
npm test
```

### 2. Gerar e Visualizar a Interface de Cobertura de Código (Coverage)
Gera o relatório estatístico mostrando exatamente quais linhas do seu código estão protegidas por testes:
```bash
npm test -- --coverage
```
Para ver o dashboard visual e interativo no seu navegador:
1. Abra a pasta `backend/coverage/lcov-report/` no seu computador.
2. Dê duplo clique ou abra o arquivo **`index.html`** no seu navegador web (Chrome, Edge ou Firefox).

### 3. Rodar o Teste de Estresse da API
Dispara 1.000 requisições simultâneas em blocos de 100 conexões concorrentes contra rotas públicas e privadas do backend para testar a vazão e a estabilidade da API sob carga real extrema:
```bash
node tests/stress.js
```

---

## 🕵️ Guia de Auditoria Manual (Teste em Modo Privado)

Para atestar visualmente que nenhuma rota confidencial está aberta ou vazando informações, abra uma **janela anônima (Modo Privado)** no seu navegador ou use uma ferramenta como **Postman / Insomnia** e tente acessar os caminhos abaixo diretamente:

Todos eles devem, obrigatoriamente, retornar o status **HTTP 401 Unauthorized** e o JSON de erro abaixo:
```json
{ "success": false, "msg": "larga de ser caba safado" }
```

### Caminhos de teste para Auditoria:
1.  **Listar todos os Restaurantes (Acesso UA):**
    `http://localhost:3000/restaurantes`
2.  **Ver Logs de Erro do Sistema (Acesso UA):**
    `http://localhost:3000/logs`
3.  **Ver Dashboard Administrativo Geral (Acesso UA):**
    `http://localhost:3000/dashboard/admin/geral`
4.  **Ver Dashboard Financeiro de um Restaurante Específico (Acesso UR):**
    `http://localhost:3000/dashboard/1` (ou qualquer ID cadastrado)
5.  **Ver Pedidos no KDS da Cozinha de um Restaurante (Acesso UR/Funcionário):**
    `http://localhost:3000/pedidos/1`
6.  **Tentar Atualizar Perfis/Cargos de Usuários:**
    `http://localhost:3000/auth/update-profile` (Tente acessar diretamente por requisição)
7.  **Ver Funcionários de um Restaurante (Acesso UR/Funcionário):**
    `http://localhost:3000/funcionarios/1` (ou qualquer ID cadastrado)
    docker compose up -d
    *arrumar deploy lançar em alguma plataforma
    
---

Desenvolvido com 🩵 e muita dedicação para simplificar a gestão de bares e restaurantes!
