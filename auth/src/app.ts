import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

const allowedOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';

app.use(
	cors({
		origin: allowedOrigin,
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	}),
);

app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

export default app;
