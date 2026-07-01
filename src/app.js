require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

require('./config/database');

const ubicacionRoutes = require('./routes/ubicacionRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API TrackerGPS en funcionamiento.',
  });
});

app.use('/api/ubicaciones', ubicacionRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada.',
  });
});

app.use(errorHandler);

module.exports = app;
