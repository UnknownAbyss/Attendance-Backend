const express = require("express");
const router = express.Router();

// ModelS
const { Punch } = require("../models/punch");
const { User } = require("../models/users");
const admin = require("../middleware/admin");
const { Remark } = require("../models/remark");

router.post("/dateduser", admin, async (req, res) => {
  try {
    const { userid, date } = req.body;
    if (!(userid && date)) throw "Some data not provided";

    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);

    let data = await Punch.aggregate([
      {
        $match: {
          userref: userid,
          punchin: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $lookup: {
            from: User.collection.collectionName,
            localField: "userref",
            foreignField: "userid",
            as: "user"
        }
    },
    {
        $unwind: "$user"
    },
      {
        $group: {
          _id: "$userref",
          user: { $first: "$user.name" },
          punches: {
            $push: {
              distance: "$distance",
              startTime: "$punchin",
              endTime: "$punchout",
              points: "$points",
              polyline: "$polyline",
            },
          },
          totalDistance: { $sum: "$distance" },
          globalStartTime: { $min: "$punchin" },
          globalEndTime: { $max: "$punchout" },
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          user: 1,
          punches: 1, 
          totalDistance: 1,
          globalStartTime: 1,
          globalEndTime: 1,
        },
      },
    ]);

    return res.status(200).json({ data })
  } catch (e) {
    //Error
    console.log(e);
    return res.status(500).json({ err: `${e}` });
  }
});

router.post("/datedremarks", admin, async (req, res) => {
  try {
    const date = req.body?.date;
    if (!date) throw "No Date provided";

    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);

    let data = await Remark.aggregate([
      {
        $match: {
          timestamp: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $lookup: {
          from: User.collection.collectionName,
          localField: "userref",
          foreignField: "userid",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          timestamp: 1,
          name: "$user.name",
          remark: 1,
        },
      },
    ]);

    return res.status(200).json({ data });
  } catch (e) {
    // Error
    console.log(e);
    return res.status(500).json({ err: `${e}` });
  }
});

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
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$userid",
          userName: { $first: "$name" },
          globalStartTime: { $min: "$punches.punchin" },
          globalEndTime: { $max: "$punches.punchout" },
          totalDistance: { $sum: "$punches.distance" },
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          userName: 1,
          globalStartTime: 1,
          globalEndTime: 1,
          totalDistance: 1,
        },
      },
    ]);

    return res.status(200).json({ data });
  } catch (e) {
    // Error
    console.log(e);
    return res.status(500).json({ err: `${e}` });
  }
});

module.exports = router;
