const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  quantity: Number
}, { _id: false });

const drugSchema = new mongoose.Schema({
  name: String,
  description: String,
  pharmacies: [pharmacySchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Drug || mongoose.model("Drug", drugSchema);