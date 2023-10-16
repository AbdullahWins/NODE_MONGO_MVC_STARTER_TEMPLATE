const router = require("express").Router();

const {
  getAllHadiths,
  getOneHadith,
  getHadithsByType,
  addOneHadith,
  updateHadithById,
  deleteOneHadithById,
} = require("../controllers/hadithController");

router.get("/hadiths/all", getAllHadiths);
router.get("/hadiths/find/:id", getOneHadith);
router.get("/hadiths/type/:type", getHadithsByType);
router.post("/hadiths/add", addOneHadith);
router.patch("/hadiths/update/:id", updateHadithById);
router.delete("/hadiths/delete/:id", deleteOneHadithById);

module.exports = router;
