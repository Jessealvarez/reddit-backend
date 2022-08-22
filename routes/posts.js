var express = require("express");
const { postsDB } = require("../mongo");
var router = express.Router();

router.get("/hello-posts", function (req, res) {
  res.json({ message: "Hi from express" });
});

router.get("/all-posts", async function (req, res) {
  try {
    const collection = await postsDB().collection("posts");

    const redditPosts = await collection.find().toArray();
    res.json({ message: redditPosts });
  } catch (e) {
    console.error(e);
    res.status(500).send("Unable to obtain posts");
  }
});

router.post("/post-submit", async function (req, res, next) {
  console.log("hello from /post-submit");
  //in case of null
  console.log(req.body);
  try {
    const title = req.body.title;
    const text = req.body.text;

    //need to figure out how to auto assign "author-field"
    const collection = await postsDB().collection("posts");
    const postsCollection = await collection.count();

    const redditPost = {
      title: title,
      text: text,
      //   author: author,
      id: Number(postsCollection + 1),
      commentIdList: [],
      createdAt: new Date(),
      lastModified: new Date(),
    };

    console.log("reddit post", redditPost);

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
    console.log("Post ID #:", postId);
    const collection = await postsDB().collection("posts");
    const singlePost = await collection.findOne({ id: postId });
    console.log("Post: ", singlePost);
    res.json(singlePost);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error! Can't find requested post.");
  }
});

module.exports = router;
