const express = require("express");
const router = express.Router();

// ModelS
const { Punch } = require("../models/punch");
const { User } = require("../models/users");
const admin = require("../middleware/admin");

Date.prototype.addHours= function(h, m){
    this.setHours(this.getHours()+h, this.getMinutes() + m);
    return this;
}

router.post("/summary", admin, async (req, res) => {
    try {
        const date = req.body?.date
        if (!date) throw "No Date provided"

        const startDate = new Date(date)
        startDate.setUTCHours(0,0,0,0)
        const endDate = new Date(date)
        endDate.setUTCHours(23,59,59,999)

        let data = await User.aggregate([
            {
                $lookup: {
                    from: Punch.collection.collectionName, // Use the actual name of the punches collection
                    localField: "userid",
                    foreignField: "userref",
                    as: "punches"
                }
            },
            {
                $unwind: {
                    path: "$punches",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    $or: [
                        { "punches.punchin": { $gte: startDate, $lt: endDate } },
                        { "punches.punchin": null } // Include users without punches
                    ]
                }
            },
            {
                $group: {
                    _id: "$userid",
                    userName: { $first: "$name" },
                    globalStartTime: { $min: "$punches.punchin" },
                    globalEndTime: { $max: "$punches.punchout" }
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    userName: 1,
                    globalStartTime: 1,
                    globalEndTime: 1
                }
            }
        ]);

        return res.status(200).json({ data });
    } catch (e) {
        // Error
        console.log(e)
        return res.status(500).json({err: `${e}`})
    }
})


module.exports = router