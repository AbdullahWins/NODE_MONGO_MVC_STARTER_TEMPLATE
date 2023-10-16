const { ObjectID } = require("mongodb");
const { adminsCollection } = require("../../config/database/db");
const { Timekoto } = require("timekoto");

class AdminModel {
  constructor(id, fullName, email, password) {
    this._id = id;
    this.fullName = fullName;
    this.email = email;
    this.password = password;
  }

  static async findByEmail(email) {
    const admin = await adminsCollection.findOne({ email: email });
    return admin;
  }

  static async findById(id) {
    console.log(id);
    const admin = await adminsCollection.findOne({ _id: ObjectID(id) });
    return admin;
  }

  static async createAdmin({ fullName, email, password }) {
    const newAdmin = {
      fullName,
      email,
      password,
      timestamp: Timekoto(),
    };
    const result = await adminsCollection.insertOne(newAdmin);
    const createdAdmin = {
      _id: result.insertedId,
      ...newAdmin,
    };
    return createdAdmin;
  }
}

module.exports = AdminModel;
