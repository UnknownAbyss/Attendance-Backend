const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userid: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        unique: true,
        required: true
    }
})

const User = mongoose.model('user', userSchema)
module.exports = { User }