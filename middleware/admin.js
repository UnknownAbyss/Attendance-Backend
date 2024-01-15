const admin = async (req, res, next) => {

  try {
    // UserID provided?
    const admin = req.body?.admin;
    
    if (!admin) throw "No Admin Id provided";

    // Check if Admin
    if (admin != process.env.ADMIN) 
      return res.status(401).json({err: "Authorization error"})

    next()

  } catch (e) {
    // Error
    return res.status(500).json({ err: `${e}` });
  }
};

module.exports = admin