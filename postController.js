const mongoose = require('mongoose');
const Post = require('./postModel');
const User = require('./userModel');

const createUserPost = async (req, res) => {
  const { title, content, authorId } = req.body;

  try {
    const author = await User.findById(authorId);
    if (!author) {
      return res.status(404).send('Author User not found');
    }

    const newPost = await Post.create({
      title,
      content,
      author: authorId,
    });

    res.status(201).json(newPost);
  } catch (err) {
    console.error('Internal server error', err);
    res.status(500).json({ error: 'failed to post', message: err.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username -_id');
    res.json(posts);
  } catch (err) {
    console.error('Internal server error', err);
    res
      .status(500)
      .json({ error: 'failed to fetch post', message: err.message });
  }
};

const getUserPost = async (req, res) => {
  const author = req.userProfile._id;
  try {
    console.log(author);
    const posts = await Post.find({ author }).select('title content createdAt');
    res.json(posts);
  } catch (err) {
    console.error('Internal server error');
    res
      .status(500)
      .json({ err: 'Error while fetching post', message: err.message });
  }
};

module.exports = { createUserPost, getAllPosts, getUserPost };
