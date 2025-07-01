import express from "express";
import routes from './routes.js';
import errorHandler from '../src/_middleware/error-handler.js';
import cors from 'cors';
import sequelize from './config/database-connection.js';

const app = express();

// Apenas esta linha é necessária para o CORS funcionar localmente
app.use(cors({ origin: 'http://localhost:5173' }));

app.use(express.json());
app.use(routes);
app.use(errorHandler);

app.listen(3333);