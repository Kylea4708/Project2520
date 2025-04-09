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
  editPost,
  addComment,
} from "../fake-db";
import { TPost, TPosts, TUsers, TComments, TVotes } from "../types";
import { timeStamp } from "console";

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

router.get("/editpost/:postid", ensureAuthenticated, async (req, res) => {
  try {
    const postId = parseInt(req.params.postid);
    const post = getPost(postId);
    const user = await req.user;

    // form for editing an existing post
    if (!post) {
      return res.status(404).render("error", {
        message: "Post not found",
      });
    }

    if (user?.id !== Number(post.creator.id)) {
      return res.status(403).render("error", {
        message: "You do not have permission to edit this post",
      });
    }

    // What parts of the post can be edited
    res.render("edit_post", {
      post,
      user,
      subs: getSubs(),
    });
  } catch (err) {
    // Shouldn't be loaded unless you are a correct user
    console.error("error on edit:", err);
    res.status(500).render("error", {
      message: "An error occured when loading the post to edit",
    });
  }
});

router.post("/edit/:postid", ensureAuthenticated, async (req, res) => {
  try {
    const { title, link, description, subgroup } = req.body;
    const postId = parseInt(req.params.postid);
    const post = getPost(postId);
    const user = await req.user;

    // redirect back to post when done
    if (!post) {
      return res.status(404).render("error", {
        message: "Post not found",
      });
    }

    if (user?.id !== Number(post.creator.id)) {
      return res.status(403).render("error", {
        message: "You do not have permission to edit this post",
      });
    }

    if (!title || !subgroup) {
      return res.render("editpost", {
        user,
        subs: getSubs(),
        error: "Title and subgroup are required",
        formData: req.body,
      });
    }

    if (!link && !description) {
      return res.render("editpost", {
        user,
        subs: getSubs(),
        error: "Post must contain either a link or description",
        formData: req.body,
      });
    }

    editPost(postId, {
      title,
      link,
      description,
      subgroup,
    });

    return res.redirect(`/posts/show/${postId}`);
  } catch (err) {
    console.error("Post creation error:", err);
    return res.render("editpost", {
      user: req.user,
      subs: getSubs(),
      error: err,
      formData: req.body,
    });
  }
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
    // remember how GET /posts/show/:postid has a form for comments? It submits to here. Look there

    try {
      const { description } = req.body;
      const user = await req.user;
      const postId = parseInt(req.params.postid);
      const post = getPost(postId);

      if (!user) {
        throw new Error("User session expired");
      }

      if (!post) {
        return res.status(404).render("error", {
          message: "Post not found",
        });
      }

      if (!description) {
        return res.redirect(
          `/posts/show/${postId}?error=Comment can't be empty`
        );
      }

      const newcomment = addComment(postId, user.id, description);

      return res.redirect(`/posts/show/${postId}`);
    } catch (err) {
      console.error("Comment creation error:", err);

      const postId = parseInt(req.params.postid);

      return res.redirect(`/posts/show/${postId}?error=Error creating comment`);
    }
  }
);

export default router;
