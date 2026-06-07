require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const {
  getUser,
  deleteUser,
  registerUser,
  verifyUser,
} = require('./userController');
const Logger = require('./logger');
const mongoose = require('mongoose');
const fs = require('fs').promises;
const helmet = require('helmet');
const cors = require('cors');
const {
  createUserPost,
  getAllPosts,
  getUserPost,
  getOptimizedFeed,
  getUnoptimizedFeed,
  getAllPostsUnoptimized,
  getAllPostsOptimized,
  triggerMemoryLeak,
  blockEventLoop,
  nonBlockingHeavyWorker,
} = require('./postController');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: 'http://localhost:3000',
  }),
);

app.use(express.json());

app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  next();
});

const logger = new Logger();
logger.on('route_hit', (req) => {
  console.log(`[ BackGround Task ${req.time}] - ${req.method} : ${req.path}`);
});

const validatePassword = (req, res, next) => {
  const { password } = req.body;

  if (!password || password.length < 8) {
    return res
      .status(400)
      .send('password should be at least 8 characters long');
  }

  next();
};

app.get('/users/:username', verifyUser, getUser);

app.delete('/users/:username', deleteUser);

app.post('/register', validatePassword, registerUser);

app.get('/heavy', blockEventLoop);
app.get('/goodheavy', nonBlockingHeavyWorker);

const dbURI = process.env.MONGO_DB_URI;

mongoose
  .connect(dbURI)
  .then(() => console.log('Connected to Mongo DB Atlas'))
  .catch((err) =>
    console.error('Error occured while connection to database', err),
  );

app.get('/posts', getAllPosts);
app.get('/posts/bad', getAllPostsUnoptimized);
app.get('/posts/good', getAllPostsOptimized);
app.get('/users/:username/posts', verifyUser, getUserPost);
app.post('/users/:username/posts', createUserPost);

app.get('/leak', triggerMemoryLeak);
app.get('/feed', getOptimizedFeed);

module.exports = app;
