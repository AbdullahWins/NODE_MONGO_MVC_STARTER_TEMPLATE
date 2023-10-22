// routes/userRoutes.js
const router = require("express").Router();
const {
  getOneUser,
  getAllUsers,
  getUsersByType,
  addOneUser,
  LoginUser,
  RegisterUser,
  updateUserById,
  sendPasswordResetLink,
  updateUserPasswordByEmail,
  updateUserPasswordByOldPassword,
  deleteUserById,
} = require("../controllers/userController");

router.get("/users/find/:id", getOneUser);
router.get("/users/all", getAllUsers);
router.get("/users/types/:typeName", getUsersByType);
router.post("/users/add", addOneUser);
router.post("/users/login", LoginUser);
router.post("/users/register", RegisterUser);
router.post("/users/reset", sendPasswordResetLink);
router.patch("/users/reset", updateUserPasswordByEmail);
router.patch("/users/update/:id", updateUserById);
router.patch("/users/resetpassword/:email", updateUserPasswordByOldPassword);
router.delete("/users/delete/:id", deleteUserById);

module.exports = router;
