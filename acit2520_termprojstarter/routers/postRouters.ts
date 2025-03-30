import express from "express";
const router = express.Router();
import { ensureAuthenticated } from "../middleware/checkAuth";
import { addPost, getPosts, getSubs } from "../fake-db";
import { TPost } from "../types";

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
    const creator = req.user!.id;

    // Validate inputs
    if (!title || !subgroup) {
      return res.render("createPosts", {
        user: req.user,
        subs: getSubs(),
        error: "Title and subgroup are required",
        formData: req.body // Preserve form input
      });
    }

    if (!link && !description) {
      return res.render("createPosts", {
        user: req.user,
        subs: getSubs(),
        error: "Post must contain either a link or description",
        formData: req.body
      });
    }

    // Create post
    const newPost = addPost(
      title,
      link || "",
      creator,
      description || "",
      subgroup
    );

    // Redirect to new post on success
    res.redirect(`/posts/show/${newPost.id}`);
  } catch (err) {
    console.error("Error creating post:", err);
    res.render("createPosts", {
      user: req.user,
      subs: getSubs(),
      error: "Failed to create post",
      formData: req.body
    });
  }
});

router.get("/show/:postid", async (req, res) => {
  // ⭐ TODO
  res.render("individualPost");
});

router.get("/edit/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
});

router.post("/edit/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
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
