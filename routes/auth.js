const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();

var express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs");
const { uuid } = require("uuidv4");
const { postsDB } = require("../mongo");

//Note: You do not have to create the users collection in mongodb before saving to it. Mongo will automatically create the users collection upon insert of a new document.

const createUser = async (username, passwordHash) => {
  try {
    const collection = await postsDB().collection("users");
    const user = {
      username: username,
      password: passwordHash,
      uid: uuid(),
    };
    //save user
    await collection.insertOne(user);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

router.post("/register-user", async function (req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const saltRounds = 5; // normal apps might use between 5 and 10
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    const userSaveSuccess = await createUser(username, hash);
    res.json({ success: userSaveSuccess });
  } catch (e) {
    console.error(e);
    res.json({ success: false });
  }
});

router.post("/login-user", async function (req, res) {
  //adding mongodb code to fetch a user from the database where the username matches the incoming username from req.body
  try {
    const collection = await postsDB().collection("users");
    const username = req.body.username;
    const password = req.body.password;
    const user = await collection.findOne({
      username: req.body.username,
    });
    const match = await bcrypt.compare(username, password);

    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const data = {
      time: new Date(),
      userId: user.uid, // double check this line of code to be sure that user.uid is coming from your fetched mongo user
    };
    const token = jwt.sign(data, jwtSecretKey);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
});

router.get("/validate-token", async function (req, res) {
  const tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
  const jwtSecretKey = process.env.JWT_SECRET_KEY;

  try {
    const token = req.header(tokenHeaderKey);

    const verified = jwt.verify(token, jwtSecretKey);
    if (verified) {
      return res.json({ success: true });
    } else {
      // Access Denied
      throw Error("Access Denied");
    }
  } catch (error) {
    // Access Denied
    console.log(error);
    return res.status(401).json({ success: true, message: String(error) });
  }
});

module.exports = router;
