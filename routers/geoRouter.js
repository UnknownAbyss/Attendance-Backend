const express = require("express");
const router = express.Router();
const authorized = require("../middleware/authorized");

// ModelS
const { User } = require("../models/users");
const { Punch } = require("../models/punch");
const { Remark } = require("../models/remark");
const processPoints = require("../utils/recalculatePaths");

// PING
router.get("/", (req, res) => res.status(200).send("/geo: pong"));

// Remark Uploading
router.post("/remark", authorized, async (req, res) => {
  try {
    const { userid, remark, timestamp } = req.body;
    if (!(userid && remark && timestamp)) throw "Some data not provided";

    let remarkObj = await Remark.create({
      userref: userid,
      remark,
      timestamp: timestamp * 1000,
    });
    if (remarkObj == null) throw "Could not register remark";

    res.status(200).json({});
  } catch (e) {
    // Error
    console.log(e);
    return res.status(500).json({ err: `${e}` });
  }
});

// ----------- @Authorized
// POST:      userid, punchin, punchout, [points]
// RESPONSE:  validity
// Verify if the User exists and return his username
// -----------
router.post("/punch", authorized, async (req, res) => {
  try {
    const { userid, punchin, punchout, points } = req.body;
    if (!(userid && punchin && punchout && points))
      throw "Some data not provided";

    let filteredPoints = [];
    points.forEach((e) => {
      filteredPoints.push({
        lat: e.latitude,
        long: e.longitude,
        status: e.status == 3,
        timestamp: e.timestamp * 1000,
      });
    });

    let punchObj = await Punch.create({
      userref: userid,
      punchin: punchin * 1000,
      punchout: punchout * 1000,
      points: filteredPoints,
    });
    if (punchObj == null) throw "Could not register data";

    res.status(200).json({});

    processPoints(filteredPoints, punchObj.id);
    return;
  } catch (e) {
    // Error
    console.log(e);
    return res.status(500).json({ err: `${e}` });
  }
});

router.get("/recalculate", async (req, res) => {
  try {
    const punchesWithNoDistance = await Punch.find({ distance: null });

    // Update each punch individually
    await Promise.all(
      punchesWithNoDistance.map(async (punch) => {
        punch.distance = processPoints.calculateTotalDistance(punch.points); // Replace with the actual value you want to set
        await punch.save();
      })
    );

    res.json({ message: "Punches updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
