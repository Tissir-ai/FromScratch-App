import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { stripeWebhookHandler } from './controllers/paymentController.js';

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

// Stripe webhook requires the raw body. Mount the raw handler before the JSON body parser
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);
app.use(express.json());
app.use('/api', routes);

app.use(errorHandler);

export default app;
