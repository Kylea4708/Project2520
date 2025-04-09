import express from "express";
const router = express.Router();
import { ensureAuthenticated } from "../middleware/checkAuth";
import {
  getPosts,
  getSubs,
  getUser,
  getPost,
  addPost,
  users,
  deletePost,
} from "../fake-db";
import { TPost, TPosts, TUsers, TComments, TVotes } from "../types";

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
      title: "",
      link: "",
      description: "",
      subgroup: "",
    },
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
        formData: req.body,
      });
    }

    if (!link && !description) {
      return res.render("createPosts", {
        user,
        subs: getSubs(),
        error: "Post must contain either a link or description",
        formData: req.body,
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
      formData: req.body,
    });
  }
});

router.get("/show/:postid", async (req, res) => {
  try {
    const postId = parseInt(req.params.postid);
    const post = await getPost(postId);

    if (!post) {
      return res.status(404).render("error", {
        message: "Post not found",
      });
    }

    res.render("individualPost", {
      post,
      user: req.user,
      isCreator: req.user?.id === post.creator.id,
    });
  } catch (err) {
    console.error("Error showing post:", err);
  }
});

router.post("/edit/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
});

router.get("/deleteconfirm/:postid", ensureAuthenticated, async (req, res) => {
  try {
    const postId = parseInt(req.params.postid);
    const post = await getPost(postId);

    if (!post) {
      console.error("post not found");
    }

    if (!req.user || req.user.id !== post.creator.id) {
      console.error("unauthorized");
    }

    return res.render("delete_confirm", { post, user: req.user });
  } catch (err) {
    console.error("server error");
  }
});

router.post("/delete/:postid", ensureAuthenticated, async (req, res) => {
  try {
    const postId = parseInt(req.params.postid);
    const post = await getPost(postId);
    const subname = req.params.subname;
    await deletePost(postId);
    console.log(`Post with ID ${postId} deleted successfully.`);
    return res.redirect(`/subs/show/${subname}`);
  } catch (err) {
    console.error("Error during deletion:", err);
    if (err instanceof Error) {
      res.status(500).send(err.message);
    } else {
      res.status(500).send("An unexpected error occurred.");
    }
  }
});

router.post(
  "/comment-create/:postid",
  ensureAuthenticated,
  async (req, res) => {
    // ⭐ TODO
  }
);

export default router;
