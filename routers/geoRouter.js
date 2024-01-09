const express = require("express");
const router = express.Router();
const authorized = require("../middleware/authorized")

// ModelS
const { User } = require('../models/users')

// PING
router.get("/", (req, res) => res.status(200).send("/geo: pong"));


module.exports = router;