import express from "express";
const router = express.Router();
import { ensureAuthenticated } from "../middleware/checkAuth";
import { getPosts, getSubs, getUser, getPost, addPost, users } from "../fake-db";
import {TPost, TPosts, TUsers, TComments, TVotes, } from '../types';


router.get("/", async (req, res) => {
  const posts = await getPosts(20);
  const user = await req.user;
  res.render("posts", { posts, user });
});

router.get("/create", ensureAuthenticated, (req, res) => {
  res.render("createPosts", {
    user: req.user,
    subs: getSubs(),
    formData: {
      title: '',
      link: '',
      description:'',
      subgroup: ''
    }
  });
});

router.post("/create", ensureAuthenticated, async (req, res) => {
  try {
    const { title, link, description, subgroup } = req.body;
    
    // Ensure user is resolved
    const user = await req.user;
    if (!user) {
      throw new Error("User session expired");
    }

    const creatorId = Number(user.id);
    if (isNaN(creatorId)) {
      throw new Error("Invalid user ID format");
    }

    // Validate user exists in database
    const dbUser = getUser(creatorId);
    if (!dbUser) {
      throw new Error("User not found in database");
    }

    // Validate inputs
    if (!title || !subgroup) {
      return res.render("createPosts", {
        user,
        subs: getSubs(),
        error: "Title and subgroup are required",
        formData: req.body
      });
    }

    if (!link && !description) {
      return res.render("createPosts", {
        user,
        subs: getSubs(),
        error: "Post must contain either a link or description",
        formData: req.body
      });
    }

    // Create post
    const newPost = addPost(
      title,
      link || "",
      creatorId,
      description || "",
      subgroup
    );

    return res.redirect(`/posts/show/${newPost.id}`);
    
  } catch (err) {
    console.error("Post creation error:", err);
    return res.render("createPosts", {
      user: req.user,
      subs: getSubs(),
      error: err,
      formData: req.body
    });
  }
});

router.get("/show/:postid", async (req, res) => {
  try {
    const postId = parseInt(req.params.postid);
    const post = getPost(postId);
    
    if (!post) {
      return res.status(404).render("error", { 
        message: "Post not found" 
      });
    }

    res.render("individualPost", {
      post,
      user: req.user,
      isCreator: req.user?.id === post.creator.id
    });
  } catch (err) {
    console.error("Error showing post:", err);
    res.status(500).render("error", { 
      message: "An error occurred while loading the post" 
    });
  }
});


router.get("/edit/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
  const postId = parseInt(req.params.postid);
  const post = getPost(postId);

  res.render("editPost", {
    user: req.user,
    subs: getSubs(), // Assuming you want the subs list like in /create
    formData: {
      title: post.title,
      link: post.link,
      description: post.description,
      subgroup: post.subgroup
    }
  })
});

router.post("/edit/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
  try {
    const postId = parseInt(req.params.postid);
    const post = getPost(postId);
    
    if (isNaN(postId)) {
      return res.status(400).render("error", {message: "Post doesn't exist"})
    }

    if (!post) {
      return res.status(404).render("error", { 
        message: "Post not found" 
      });
    }

    const user = await req.user
    if (!user || user.id !== post.creator.id) {
      res.status(403).render("error", {message: "user is not the creator of the post"})
    }

    post.title = req.body.title
    post.link = req.body.link
    post.description = req.body.description
    post.subgroup = req.body.subgroup


  } catch (err) {
    console.error("Error showing post:", err);
    res.status(500).render("error", { 
      message: "An error occurred while loading the post" 
    });
  }
});

router.get("/deleteconfirm/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
});

router.post("/delete/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
});

router.post(
  "/comment-create/:postid",
  ensureAuthenticated,
  async (req, res) => {
    // ⭐ TODO
  }
);

export default router;
