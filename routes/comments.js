var express = require("express");
const { postsDB } = require("../mongo");
var router = express.Router();

//creating comments and saving to db
router.post("/new-comment/:postId", async function (req, res) {
  try {
    const commentsCollection = await postsDB().collection("comments");
    const commentsCount = await commentsCollection.count();

    const postId = Number(req.params.postId);
    const comment = req.body.text;

    const commentId = Number(commentsCount + 1);

    const newComment = {
      text: comment, // Double check this
      id: commentId,
      createdAt: new Date(),
      lastModified: new Date(),
    };

    //save the comment to db
    await commentsCollection.insertOne(newComment);

    //Add the comment ID to the post
    const postsCollection = await postsDB().collection("posts");
    await postsCollection.findOneAndUpdate(
      {
        id: postId,
      },
      {
        $addToSet: {
          commentIdList: commentId,
        },
      }
    );

    res.status(200).json({ message: "Comment submitted" });
  } catch (e) {
    console.error(e);
    res.status(500).send("Comment was not saved.");
  }
});

router.get("/get-comments/:postId", async function (req, res) {
  try {
    //Get post from posts collection
    const postsCollection = await postsDB().collection("posts");
    const postId = Number(req.params.postId);

    const post = await postsCollection.findOne({
      id: postId,
    });

    console.log(post);

    const commentIdList = post.commentIdList;
    const commentsCollection = await postsDB().collection("comments");
    const postComments = await commentsCollection
      .find({
        id: {
          $in: commentIdList,
        },
      })
      .toArray();

    post.postComments = postComments; //Add the postComments array of comments as a key/value pair to post

    res
      .status(200)
      .json({ success: true, message: "Fetched post with comments", post });
  } catch (e) {
    console.error(e);
    res.status(500).send("Comment was not saved.");
  }
});

//work with this on App.js

router.get("/all-comments", async function (req, res) {
  try {
    console.log("");
    const collection = await postsDB().collection("comments");

    const comments = await collection.find().toArray();
    res.json({ message: comments });
  } catch (e) {
    console.error(e);
    res.status(500).send("Unable to obtain posts");
  }
});
module.exports = router;
