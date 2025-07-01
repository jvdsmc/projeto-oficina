import express from "express";
import routes from './routes.js';
import errorHandler from '../src/_middleware/error-handler.js';
import cors from 'cors';
import sequelize from './config/database-connection.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://jvdsmc.github.io'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Acesso não permitido por CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(routes);
app.use(errorHandler);

app.listen(3333);