import { AtpAgent, RichText } from '@atproto/api';
import * as dotenv from 'dotenv';
import * as process from 'process';
import fs from 'fs-extra';
import { format, getDate } from 'date-fns';
import path from 'path';

dotenv.config();

const MT_POST_FILES_PATH = `../data/mt-posts`;
const POST_TRACKER = `../data/mt-posts/_post-tracker.json`;

export type PostTrackerPost = {
  day: number;
  post: string;
};

export type PostTrackerMonth = {
  month: string;
  posts: PostTrackerPost;
};

// Create a Bluesky Agent
const agent = new AtpAgent({
  service: 'https://bsky.social',
});

export async function checkHasPostedDailyPost(month: string, day: number) {
  const months = fs.readJSONSync(path.resolve(__dirname, POST_TRACKER));
  const monthsPost = months[month];
  if (!monthsPost) {
    return null;
  }
  const dayPost = monthsPost.find((post: PostTrackerPost) => {
    return post.day === day;
  });
  return dayPost;
}

export async function trackTodaysPost(
  month: string,
  day: number,
  post: string
) {
  const postTrackerJson = await fs.readJSON(
    path.resolve(__dirname, POST_TRACKER)
  );
  if (!Array.isArray(postTrackerJson[month])) {
    postTrackerJson[month] = [];
  }
  postTrackerJson[month]?.push({ day, post });
  await fs.writeJSON(path.resolve(__dirname, POST_TRACKER), postTrackerJson, {
    spaces: 2,
  });
}

export async function getPostHistory() {
  const postTrackerJson = await fs.readJSON(
    path.resolve(__dirname, POST_TRACKER)
  );
  return postTrackerJson;
}

export async function getPostForDate(today: Date = new Date()) {
  const day = getDate(today);
  const monthName = format(today, 'LLLL').toLowerCase();
  const posts = fs.readJSONSync(
    path.resolve(__dirname, MT_POST_FILES_PATH, `${monthName}.json`)
  );
  return posts[day - 1];
}

export async function createPost(text: string, date = new Date()) {
  await agent.login({
    identifier: process.env.BLUESKY_USERNAME!,
    password: process.env.BLUESKY_PASSWORD!,
  });
  const rt = new RichText({
    text,
  });
  await rt.detectFacets(agent); // automatically detects mentions and links
  await agent.post({
    text: rt.text,
    facets: rt.facets,
    langs: ['en-US'],
    createdAt: date.toISOString(),
  });
}
