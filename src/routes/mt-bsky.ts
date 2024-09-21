import { Router } from 'express';
import {
  checkHasPostedDailyPost,
  createPost,
  getPostForDate,
  getPostHistory,
  trackTodaysPost,
} from '../services/bsky';
import { format, getDate, getMonth } from 'date-fns';

const BskyRoutes = Router();

BskyRoutes.get('/mt/daily-post', async (req, res) => {
  const today = new Date();
  const monthName = format(today, 'LLLL').toLowerCase();
  const day = getDate(today);
  console.log(`DAILY POST: Get Post for ${monthName}/${day}`);
  const daysPost = await checkHasPostedDailyPost(monthName, day);
  console.log(`DAILY POST: Days Post`, JSON.stringify(daysPost));
  let post;
  if (daysPost) {
    console.log(`DAILY POST: Post It!`);
    post = `For day ${daysPost.day} - ${daysPost.post}`;
    res
      .status(200)
      .json({ message: "Already sent toda's message!", today, post });
  } else {
    console.log(`DAILY POST: Already Posted!`);
    post = await getPostForDate(today);
    await createPost(post, today);
    await trackTodaysPost(monthName, day, post);
    res.status(200).json({ message: "Today's message posted!", today, post });
  }
  console.log(`DAILY POST: /////////////////////`);
});

BskyRoutes.get('/mt/history', async (req, res) => {
  res.status(200).json(await getPostHistory());
});

export default BskyRoutes;
