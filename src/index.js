require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Config
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Middlewares
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Rutas
const healthRouter = require('./routes/health.routes');
app.use('/health', healthRouter);

// Root
app.get('/', (req, res) => {
  res.json({ name: 'QATU API', version: '1.0.0' });
});

// Start
app.listen(PORT, () => {
  console.log("API listening on http://localhost:" + PORT);
});
