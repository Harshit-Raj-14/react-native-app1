import express from 'express';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode.');
  dotenv.config({ path: '.prod.env' });
} else {
  console.log('Running in development mode.');
  dotenv.config({ path: '.dev.env' });
}

const { PORT } = process.env;

const app = express();
app.use(express.json());

import apiRouter from './api';
app.use(apiRouter);

app.listen(PORT, () => {
  console.log(`Sher listening on port ${PORT}`);
});