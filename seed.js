const mongoose = require('mongoose');
const Post = require('./postModel');
require('dotenv').config();

mongoose.connect(process.env.MONGO_DB_URI);

const seedPosts = async () => {
  try {
    console.log('Seeding 10K posts');

    const dummyPosts = [];
    for (let i = 0; i < 10_000; i++) {
      dummyPosts.push({
        title: `${i}. Dummy Post`,
        content: `${i}. Dummy Content`,
        author: '6a1fcb944b7931527ea69b03',
      });
    }

    await Post.insertMany(dummyPosts);
    console.log('Finished seeding the database with thousands of posts');
    process.exit();
  } catch (err) {
    console.error('Error while seeding :', err.message);
  }
};

seedPosts();
