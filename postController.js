const mongoose = require('mongoose');
const Post = require('./postModel');
const User = require('./userModel');
const track = require('./timer');
const workerThreads = require('worker_threads');
const path = require('path');

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

const getOptimizedFeed = async (req, res) => {
  try {
    const feedPipelineRes = await Post.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorProfiles',
        },
      },
      {
        $unwind: '$authorProfiles',
      },
      {
        $project: {
          title: 1,
          content: 1,
          createdAt: 1,
          'authorProfiles.username': 1,
        },
      },
    ]);

    res.json(feedPipelineRes);
  } catch (err) {
    console.error('Internal server error');
    res.status(500).json({
      err: 'Error when generating optimized feed',
      message: err.message,
    });
  }
};

const getAllPostsUnoptimized = async (req, res) => {
  try {
    track.start(req, 'UnOptQuery');
    const posts = await Post.find({});
    res.json({
      count: posts.length,
      data: posts,
    });
  } catch (err) {
    console.error('Internal server error');
    res.status(500).json({
      err: 'Error when generating unoptimized feed',
      message: err.message,
    });
  } finally {
    track.end(req, 'UnOptQuery');
  }
};

// GOOD PRACTICE: Pagination
const getAllPostsOptimized = async (req, res) => {
  try {
    // 1. Get the page number from the query string (default to page 1)
    const page = parseInt(req.query.page) || 1;
    // 2. Set how many items per page (e.g., 10)
    const limit = parseInt(req.query.limit) || 10;

    // 3. Calculate how many documents to skip
    const skipIndex = (page - 1) * limit;

    console.time('OptimizedQuery');

    // 4. Query the database with skip and limit
    const posts = await Post.find({}).skip(skipIndex).limit(limit);

    console.timeEnd('OptimizedQuery');

    res.status(200).json({
      page,
      limit,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

const leakedData = [];
const triggerMemoryLeak = (req, res) => {
  // Defeating the V8 optimizer by generating 10,000 completely unique strings
  const uniquePayload = Array.from({ length: 1000 }, () =>
    Math.random().toString(36),
  );

  const heaveyObj = {
    user: req.query.username || 'Anonymous',
    timestamp: new Date(),
    payload: uniquePayload,
  };
  leakedData.push(heaveyObj);

  console.info(`${leakedData.length}`);
  res.send(`Size of leaked Data hold ${leakedData.length} objects in memory`);
};

// BAD PRACTICE: A heavy synchronous CPU task
const blockEventLoop = (req, res) => {
  console.log('Heavy task started by User A...');
  const start = Date.now();

  // A massive loop that forces the CPU to work hard for a few seconds
  let count = 0;
  for (let i = 0; i < 5_000_000_000; i++) {
    count++;
  }

  const end = Date.now();
  res.send(`Heavy task finished in ${end - start} milliseconds.`);
};

const nonBlockingHeavyWorker = (req, res) => {
  console.log('Heavy task delegated to heavy worker started by User A...');
  const start = Date.now();

  const worker = new workerThreads.Worker(
    path.join(__dirname, 'heavyWorker.js'),
  );

  worker.on('message', (message) => {
    res.send('Worked says count is ' + message);
    const end = Date.now();
    console.log(`Heavy task finished in ${end - start} milliseconds.`);
  });

  worker.on('error', (err) => {
    console.error(err);
    res.status(500).send('Worker failed');
  });
};

module.exports = {
  createUserPost,
  getAllPosts,
  getUserPost,
  getOptimizedFeed,
  getAllPostsUnoptimized,
  getAllPostsOptimized,
  triggerMemoryLeak,
  blockEventLoop,
  nonBlockingHeavyWorker,
};
