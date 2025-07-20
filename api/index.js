const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

let users = [];

app.get('/api', (req, res) => {
  res.json({ message: 'API working', users: users.length });
});

app.get('/api/admin/users', (req, res) => {
  res.json({ users });
});

app.post('/api/check-user', (req, res) => {
  const { openid } = req.body;
  const exists = users.some(user => user.openid === openid);
  res.json({ exists });
});

app.post('/api/submit', (req, res) => {
  const userData = req.body;
  users.push({
    ...userData,
    id: users.length + 1,
    submitTime: new Date().toISOString()
  });
  res.json({ success: true });
});

app.get('/admin', (req, res) => {
  res.send('<h1>Admin Panel</h1><p>API is working!</p>');
});

// Vercel 导出
module.exports = app;
