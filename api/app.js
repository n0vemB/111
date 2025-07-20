const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// 中间件
app.use(express.json());
app.use(cors({
  origin: ['https://servicewechat.com', 'https://bk-lilac.vercel.app'],
  credentials: true
}));

// 内存存储
let users = [];

// 根路径测试
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is working', 
    timestamp: new Date().toISOString(),
    users: users.length 
  });
});

// API 路由
app.post('/api/check-user', (req, res) => {
  const { openid, nickName } = req.body;
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

app.get('/api/admin/users', (req, res) => {
  res.json({ users });
});

app.delete('/api/admin/user/:openid', (req, res) => {
  const { openid } = req.params;
  const userIndex = users.findIndex(user => user.openid === openid);
  
  if (userIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: '用户不存在' 
    });
  }
  
  const deletedUser = users.splice(userIndex, 1)[0];
  res.json({ 
    success: true, 
    message: '用户已删除'
  });
});

// 管理员页面
app.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>管理后台</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1>用户管理后台</h1>
        <div id="users"></div>
        <script>
            fetch('/api/admin/users')
                .then(res => res.json())
                .then(data => {
                    document.getElementById('users').innerHTML = 
                        '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                });
        </script>
    </body>
    </html>
  `);
});

module.exports = app;
