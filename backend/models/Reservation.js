const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  userName: String,
  phone: String,
  drugId: { type: mongoose.Schema.Types.ObjectId, ref: "Drug" },
  drugName: String,
  pharmacyName: String,
  pharmacyAddress: String,
  pharmacyPhone: String,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Reservation || mongoose.model("Reservation", reservationSchema);