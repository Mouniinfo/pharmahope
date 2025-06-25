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

const drugSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  donor: String,
  location: String,
  createdAt: { type: Date, default: Date.now }
});
const Drug = mongoose.model('Drug', drugSchema);

const personSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['donor', 'recipient'], required: true },
  phone: String,
  address: String,
  createdAt: { type: Date, default: Date.now }
});
const Person = mongoose.model('Person', personSchema);

app.get('/', (req, res) => {
  res.send('مرحبًا بك في PharmaHope API! استخدم /api/drugs أو /api/persons.');
});

// --- أدوية ---
// إضافة دواء
app.post('/api/drugs', async (req, res) => {
  try {
    const drug = new Drug(req.body);
    await drug.save();
    res.status(201).json(drug);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
// جلب الأدوية مع دعم البحث
app.get('/api/drugs', async (req, res) => {
  const search = req.query.search
    ? { name: { $regex: req.query.search, $options: 'i' } }
    : {};
  const drugs = await Drug.find(search).sort({ createdAt: -1 });
  res.json(drugs);
});
// تعديل دواء
app.put('/api/drugs/:id', async (req, res) => {
  try {
    const drug = await Drug.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(drug);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
// حذف دواء
app.delete('/api/drugs/:id', async (req, res) => {
  try {
    await Drug.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- متبرعين/مستفيدين ---
// إضافة شخص
app.post('/api/persons', async (req, res) => {
  try {
    const person = new Person(req.body);
    await person.save();
    res.status(201).json(person);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
// جلب الأشخاص مع دعم البحث والفلترة بالنوع
app.get('/api/persons', async (req, res) => {
  const filter = {};
  if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };
  if (req.query.type) filter.type = req.query.type;
  const persons = await Person.find(filter).sort({ createdAt: -1 });
  res.json(persons);
});
// تعديل شخص
app.put('/api/persons/:id', async (req, res) => {
  try {
    const person = await Person.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(person);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
// حذف شخص
app.delete('/api/persons/:id', async (req, res) => {
  try {
    await Person.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.listen(4000, () => {
  console.log('Backend running on http://localhost:4000');
});