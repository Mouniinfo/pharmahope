const mongoose = require("mongoose");
const Drug = require("./models/Drug");

mongoose.connect("mongodb://localhost:27017/pharmahope");

async function seed() {
  await Drug.deleteMany({});
  await Drug.create([
    {
      name: "Panadol",
      description: "مسكن ألم وخافض حرارة",
      pharmacies: [
        { name: "صيدلية الأمل", address: "دمشق - شارع الثورة", phone: "0999999991", quantity: 7 },
        { name: "صيدلية الشفاء", address: "دمشق - باب شرقي", phone: "0999999992", quantity: 3 }
      ]
    },
    {
      name: "Augmentin",
      description: "مضاد حيوي واسع الطيف",
      pharmacies: [
        { name: "صيدلية الحياة", address: "دمشق - المزة", phone: "0999999993", quantity: 4 }
      ]
    }
  ]);
  console.log("تم إدخال بيانات أولية");
  process.exit();
}

seed();