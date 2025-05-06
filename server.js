const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { Sequelize, DataTypes, Model } = require('sequelize');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── DB SETUP (MySQL via XAMPP) ────────────────────────────────────────────────
const sequelize = new Sequelize('lostandfound', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

// ─── MODELS ───────────────────────────────────────────────────────────────────
class User extends Model {}
User.init({
  email: {
    type: DataTypes.STRING, unique: true, allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING, allowNull: false
  }
}, { sequelize, modelName: 'User' });

class Item extends Model {}
Item.init({
  item_name:    { type: DataTypes.STRING, allowNull: false },
  description:  { type: DataTypes.TEXT,   allowNull: false },
  status:       { type: DataTypes.STRING, allowNull: false },
  contact:      { type: DataTypes.STRING, allowNull: false },
  image_filename: { type: DataTypes.STRING, allowNull: true }
}, { sequelize, modelName: 'Item' });

// ─── FILE UPLOAD ───────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random()*1e9);
    cb(null, unique + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Registration
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (await User.findOne({ where:{ email } })) {
      return res.status(400).json({ message: 'Email already registered!' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    await User.create({ email, password_hash });
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where:{ email } });
    if (user && await bcrypt.compare(password, user.password_hash)) {
      return res.json({ message: 'Login successful!' });
    }
    res.status(401).json({ message: 'Invalid credentials!' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Report a lost/found item
app.post('/api/report', upload.single('image'), async (req, res) => {
  const { item_name, description, status, contact } = req.body;
  try {
    await Item.create({
      item_name, description, status, contact,
      image_filename: req.file?.filename || null
    });
    res.json({ message: 'Item reported successfully!' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Fetch all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.findAll();
    const out = items.map(i => ({
      id: i.id,
      item_name: i.item_name,
      description: i.description,
      status: i.status,
      contact: i.contact,
      image_url: i.image_filename ? `/uploads/${i.image_filename}` : null
    }));
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error.' });
  }
});

app.get(/^\/.*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
  
  

// ─── START SERVER ──────────────────────────────────────────────────────────────
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✔️  DB connected');
    await sequelize.sync();
    app.listen(3000, () => console.log('🚀  Listening on http://localhost:3000'));
  } catch (e) {
    console.error('❌  Unable to connect:', e);
  }
})();
