const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas
const restaurantesRoutes = require('./routes/restaurantes');
const produtosRoutes = require('./routes/produtos');
const pedidosRoutes = require('./routes/pedidos');
const dashboardRoutes = require('./routes/dashboard');
const logsRoutes = require('./routes/logs');

app.use('/auth', authRoutes);
app.use('/restaurantes', restaurantesRoutes);
app.use('/produtos', produtosRoutes);
app.use('/pedidos', pedidosRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/logs', logsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
