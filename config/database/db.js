//database (mongodb)
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connect = async () => {
  await client.connect();
  console.log("Connected to MongoDB");
};

const db = client.db(process.env.DATABASE_NAME);
const adminsCollection = db.collection("adminsCollection");
const usersCollection = db.collection("usersCollection");
const hadithsCollection = db.collection("hadithsCollection");
const hadithCategoriesCollection = db.collection("hadithCategoriesCollection");

module.exports = {
  connect,
  adminsCollection,
  usersCollection,
  hadithsCollection,
  hadithCategoriesCollection,
};
