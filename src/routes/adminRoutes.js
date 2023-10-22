const router = require("express").Router();
const { authenticateToken } = require("../middlewares/AuthorizeAdmin");

const {
  getOneAdmin,
  getAllAdmins,
  getAdminsByType,
  addOneAdmin,
  LoginAdmin,
  RegisterAdmin,
  updateAdminById,
  sendPasswordResetLink,
  updateAdminPasswordByEmail,
  updateAdminPasswordByOldPassword,
  deleteAdminById,
} = require("../controllers/adminController");

router.get("/admins/find/:id", authenticateToken, getOneAdmin);
router.get("/admins/all", authenticateToken, getAllAdmins);
router.get("/admins/types/:typeName", authenticateToken, getAdminsByType);
router.post("/admins/add", authenticateToken, addOneAdmin);
router.post("/admins/register", RegisterAdmin);
router.post("/admins/login", LoginAdmin);
router.post("/admins/reset", sendPasswordResetLink);
router.patch("/admins/reset", updateAdminPasswordByEmail);
router.patch("/admins/update/:id", authenticateToken, updateAdminById);
router.patch("/admins/resetpassword/:email", updateAdminPasswordByOldPassword);
router.delete("/admins/delete/:id", deleteAdminById);

module.exports = router;
