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

// 静态文件服务
app.use('/admin', express.static(path.join(__dirname, '../public')));

// 内存存储
let users = [];

// 添加根路径测试
app.get('/', (req, res) => {
  res.json({ message: 'API is working', timestamp: new Date().toISOString() });
});

// API 路由
app.post('/api/check-user', (req, res) => {
  const { openid, nickName } = req.body;
  console.log('检查用户:', { openid, nickName });
  
  const exists = users.some(user => user.openid === openid);
  res.json({ exists });
});

app.post('/api/submit', (req, res) => {
  const userData = req.body;
  console.log('收到用户数据:', userData);
  
  users.push({
    ...userData,
    id: users.length + 1,
    submitTime: new Date().toISOString()
  });
  
  res.json({ success: true });
});

app.get('/api/admin/users', (req, res) => {
  console.log('管理员查询，当前用户数:', users.length);
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
  
  console.log(`删除用户: ${deletedUser.userInfo?.nickName || '未知'} (${openid})`);
  
  res.json({ 
    success: true, 
    message: '用户已删除',
    deletedUser: {
      nickName: deletedUser.userInfo?.nickName || '未知',
      phone: deletedUser.phone || '未知'
    }
  });
});

// 管理员页面路由
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'admin.html'));
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    path: req.path,
    method: req.method 
  });
});

module.exports = app;
