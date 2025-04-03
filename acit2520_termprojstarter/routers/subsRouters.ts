const { ensureAuthenticated } = require("../middleware/checkAuth");
import express from "express";
import * as database from "../controller/postController";
import { getSubs, getPosts } from "../fake-db";
const router = express.Router();

router.get("/list", async (req, res) => {
  try {
    const subsArray = getSubs();
    const subs = [];

    for (let i = 0; i < subsArray.length; i++) {
      const sub = subsArray[i];

      const allPosts = getPosts(undefined);
      const filteredPosts = allPosts.filter((post) => post.subgroup === sub);
      const postCount = filteredPosts.length;

      subs.push({ name: sub, postCount });
    }

    subs.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));

    res.render("subs", { subs });
  } catch (error) {
    res.status(500).send("sever error");
  }
});

router.get("/show/:subname", async (req, res) => {
  try {
    const subname = req.params.subname;
    const allPosts = getPosts();
    const postsInSub = allPosts.filter((post) => post.subgroup === subname);
    res.render("sub", { subname, posts: postsInSub });
    //console.log("Rendering template with:", { subname, posts: postsInSub });
  } catch (error) {
    res.status(500).send("server error");
  }
});

export default router;
