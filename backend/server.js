const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Ei Xomano',
      version: '1.0.0',
      description: 'Documentação oficial dos endpoints do sistema Ei Xomano',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: [
    path.join(__dirname, 'server.js'),
    path.join(__dirname, 'routes', '*.js')
  ],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rotas
const restaurantesRoutes = require('./routes/restaurantes');
const produtosRoutes = require('./routes/produtos');
const pedidosRoutes = require('./routes/pedidos');
const dashboardRoutes = require('./routes/dashboard');
const logsRoutes = require('./routes/logs');
const funcionariosRoutes = require('./routes/funcionarios');
const mesasRoutes = require('./routes/mesas');

app.use('/auth', authRoutes);
app.use('/restaurantes', restaurantesRoutes);
app.use('/produtos', produtosRoutes);
app.use('/pedidos', pedidosRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/logs', logsRoutes);
app.use('/funcionarios', funcionariosRoutes);
app.use('/mesas', mesasRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}

module.exports = app;
