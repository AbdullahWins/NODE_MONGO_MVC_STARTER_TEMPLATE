// Controllers/hadithController.js

const { ObjectId } = require("mongodb");
const { hadithCategoriesCollection } = require("../../config/database/db");
const { Timekoto } = require("timekoto");

//get all Hadith
const getAllHadithCategories = async (req, res) => {
  try {
    const query = {};
    const cursor = hadithCategoriesCollection.find(query);
    const hadithCategories = await cursor.toArray();
    if (hadithCategories?.length === 0) {
      return res.send([]);
    }
    res.send(hadithCategories);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message:  "Server Error" });
  }
};

//get single HadithCategory
const getOneHadithCategory = async (req, res) => {
  try {
    const hadithCategoryId = req?.params?.id;
    //object id validation
    if (!ObjectId.isValid(hadithCategoryId)) {
      console.log("Invalid ObjectId:", hadithCategoryId);
      return res.status(400).send({ message:  "Invalid ObjectId" });
    }
    const hadithCategory = await hadithCategoriesCollection.findOne({
      _id: new ObjectId(hadithCategoryId),
    });
    if (!hadithCategory) {
      res.status(404).send({ message:  "hadith category rent not found" });
    } else {
      res.send(hadithCategory);
      console.log(hadithCategory);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message:  "Server Error" });
  }
};

//get HadithCategories By type
const getHadithCategoriesByType = async (req, res) => {
  try {
    const type = req.params.type;
    const response = hadithCategoriesCollection.find({
      type: type,
    });
    const hadithCategoriesByType = await response.toArray();
    if (!hadithCategoriesByType) {
      res.status(404).send({ message:  "hadith category not found on this type" });
    } else {
      console.log(hadithCategoriesByType);
      res.send(hadithCategoriesByType);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message:  "Server Error" });
  }
};

//add new HadithCategory
const addOneHadithCategory = async (req, res) => {
  try {
    const data = JSON.parse(req?.body?.data);
    const { categoryArabic, categoryEnglish, categoryTurkish, categoryUrdu } =
      data;
    //validate inputs
    if (
      !categoryArabic ||
      !categoryEnglish ||
      !categoryTurkish ||
      !categoryUrdu
    ) {
      return res.status(400).send("Incomplete Inputs");
    }
    //formatdata
    let formattedData = {
      categoryArabic,
      categoryEnglish,
      categoryTurkish,
      categoryUrdu,
      timestamp: Timekoto(),
    };
    //store data on database
    const result = await hadithCategoriesCollection.insertOne(formattedData);
    if (result?.acknowledged === false) {
      return res.status(500).send({ message:  "Failed to add hadith category" });
    }
    res.send(formattedData);
    console.log(formattedData);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message:  "Failed to add hadith category" });
  }
};

//update one HadithCategory
const updateHadithCategoryById = async (req, res) => {
  try {
    const hadithCategoryId = req.params.id;
    //object id validation
    if (!ObjectId.isValid(hadithCategoryId)) {
      console.log("Invalid ObjectId:", hadithCategoryId);
      return res.status(400).send({ message:  "Invalid ObjectId" });
    }
    const query = { _id: new ObjectId(hadithCategoryId) };
    const data = JSON.parse(req?.body?.data);
    let formattedData = { ...data };
    if (!formattedData) {
      return res.status(400).send({ message:  "Incomplete Inputs" });
    }
    //update data on database
    const result = await hadithCategoriesCollection.updateOne(query, {
      $set: formattedData,
    });
    if (result?.modifiedCount === 0) {
      return res.status(500).send({ message:  "No modifications were made" });
    }
    res.send(formattedData);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message:  "Failed to update hadith category" });
  }
};

//delete one HadithCategory
const deleteOneHadithCategoryById = async (req, res) => {
  try {
    const hadithCategoryId = req.params.id;
    //object id validation
    if (!ObjectId.isValid(hadithCategoryId)) {
      console.log("Invalid ObjectId:", hadithCategoryId);
      return res.status(400).send({ message:  "Invalid ObjectId" });
    }
    const query = { _id: new ObjectId(hadithCategoryId) };
    const result = await hadithCategoriesCollection.deleteOne(query);
    console.log(result);
    if (result?.deletedCount === 0) {
      console.log("no hadith category found with this id:", hadithCategoryId);
      res.send({ message:  "no hadith category found with this id!" });
    } else {
      console.log("hadith category deleted:", hadithCategoryId);
      res.status(200).send(result);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message:  "Failed to delete hadith category rent" });
  }
};

module.exports = {
  getAllHadithCategories,
  getOneHadithCategory,
  getHadithCategoriesByType,
  addOneHadithCategory,
  updateHadithCategoryById,
  deleteOneHadithCategoryById,
};
