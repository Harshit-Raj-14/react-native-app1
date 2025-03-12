import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode.');
  dotenv.config({ path: '.prod.env' });
} else {
  console.log('Running in development mode.');
  dotenv.config({ path: '.dev.env' });
}

const PORT = process.env.PORT || 5050;

// Middleware
const app = express();
app.use(express.json());
const allowedOrigins = ['http://localhost:3000', 'http://192.168.1.100:5050', 'http://192.168.1.52:5050', 'http://10.0.2.2:5050'];

const options: cors.CorsOptions = {
  origin: allowedOrigins
};
app.use(cors(options));

import apiRouter from './api';
app.use(apiRouter);


app.listen(PORT, () => {
  console.log(`Sher listening on port ${PORT}`);
});



// API version 1
// import v1UserRouter from './v1/routes/userRoutes'
// app.use("/api/v1/users", v1UserRouter);