var express = require("express");
const { postsDB } = require("../mongo");
var router = express.Router();

router.get("/hello-posts", function (req, res) {
  res.json({ message: "Hi from express" });
});

router.get("/all-posts", async function (req, res) {
  try {
    const collection = await postsDB().collection("redditposts");
    const limit = Number(req.query.limit);
    const skip = Number(req.query.limit) * (Number(req.query.page) - 1);
    const sortField = req.query.sortField;
    const sortOrder = req.query.sortOrder === "ASC" ? 1 : -1;
    const filterField = req.query.filterField;
    const filterValue = req.query.filterValue;

    let filterObj = {};
    if (filterField && filterValue) {
      filterObj = { [filterField]: filtervalue };
    }

    let sortObj = {};
    if (sortField && sortOrder) {
      sortObj = { [sortField]: sortOrder };
    }

    const redditPosts = await collection
      .find(filterObj)
      .sort(sortObj)
      .limit(limit)
      .skip(skip)
      .toArray();
    res.json({ message: redditPosts });
  } catch (e) {
    console.error(e);
    res.status(500).send("Unable to obtain posts");
  }
});

router.post("/post-submit", async function (req, res, next) {
  //in case of null
  console.log(req.body);
  try {
    const title = req.body.title;
    const text = req.body.text;
    //need to figure out how to auto assign "author-field"
    const collection = await blogsDB().collection("redditposts");
    const postsCollection = await collection.count();

    const redditPost = {
      title: title,
      text: text,
      //   author: author,
      id: Number(postsCollection + 1),
      createdAt: new Date(),
      lastModified: new Date(),
    };

    await collection.insertOne(redditPost);
    res.status(200).json({ message: "New Post Submitted" });
  } catch (e) {
    console.error(e);
    res.status(500).send("Error submitting post");
  }
});

router.get("/single-post/:postId", async function (req, res) {
  try {
    const postId = Number(req.params.postId);
    console.log(postId);
    const collection = await blogsDB().collection("redditposts");
    const post = await collection.findOne({ id: postId });
    console.log("Post: ", post);
    res.json(post);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error! Can't find requested post.");
  }
});

module.exports = router;
