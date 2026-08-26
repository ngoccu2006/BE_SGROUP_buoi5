const userRepository = require("../repository/users.repository");

// read
async function getUsers(){
  return await userRepository.getAllUsers();
}

async function getUserById(id){
  const user = await userRepository.getUserById(id);
  return user;
}

// create

async function createUser(name, email){
  // id auto 1->n
  return await userRepository.createUser(name, email);
}


//put

async function updateUser(id, name, email){
  const updatedUser = await userRepository.updateUser(id, name, email);
  
  return updatedUser;
}


// delete

async function deleteUser(id){
  const deletedUser = await userRepository.deleteUser(id);

  return deletedUser;
}

// xuất module để tái sử dụng

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
