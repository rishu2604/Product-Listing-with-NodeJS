const { validationResult } = require("express-validator");
const Post = require("../models/post");
const fs = require('fs');
const path = require('path');

exports.getPosts = (req, res, next) => {
  Post.find()
    .then((posts) => {
      res.status(200).json({ message: "Posts fetched", posts: posts });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No Image Provided");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path;

  // Create post in db
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: { name: "Rishu" },
  });

  post
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Post created successfully!",
        post: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Post fetched", post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    throw error;
  }

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;

  let imageUrl = req.body.image; // If the image is not changed
  
  if(!req.file){
    imageUrl = req.file.path; // If the image is changed
  }

  if(!imageUrl){
    const error = new Error('No file picked.');
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
  .then((post) => {
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }

    if(imageUrl !== post.imageUrl){
      clearImage(post.imageUrl);
    }

    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;

    return post.save();
  })
  .then(result => {
    res.status(200).json({message: 'Post Updated', post: result});
  })
  .catch(err => {
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  });
};


const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err))
}


exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
  .then(post => {
    if(!post){
      const error = new Error('No post found');
      error.statusCode = 422;
      throw error;
    }

    clearImage(post.imageUrl);

    return Post.findByIdAndRemove(postId);
  })
  .then(result => {
    console.log(result);
    res.status(200).json({message: 'Deleted Post'});
  })
  .catch(err => {
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  })
}