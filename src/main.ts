import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import BskyRoutes from './routes/mt-bsky';
import helmet from 'helmet';
import HealthRoutes from './routes/health';

const app = express();

// Set up rate limiter: maximum of twenty requests per minute
const RateLimit = require('express-rate-limit');
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});

// Apply rate limiter to all requests
app.use(limiter);
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/healthz', HealthRoutes);
app.use('/api/bsky', BskyRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
