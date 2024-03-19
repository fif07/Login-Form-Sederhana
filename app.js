const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Konek ke MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/db-simple-backend', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Skema Pengguna
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', userSchema);

app.use(express.json());
app.use(cookieParser());

// Kunci JWT
const JWT_SECRET = 'kunci_jwt_anda';

// Login Pengguna
app.post('/users/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: 'Username atau Password Salah' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: 'Username or Password Salah' });
  }

  // Generate Token JWT
  const token = jwt.sign({ id: user._id }, JWT_SECRET);

  // Atur cookie
  res.cookie('token', token, { httpOnly: true }).json({ message: 'Login berhasil' });
});

// Logout Pengguna
app.post('/users/logout', (req, res) => {
    res.clearCookie('token').json({ message: 'Logout berhasil'})
});

// Dapatkan Semua Pengguna
app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Buat Akun Pengguna
app.post('/users/create', async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();

  res.status(201).json({ message: 'User Berhasil Dibuat' });
});

// Update Sandi Pengguna
app.put('/users/update/:id', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(id, { password: hashedPassword });

  res.json({ message: 'Password Berhasil Diupdate' });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
