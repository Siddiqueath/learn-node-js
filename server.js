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

const logger = new Logger();
logger.on('route_hit', (req) => {
  console.log(`[ BackGround Task ${req.time}] - ${req.method} : ${req.path}`);
});

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  logger.logRequest(req);
  next();
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

const p1 = 'aVwDI405TT6Ay43p';
const dbURI = `mongodb+srv://siddique:${p1}@cluster0.06bv7ql.mongodb.net/?appName=Cluster0`;

mongoose
  .connect(dbURI)
  .then(() => console.log('Connected to Mongo DB Atlas'))
  .catch((err) =>
    console.log('Error occured while connection to database', err),
  );

app.listen(3000, () => console.log('server is running on port 3000'));
