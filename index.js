const express = require("express");
const bodyparser = require("body-parser")
const authRouter = require("./routers/authRouter");
const geoRouter = require("./routers/geoRouter")

console.clear();

// Initialization
require("dotenv").config();
require("./models/init");
const app = express();

// -----------
// MiddleWare
// -----------
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())
app.use("/auth", authRouter);
app.use("/geo", geoRouter);

// -----------
// Catch-all Routes
// -----------
app.get("*", (req, res) => {
  res.status(404).send("GET: Page not found");
});

app.post("*", (req, res) => {
  res.status(404).send("POST: Page not found");
});

// -----------
// APP LISTEN ON PORT
// -----------
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
