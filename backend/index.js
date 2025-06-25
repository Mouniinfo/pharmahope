const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Admin = require("./models/Admin");
const bcrypt = require("bcryptjs");
const Drug = require("./models/Drug");
const Reservation = require("./models/Reservation");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) {
    return res.status(401).json({ error: "بيانات غير صحيحة" });
  }
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ error: "بيانات غير صحيحة" });
  }
  // يمكنك هنا إنشاء توكن JWT لو أردت مستقبلاً
  res.json({ success: true });
});

// اتصال بقاعدة البيانات (عدل الاتصال إذا كنت تستخدم Atlas)
mongoose.connect('mongodb://localhost:27017/pharmahope', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.get('/api/admins', async (req, res) => {
  const admins = await Admin.find({}, { password: 0 }); // إخفاء كلمة المرور
  res.json(admins);
});

// backend/index.js
//const Reservation = require("./models/Reservation");
//const Drug = require("./models/Drug");

// نقطة إحضار جميع الأدوية مع الصيدليات
app.get("/api/drugs", async (req, res) => {
  const drugs = await Drug.find();
  res.json(drugs);
});

// نقطة حجز الدواء
app.post("/api/reserve", async (req, res) => {
  try {
    const { userName, phone, drugId } = req.body;
    const drug = await Drug.findById(drugId);
    if (!drug || !drug.pharmacies.length) {
      return res.status(404).json({ error: "الدواء غير متوفر حالياً" });
    }
    // اختر أول صيدلية بها كمية متوفرة
    const pharmacy = drug.pharmacies.find(p => p.quantity > 0);
    if (!pharmacy) {
      return res.status(404).json({ error: "الدواء غير متوفر في أي صيدلية حالياً" });
    }
    // قلل الكمية
    pharmacy.quantity -= 1;
    await drug.save();
    // سجل الحجز
    const reservation = await Reservation.create({
      userName,
      phone,
      drugId,
      drugName: drug.name,
      pharmacyName: pharmacy.name,
      pharmacyAddress: pharmacy.address,
      pharmacyPhone: pharmacy.phone,
      status: "pending"
    });
    res.json({
      success: true,
      pharmacy: {
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone
      }
    });
  } catch (err) {
    res.status(500).json({ error: "حدث خطأ أثناء الحجز" });
  }
});

// نقطة إحضار الحجوزات (للمسؤول)
app.get("/api/reservations", async (req, res) => {
  const reservations = await Reservation.find().sort({ createdAt: -1 });
  res.json(reservations);
});

app.post('/api/admins', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "البيانات ناقصة" });
  const exists = await Admin.findOne({ username });
  if (exists) return res.status(409).json({ error: "اسم المستخدم موجود مسبقاً" });
  const hashed = await bcrypt.hash(password, 10);
  const admin = await Admin.create({ username, password: hashed });
  res.status(201).json({ _id: admin._id, username: admin.username });
});

app.put('/api/admins/:id', async (req, res) => {
  const { username, password } = req.body;
  const update = {};
  if (username) update.username = username;
  if (password) update.password = await bcrypt.hash(password, 10);
  const admin = await Admin.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!admin) return res.status(404).json({ error: "المسؤول غير موجود" });
  res.json({ _id: admin._id, username: admin.username });
});

app.delete('/api/admins/:id', async (req, res) => {
  const admin = await Admin.findByIdAndDelete(req.params.id);
  if (!admin) return res.status(404).json({ error: "المسؤول غير موجود" });
  res.json({ success: true });
});

// نموذج رسالة تواصل
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// ضبط nodemailer (استعمل بيانات بريدك)
// يمكنك استخدام Gmail أو أي خدمة SMTP أخرى
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mounirsertah@gmail.com',
    pass: 'vfhz gcwz wtss lwku' // استخدم App Password من إعدادات جوجل وليس كلمة مرورك العادية
  }
});

// API لحفظ رسالة تواصل وإرسال بريد
app.post('/api/contact', async (req, res) => {
  try {
    const msg = new Contact(req.body);
    await msg.save();

    // إرسال بريد إلكتروني لك
    await transporter.sendMail({
      from: '"PharmaHope Contact" <mounirsertah@gmail.com>',
      to: 'mounirsertah@gmail.com', // نفس بريدك أو بريد الإدارة
      subject: 'رسالة جديدة من تواصل معنا',
      text: `اسم: ${req.body.name}\nإيميل: ${req.body.email}\n\n${req.body.message}`
    });

    res.status(201).json({ success: true, msg: "تم حفظ الرسالة وإرسالها للبريد بنجاح" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// API جلب جميع الرسائل (لصفحة الإدارة مستقبلاً)
app.get('/api/contact', async (req, res) => {
  const msgs = await Contact.find().sort({ createdAt: -1 });
  res.json(msgs);
});

// نموذج الأدوية
const drugSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  donor: String,
  location: String,
  createdAt: { type: Date, default: Date.now }
});
//const Drug = mongoose.model('Drug', drugSchema);

// نموذج متبرع/مستفيد
const personSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['donor', 'recipient'], required: true },
  phone: String,
  address: String,
  createdAt: { type: Date, default: Date.now }
});
const Person = mongoose.model('Person', personSchema);

// نقطة ترحيب
app.get('/', (req, res) => {
  res.send('مرحبًا بك في PharmaHope API! استخدم /api/drugs أو /api/persons.');
});

// --- أدوية ---
app.post('/api/drugs', async (req, res) => {
  try {
    const drug = new Drug(req.body);
    await drug.save();
    res.status(201).json(drug);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
app.get('/api/drugs', async (req, res) => {
  const search = req.query.search
    ? { name: { $regex: req.query.search, $options: 'i' } }
    : {};
  const drugs = await Drug.find(search).sort({ createdAt: -1 });
  res.json(drugs);
});
app.put('/api/drugs/:id', async (req, res) => {
  try {
    const drug = await Drug.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(drug);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
app.delete('/api/drugs/:id', async (req, res) => {
  try {
    await Drug.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- متبرعين/مستفيدين ---
app.post('/api/persons', async (req, res) => {
  try {
    const person = new Person(req.body);
    await person.save();
    res.status(201).json(person);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
app.get('/api/persons', async (req, res) => {
  const filter = {};
  if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };
  if (req.query.type) filter.type = req.query.type;
  const persons = await Person.find(filter).sort({ createdAt: -1 });
  res.json(persons);
});
app.put('/api/persons/:id', async (req, res) => {
  try {
    const person = await Person.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(person);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
app.delete('/api/persons/:id', async (req, res) => {
  try {
    await Person.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
// 1. نموذج رسالة التواصل
/* const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});*/
//const Contact = mongoose.model('Contact', contactSchema);

// 2. API لحفظ رسالة تواصل جديدة
app.post('/api/contact', async (req, res) => {
  try {
    const msg = new Contact(req.body);
    await msg.save();
    res.status(201).json({ success: true, msg: "تم حفظ الرسالة بنجاح" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 3. (اختياري) API لجلب جميع رسائل التواصل (للإدارة)
app.get('/api/contact', async (req, res) => {
  const msgs = await Contact.find().sort({ createdAt: -1 });
  res.json(msgs);
});


app.listen(4000, () => {
  console.log('Backend running on http://localhost:4000');
});