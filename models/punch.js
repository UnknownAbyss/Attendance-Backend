const mongoose = require('mongoose')

const punchSchema = new mongoose.Schema({
    userref: {
        type: String,
        required: true
    },
    punchin: {
        type: Date,
        required: true
    },
    punchout: {
        type: Date,
        required: true
    },
    distance: {
        type: Number,
        default: 0.0
    },
    polyline: {
        type: String,
        default: ""
    },
    points: [
        {
            lat: Number,
            long: Number,
            status: Boolean,
            timestamp: Date
        }
    ]
})

const Punch = mongoose.model('punch', punchSchema)
module.exports = { Punch }