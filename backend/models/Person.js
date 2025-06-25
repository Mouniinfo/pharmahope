const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ["donor", "recipient"], required: true },
  phone: String,
  address: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Person || mongoose.model("Person", personSchema);