const express = require("express");
const router = express.Router();
const authorized = require("../middleware/authorized")

// ModelS
const { User } = require('../models/users')
const { Punch } = require('../models/punch');
const { Remark } = require("../models/remark");
const processPoints = require("../utils/recalculatePaths");

// PING
router.get("/", (req, res) => res.status(200).send("/geo: pong"));

// Remark Uploading
router.post("/remark", authorized, async (req, res) => {
    try {
        const { userid, remark, timestamp} = req.body
        if (!(userid && remark && timestamp))
            throw "Some data not provided"

        let remarkObj = await Remark.create(
            {
                userref: userid,
                remark,
                timestamp
            }
        )
        if ( remarkObj == null ) throw "Could not register remark"

        res.status(200).json({})

        recalculatePaths()
    } catch (e) {
        // Error
        console.log(e)
        return res.status(500).json({err: `${e}`});
    }
})

// ----------- @Authorized
// POST:      userid, punchin, punchout, [points]
// RESPONSE:  validity
// Verify if the User exists and return his username
// -----------
router.post("/punch", authorized, async (req, res) => {
    try {
        const { userid, punchin, punchout, points} = req.body
        if (!(userid && punchin && punchout && points))
            throw "Some data not provided"

        let filteredPoints = []
        console.log(req.body)
        points.forEach(e => {
            console.log(e)
            filteredPoints.push({
                lat: e.latitude,
                long: e.longitude,
                status: e.status,
                timestamp: e.timestamp
            })
        });

        let punchObj = await Punch.create(
            {
                userref: userid,
                punchin: punchin,
                punchout: punchout,
                points: filteredPoints
            }
        )
        if ( punchObj == null ) throw "Could not register data"

        res.status(200).json({})

        processPoints(filteredPoints, punchObj.id)
        return
    } catch (e) {
        // Error
        console.log(e)
        return res.status(500).json({err: `${e}`});
    }
})


module.exports = router;