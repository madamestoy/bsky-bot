import { Router } from 'express';
import {
  checkHasPostedDailyPost,
  createPost,
  getPostForDate,
  getPostHistory,
  trackTodaysPost,
} from '../services/bsky';
import { format, getDate, getMonth } from 'date-fns';

const HealthRoutes = Router();

HealthRoutes.get('/', async (req, res) => {
  res.status(200).json({ success: true });
});

export default HealthRoutes;
