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

app.listen(4000, () => {
  console.log('Backend running on http://localhost:4000');
});