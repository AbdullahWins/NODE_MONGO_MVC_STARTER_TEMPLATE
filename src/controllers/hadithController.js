// Controllers/hadithController.js

const { ObjectId } = require("mongodb");
const { hadithsCollection } = require("../../config/database/db");
const { Timekoto } = require("timekoto");

//get all Hadith
const getAllHadiths = async (req, res) => {
  try {
    const query = {};
    const cursor = hadithsCollection.find(query);
    const hadiths = await cursor.toArray();
    if (hadiths?.length === 0) {
      return res.send([]);
    }
    res.send(hadiths);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message:  "Server Error" });
  }
};

//get single Hadith
const getOneHadith = async (req, res) => {
  try {
    const hadithId = req?.params?.id;
    //object id validation
    if (!ObjectId.isValid(hadithId)) {
      console.log("Invalid ObjectId:", hadithId);
      return res.status(400).send({ message:  "Invalid ObjectId" });
    }
    const hadith = await hadithsCollection.findOne({
      _id: new ObjectId(hadithId),
    });
    if (!hadith) {
      res.status(404).send({ message:  "hadith rent not found" });
    } else {
      res.send(hadith);
      console.log(hadith);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message:  "Server Error" });
  }
};

//get Hadith By type
const getHadithsByType = async (req, res) => {
  try {
    const type = req.params.type;
    const response = hadithsCollection.find({
      type: type,
    });
    const hadithDetails = await response.toArray();
    if (!hadithDetails) {
      res.status(404).send({ message:  "hadith not found on this type" });
    } else {
      console.log(hadithDetails);
      res.send(hadithDetails);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message:  "Server Error" });
  }
};

//add new Hadith
const addOneHadith = async (req, res) => {
  try {
    const data = JSON.parse(req?.body?.data);
    const {
      hadithName,
      narratedBy,
      referenceBook,
      categoryArabic,
      categoryEnglish,
      categoryTurkish,
      categoryUrdu,
      hadithArabic,
      hadithEnglish,
      hadithTurkish,
      hadithUrdu,
    } = data;
    //validate inputs
    if (
      !hadithName ||
      !narratedBy ||
      !referenceBook ||
      !categoryArabic ||
      !categoryEnglish ||
      !categoryTurkish ||
      !categoryUrdu ||
      !hadithArabic ||
      !hadithEnglish ||
      !hadithTurkish ||
      !hadithUrdu
    ) {
      return res.status(400).send("Incomplete Inputs");
    }
    //formatdata
    let formattedData = {
      hadithName,
      narratedBy,
      referenceBook,
      categoryArabic,
      categoryEnglish,
      categoryTurkish,
      categoryUrdu,
      hadithArabic,
      hadithEnglish,
      hadithTurkish,
      hadithUrdu,
      timestamp: Timekoto(),
    };
    //store data on database
    const result = await hadithsCollection.insertOne(formattedData);
    if (result?.acknowledged === false) {
      return res.status(500).send({ message:  "Failed to add hadith" });
    }
    res.send(formattedData);
    console.log(formattedData);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message:  "Failed to add hadith" });
  }
};

//update one Hadith
const updateHadithById = async (req, res) => {
  try {
    const hadithId = req.params.id;
    //object id validation
    if (!ObjectId.isValid(hadithId)) {
      console.log("Invalid ObjectId:", hadithId);
      return res.status(400).send({ message:  "Invalid ObjectId" });
    }
    const query = { _id: new ObjectId(hadithId) };
    const data = JSON.parse(req?.body?.data);
    let formattedData = { ...data };
    if (!formattedData) {
      return res.status(400).send({ message:  "Incomplete Inputs" });
    }

    const result = await hadithsCollection.updateOne(query, {
      $set: formattedData,
    });
    if (result?.modifiedCount === 0) {
      return res.status(500).send({ message:  "No modifications were made" });
    }
    res.send(formattedData);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message:  "Failed to update hadith" });
  }
};

//delete one Hadith
const deleteOneHadithById = async (req, res) => {
  try {
    const hadithId = req.params.id;
    //object id validation
    if (!ObjectId.isValid(hadithId)) {
      console.log("Invalid ObjectId:", hadithId);
      return res.status(400).send({ message:  "Invalid ObjectId" });
    }
    const query = { _id: new ObjectId(hadithId) };
    const result = await hadithsCollection.deleteOne(query);
    console.log(result);
    if (result?.deletedCount === 0) {
      console.log("no hadith found with this id:", hadithId);
      res.send({ message:  "no hadith found with this id!" });
    } else {
      console.log("hadith deleted:", hadithId);
      res.status(200).send(result);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message:  "Failed to delete hadith rent" });
  }
};

module.exports = {
  getAllHadiths,
  getOneHadith,
  getHadithsByType,
  addOneHadith,
  updateHadithById,
  deleteOneHadithById,
};
