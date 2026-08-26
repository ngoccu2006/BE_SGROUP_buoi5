const userService = require("../services/users.service");
const AppError = require("../utils/AppError");

async function getAllUsers(req, res){
    const users = await userService.getUsers();
    res.json(users);
}

async function getUserById(req, res){
  const id = Number(req.params.id);
  const user = await userService.getUserById(id);

  if(!user){
    throw new AppError("User not found", 404);
  }
  
  res.json(user);
}

async function createUser(req, res){
  const user = await userService.createUser(
    req.body.name,
    req.body.email
  )

  res.status(201).json({
    message: "User created",
    userCreate: user
  });
}

async function updateUser(req, res){

  const id = Number(req.params.id);

  const user = await userService.updateUser(
      id,
      req.body.name,
      req.body.email  
  );

  if (!user){
    return res.status(404).json({
      message: "User not found"
    })

  }

  res.json({
    message: "User updated",
    userUpdated: user
  });
}

async function deleteUser(req,  res){

  const id = Number(req.params.id);

  const user = await userService.deleteUser(id);

  if (!user){
    return res.status(404).json({
      message: "User not found"
    })
  }

  res.json({
    message: "Deleted success",
    userDeleted : user 
  })
}
module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};