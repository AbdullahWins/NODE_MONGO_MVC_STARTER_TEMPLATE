const router = require("express").Router();

const {
  getAllHadithCategories,
  getOneHadithCategory,
  getHadithCategoriesByType,
  addOneHadithCategory,
  updateHadithCategoryById,
  deleteOneHadithCategoryById,
} = require("../controllers/hadithCategoryController");

router.get("/hadithCategories/all", getAllHadithCategories);
router.get("/hadithCategories/find/:id", getOneHadithCategory);
router.get("/hadithCategories/type/:type", getHadithCategoriesByType);
router.post("/hadithCategories/add", addOneHadithCategory);
router.patch("/hadithCategories/update/:id", updateHadithCategoryById);
router.delete("/hadithCategories/delete/:id", deleteOneHadithCategoryById);

module.exports = router;
