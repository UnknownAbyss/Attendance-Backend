const mongoose = require('mongoose')

const remarkSchema = new mongoose.Schema({
    userref: {
        type: String,
        required: true
    },
    remark: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    }
})

const Remark = mongoose.model('remark', remarkSchema)
module.exports = { Remark }