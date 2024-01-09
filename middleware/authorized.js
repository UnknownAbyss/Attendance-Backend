const { User } = require('../models/users')

const authorized = async (req, res, next) => {

  try {
    // UserID provided?
    const userid = req.body?.userid;
    if (!userid) throw "No User Id provided";

    // Check validity of User
    const userObj = await User.findOne({ userid })
    if (!userObj) 
      return res.status(401).json({err: "Authorization error"})

    next()

  } catch (e) {
    // Error
    return res.status(500).json({ err: `${e}` });
  }
};

module.exports = authorized