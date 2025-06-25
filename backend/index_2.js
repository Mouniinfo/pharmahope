const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/pharmahope', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// نموذج دواء
const drugSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  donor: String,
  location: String,
  createdAt: { type: Date, default: Date.now }
});
const Drug = mongoose.model('Drug', drugSchema);

// نموذج متبرع/مستفيد
const personSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['donor', 'recipient'], required: true }, // donor=متبرع، recipient=مستفيد
  phone: String,
  address: String,
  createdAt: { type: Date, default: Date.now }
});
const Person = mongoose.model('Person', personSchema);

// نقطة ترحيب رئيسية
app.get('/', (req, res) => {
  res.send('مرحبًا بك في PharmaHope API! استخدم /api/drugs أو /api/persons.');
});

// APIs للأدوية
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
  const drugs = await Drug.find().sort({ createdAt: -1 });
  res.json(drugs);
});

// APIs لإدارة المتبرعين/المستفيدين
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
  const persons = await Person.find().sort({ createdAt: -1 });
  res.json(persons);
});

app.listen(4000, () => {
  console.log('Backend running on http://localhost:4000');
});