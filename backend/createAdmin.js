const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

mongoose.connect("mongodb://localhost:27017/pharmahope");

async function createAdmin() {
  const username = "admin";
  const password = "123456"; // غيرها كما تشاء
  const hashed = await bcrypt.hash(password, 10);
  await Admin.create({ username, password: hashed });
  console.log("تم إنشاء مسؤول بنجاح!");
  process.exit();
}

createAdmin();