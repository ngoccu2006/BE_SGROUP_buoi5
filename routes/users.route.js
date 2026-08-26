const express = require("express");

const router = express.Router();

const userController = require("../controllers/users.controller");

const validateUser = require("../middlewares/validateUser");
const asyncHandler = require("../middlewares/asyncHandler");

router.get(
  "/", 
  asyncHandler(userController.getAllUsers));
  
router.get(
    "/:id",
    asyncHandler(userController.getUserById)
);

router.post(
    "/",
    validateUser,
    asyncHandler(userController.createUser)
);

router.put(
    "/:id",
    validateUser,
    asyncHandler(userController.updateUser)
);

router.delete(
    "/:id",
    asyncHandler(userController.deleteUser)
);


module.exports = router;