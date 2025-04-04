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
    //temp to check if user validation is working
    console.log("✅ Logged-in user ID:", req.user ? req.user.id : "No user");
    console.log(
      "📌 Post Creator ID:",
      post.creator ? post.creator.id : "No creator"
    );

    res.render("individualPost", {
      post,
      user: req.user,
      isCreator: req.user?.id === post.creator.id,
    });
  } catch (err) {
    console.error("Error showing post:", err);
  }
});


router.get("/edit/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
  /*
  try {
    const { title, link, description, subgroup } = req.body;
    const user = await req.user;
    const postId = parseInt(req.params.postid);
    const post = getPost(postId);

    // form for editing an existing post
    res.render("editPost", {
      post,
      user: req.user,
      isCreator: req.user?.id === post.creator.id
    })

    // What parts of the post can be edited

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

    const editedpost = editPost(
      changes: {
        title,
        link || "",
        description,
        subgroup
      })
  } catch (err) {
    // Shouldn't be loaded unless you are a correct user
    console.error("error on edit:", err)
    res.status(500).render("error", {
      message: "An error occured when loading the post to edit"
    })
  }
 */ 
});

router.post("/edit/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO

  // redirect back to post when done
  
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

    await deletePost(postId);
    console.log(`Post with ID ${postId} deleted successfully.`);
    return res.redirect("/posts");
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