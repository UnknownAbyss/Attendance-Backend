const express = require("express");
const router = express.Router();

// ModelS
const { Punch } = require("../models/punch");
const { User } = require("../models/users");
const admin = require("../middleware/admin");


// Route to get All User summary per day
router.post("/summary", admin, async (req, res) => {
  try {
    const date = req.body?.date;
    if (!date) throw "No Date provided";

    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);

    let data = await User.aggregate([
      {
        $lookup: {
          from: Punch.collection.collectionName,
          let: { userId: "$userid" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$userref", "$$userId"] },
                    { $gte: ["$punchin", startDate] },
                    { $lt: ["$punchin", endDate] },
                  ],
                },
              },
            },
          ],
          as: "punches",
        },
      },
      {
          $unwind: {
              path: "$punches",
              preserveNullAndEmptyArrays: true
          }
      },
      {
          $group: {
              _id: "$userid",
              userName: { $first: "$name" },
              globalStartTime: { $min: "$punches.punchin" },
              globalEndTime: { $max: "$punches.punchout" },
              totalDistance: { $sum: "$punches.distance" }
          }
      },
      {
          $project: {
              _id: 0,
              userId: "$_id",
              userName: 1,
              globalStartTime: 1,
              globalEndTime: 1,
              totalDistance: 1
          }
      }
    ]);

    console.log(data);

    return res.status(200).json({ data });
  } catch (e) {
    // Error
    console.log(e);
    return res.status(500).json({ err: `${e}` });
  }
});

module.exports = router;
