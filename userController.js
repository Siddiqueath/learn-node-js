const fs = require('fs').promises;
const User = require('./userModel');
const bcrypt = require('bcrypt');

const getUser = async (req, res) => {
  const user = req.userProfile;
  try {
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
};

const deleteUser = async (req, res) => {
  const { username } = req.params;
  try {
    const result = await User.deleteOne({ username });
    if (result.deletedCount === 0) {
      return res.status(404).send(`username ${username} not found`);
    }

    res.send(`${username} deleted successfully`);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
};

const registerUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const encryptedPassword = await bcrypt.hash(password, 10);

    User.create({ username, password: encryptedPassword });

    res.send('User is registered successfully in database');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to register user');
  }
};

const verifyUser = async (req, res, next) => {
  const { username } = req.params;
  const { password } = req.headers;

  try {
    if (!password) {
      return res
        .status(401)
        .send('Access Denied: No password is sent on headers');
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send(`Username ${username} not found`);
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).send('Access Denied: Incorrect Password');
    }

    req.userProfile = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
};

module.exports = {
  getUser,
  deleteUser,
  registerUser,
  verifyUser,
};
