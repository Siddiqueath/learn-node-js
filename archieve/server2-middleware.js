const express = require('express');
const app = express();

app.use(express.json());

const validatePassword = (req, res, next) => {
  const { password } = req.body;

  if (!password || password.length < 8) {
    return res
      .status(400)
      .send('password should be at least 8 characters long');
  }

  next();
};

app.post('/register', validatePassword, (req, res) => {
  res.send('User registered successfully');
});

app.listen(3000, () => console.log('Server is running on port 3000'));
