//controllers/userController.js

const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");
const { SendEmail } = require("../services/email/SendEmail");
const {
  usersCollection,
  stripesCollection,
} = require("../../config/database/db");
const { uploadMultipleFiles } = require("../utilities/fileUploader");

//login
const LoginUser = async (req, res) => {
  try {
    const data = JSON.parse(req?.body?.data);
    const { email, password } = data;
    const user = await UserModel.findByEmail(email);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const passwordMatch = await bcrypt.compare(password, user?.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const expiresIn = "7d";
    const token = jwt.sign(
      { email: user?.email },
      process.env.JWT_TOKEN_SECRET_KEY,
      { expiresIn }
    );
    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//registration
const RegisterUser = async (req, res) => {
  try {
    const data = JSON.parse(req?.body?.data);
    const { fullName, email, password } = data;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Incomplete input" });
    }
    const existingUserCheck = await UserModel.findByEmail(email);
    if (existingUserCheck) {
      return res.status(409).json({ message: "User already exists" });
    }
    //create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.createUser({
      fullName,
      email,
      password: hashedPassword,
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get all User
const getAllUsers = async (req, res) => {
  try {
    const query = {};
    const cursor = usersCollection.find(query);
    const users = await cursor.toArray();
    console.log(`Found ${users.length} users`);
    res.send(users);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server Error" });
  }
};

//get User by types
const getUsersByType = async (req, res) => {
  try {
    const userTypeName = req?.params?.typeName;
    const users = await usersCollection
      .find({ userType: userTypeName })
      .toArray();
    if (users.length === 0) {
      res
        .status(404)
        .send({ message: "No users found for the specified type" });
    } else {
      res.send(users);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server Error" });
  }
};

//get single user
const getOneUser = async (req, res) => {
  try {
    const userId = req.params.id;
    //object id validation
    if (!ObjectId.isValid(userId)) {
      console.log("Invalid ObjectId:", userId);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }
    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });
    if (!user) {
      res.status(404).send({ message: "user not found" });
    } else {
      console.log(user);
      res.send(user);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server Error" });
  }
};

//add new user
const addOneUser = async (req, res) => {
  const data = JSON.parse(req?.body?.data);

  const { fullName, email, password } = data;
  try {
    const query = { email: email };
    const existingUserCheck = await UserModel.findByEmail(query);
    if (existingUserCheck) {
      return res.status(409).json({ message: "user already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.createUser({
      fullName,
      email,
      password: hashedPassword,
    });
    console.log(newUser);
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to create new user" });
  }
};

//update one User
const updateUserById = async (req, res) => {
  try {
    const id = req.params.id;
    // Object ID validation
    if (!ObjectId.isValid(id)) {
      console.log("Invalid ObjectId:", id);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }
    const query = { _id: new ObjectId(id) };
    const { files } = req;
    const data = req.body.data ? JSON.parse(req.body.data) : {};
    const { password, ...additionalData } = data;
    const folderName = "users";
    let updateData = {};

    if (files?.length > 0) {
      const fileUrls = await uploadMultipleFiles(files, folderName);
      const fileUrl = fileUrls[0];
      updateData = { ...updateData, fileUrl };
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData = { ...updateData, password: hashedPassword };
    }

    if (Object.keys(additionalData).length > 0) {
      updateData = { ...updateData, ...additionalData };
    }

    const result = await usersCollection.updateOne(query, {
      $set: updateData,
    });

    if (result?.modifiedCount === 0) {
      console.log("No modifications were made:", id);
      res.status(404).send({ message: "No modifications were made!" });
    } else {
      console.log("User updated:", id);
      res.send(updateData);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to update user" });
  }
};

// send password reset link to user
const sendPasswordResetLink = async (req, res) => {
  try {
    const data = JSON.parse(req?.body?.data);
    const { email } = data;
    if (email) {
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      const receiver = result?.email;
      if (!receiver) {
        return res.status(401).send({ message: "admin doesn't exists" });
      } else {
        const subject = "Reset Your Password";
        const text = `Please follow this link to reset your password: ${process.env.USER_PASSWORD_RESET_URL}/${receiver}`;
        const status = await SendEmail(receiver, subject, text);
        if (!status?.code === 200) {
          return res.status(401).send({ message: "user doesn't exists" });
        }
        res
          .status(200)
          .send({ message: "Password reset link sent successfully" });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to reset user password" });
  }
};

//update one user password by email
const updateUserPasswordByEmail = async (req, res) => {
  try {
    const data = JSON.parse(req?.body?.data);
    const { email, newPassword } = data;
    let updateData = {};
    if (email && newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData = { password: hashedPassword };
    }
    const query = { email: email };
    const result = await usersCollection.updateOne(query, {
      $set: updateData,
    });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to reset user password" });
  }
};

//update one user password by OldPassword
const updateUserPasswordByOldPassword = async (req, res) => {
  try {
    const email = req?.params?.email;
    console.log(email);
    const query = { email: email };
    const data = JSON.parse(req?.body?.data);
    const user = await UserModel.findByEmail(email);

    const { oldPassword, newPassword } = data;
    let updateData = {};

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const passwordMatch = await bcrypt.compare(oldPassword, user?.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "invalid password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    updateData = { password: hashedPassword };
    const result = await usersCollection.updateOne(query, {
      $set: updateData,
    });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to update user password" });
  }
};

//delete one user
const deleteUserById = async (req, res) => {
  try {
    const id = req.params.id;
    //object id validation
    if (!ObjectId.isValid(id)) {
      console.log("Invalid ObjectId:", id);
      return res.status(400).send({ message: "Invalid ObjectId" });
    }
    const query = { _id: new ObjectId(id) };
    const result = await usersCollection.deleteOne(query);
    if (result?.deletedCount === 0) {
      console.log("no user found with this id:", id);
      res.send("no user found with this id!");
    } else {
      console.log("user deleted:", id);
      res.send({ message: "user deleted successfully with id:" + id });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to delete user" });
  }
};

module.exports = {
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
};
