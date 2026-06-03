require('dotenv').config();
const express = require('express');
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

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: 'http://localhost:3000',
  }),
);

app.use(express.json());
app.use((req, res, next) => {
  logger.logRequest(req);
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

const dbURI = process.env.MONGO_DB_URI;
mongoose
  .connect(dbURI)
  .then(() => console.log('Connected to Mongo DB Atlas'))
  .catch((err) =>
    console.error('Error occured while connection to database', err),
  );

module.exports = app;
