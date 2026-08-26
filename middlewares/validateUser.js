function validateUser(req, res, next) {
  const {name, email} = req.body;
  
  if(!name) {
    return res.status(400).json({
      message: "Name is required"
    });
  }
  
  if (name.length < 2) {
    return res.status(400).json({
      message: "Name must be at least 2 characters"
    });
  }

  if(!email) {
    return res.status(400).json({
      message: "Email is required"
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if(!emailRegex.test(email)){
    return res.status(400).json({
      message: "Invalid email"
    });
  }

  next();  // neu thoa thi cho di tiep same validator OK

}


module.exports = validateUser;