const express = require("express");
const router = express.Router();

// ModelS
const { User } = require('../models/users');
const admin = require("../middleware/admin");
const { Punch } = require("../models/punch");
const { Remark } = require("../models/remark");

// PING
router.get("/", (req, res) => res.status(200).send("/auth: pong"));

// -----------
// POST:      userid
// RESPONSE:  name
// Verify if the User exists and return his username
// -----------
router.post("/verify", async (req, res) => {

  try {
    // UserID provided?
    const userid = req.body?.userid
    if (!userid) throw "No User Id provided"

    // UserID correct?
    const userObj = await User.findOne({ userid })
    if (!userObj) 
      return res.status(401).json({err: "Invalid credentials"})
    
    return res.status(200).json({name: userObj.name});
  } catch (e) {
    // Error
    return res.status(500).json({err: `${e}`});
  }

});

// -----------
// POST:      userid, name
// RESPONSE:  name
// Create a new User
// -----------
router.post("/create", admin, async (req, res) => {

  try {
    // UserID/Name provided?
    const {userid, name} = req.body
    if (!userid || !name) throw "Incomplete data"

    // UserID Duplicate?
    const userObj = await User.findOne({ userid })
    if (userObj) throw "User already exists"
    
    // Create new
    const newUserObj = await User.create({ userid, name })
    if (!newUserObj) throw "Couldn't create new User"

    return res.status(200).json({ name: newUserObj.name });
  } catch (e) {
    // Error
    return res.status(500).json({err: `${e}`});
  }
})

// -----------
// POST:      userid
// RESPONSE:  name
// Delete a User
// -----------
router.post("/delete", admin, async (req, res) => {

  try {
    // UserID provided?
    const userid = req.body?.userid
    if (!userid) throw "No User Id provided"

    const deletedObj = await User.findOneAndDelete({ userid });
    if (!deletedObj) throw "Object doesn't exist"
    
    await Punch.deleteMany({ userid })
    await Remark.deleteMany({ userid })

    return res.status(200).json({ name: deletedObj.name });
  } catch (e) {
    // Error
    return res.status(500).json({err: `${e}`});
  }
})

// -----------
// POST:      admin
// RESPONSE:  list of accounts
// Delete a User
// -----------
router.post("/accounts", admin, async (req, res) => {
  try {
    const users = await User.find()
    if (!users) throw "Database Error"

    return res.status(200).json({
      users: users
    })
  } catch (e) {
    // Error
    return res.status(500).json({err: `${e}`});
  }
})

// -----------
// POST:      admin
// RESPONSE:  unused_id
// Delete a User
// -----------
router.post("/requestid", admin, async (req, res) => {
  try {
    let id = 0
    while (true) {
      id = Math.floor(100000 + Math.random() * 900000)
      if (await User.exists({ userid: id }) == null) break
    }

    return res.status(200).json({
      id: id
    })
  } catch (e) {
    // Error
    console.log(e)
    return res.status(500).json({err: `${e}`});
  }
})


module.exports = router;
