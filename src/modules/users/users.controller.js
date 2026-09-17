const userService = require("./users.service");
const AppError = require("../../utils/AppError");

async function getAllUsers(req, res){

  const page = req.query.page ? Number(req.query.page) : null;
  const limit = req.query.limit ? Number(req.query.limit) : null;

  const name = req.query.name || null;
  const email = req.query.email || null;

  const sortBy = req.query.sortBy || 'id';
  const sortOrder = req.query.sortOrder || 'ASC';  // theo thuws tu tang dan hay giam dan

  const result = await userService.getUsers(
    page,
    limit,
    name,
    email,
    sortBy,
    sortOrder
  );
  
  if(!page || !limit) {
    return res.json(result.users);
  }

  const totalPages = Math.ceil(
    result.total / limit
  );

  res.json({
    data: result.users,

    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: totalPages || 1
    }
  });
}

async function getUserById(req, res){
  const id = Number(req.params.id);
  const user = await userService.getUserById(id);

  if(!user){
    throw new AppError("User not found", 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: user
  });
}

async function createUser(req, res){
  const user = await userService.createUser(
    req.body.name,
    req.body.email,
    req.body.role_name
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
      req.body.email,
      req.body.role_name
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

async function deleteRoleController(req, res){
  const role_name = req.body.role_name;
  const result = await userService.deleteRoleSafely(role_name);

  res.status(200).json({
    status: 'success',
    data: result
  });
}

// dang ky thanh vien moi

async function register(req, res) {
  const { name, email, password, role_name} = req.body;

  // goi xuong serviee
  const newUser = await userService.registerUser(name, email, password, role_name || "User");
  
  res.status(201).json({
    status: "success",
    message: "Dang ky tai khoan thanh cong!",
    data: newUser
  })
}

async function login(req, res) {
  const {email, password} = req.body;

  // goi service kiem tra thong tin va ky ma token
  const result = await userService.loginUser(email, password);

  res.status(200).json({
    status: "success",
    message: "Dang nhap thanh cong!",
    data: result // this is token
  })
}

async function getMe(req, res){
  const id = Number(req.params.id);
  const userProfile = await userService.getMe(id);

  res.status(200).json({
    status: "success",
    message: "Lay thong tin thanh con!",
    data: userProfile // this is token
  })
}
module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deleteRoleController,
  register,
  login,
  getMe
};