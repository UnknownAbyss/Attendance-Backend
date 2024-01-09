const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO)
.catch((e) => console.log(`Couldn't connect to DB: ${e}`) )
.then(() => console.log(`Connected to DB`) )