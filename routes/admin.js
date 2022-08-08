var express = require("express");
var router = express.Router();
//import database
const { postsDB } = require("../mongo");

router.get("/post-list", async (req, res) => {
  try {
    const collection = await postsDB().collection("posts");
    const redditPosts = await collection
      .find({})
      .project({
        id: 1,
        title: 1,
        author: 1,
        createdAt: 1,
        lastModified: 1,
      })
      .toArray();

    res.status(200).json({ message: redditPosts, success: true });
  } catch (e) {
    res
      .status(500)
      .json({ message: "Error fetching posts " + e, success: false });
  }
});

router.put("/edit-post", async (req, res) => {
  try {
    const collection = await postsDB().collection("posts");
    const postId = Number(req.body.id);
    const title = req.body.title;
    const text = req.body.text;
    const date = new Date();

    const updatePost = {
      title: title,
      text: text,
      lastModified: date,
    };

    await collection.updateOne({ id: postId }, { $set: { ...updatePost } });
    res.status(200).json({ message: "Post Updated", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error encountered while updating post" + error,
      success: false,
    });
  }
});

router.delete("/delete-post/:postId", async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    const collection = await postsDB().collection("posts");
    const postToDelete = await collection.deleteOne({ id: postId });
    if (postToDelete.deletedCount === 1) {
      res.json({ message: "Successfully deleted", success: true }).status(200);
    } else {
      res.json({ message: "Unable to delete", success: false }).status(204);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" + error, success: false });
  }
});

module.exports = router;
