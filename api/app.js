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

// 内存存储（Vercel 是无状态的，每次请求都会重新初始化）
// 生产环境建议使用数据库
let users = [];

// 检查用户是否存在
app.post('/api/check-user', (req, res) => {
  const { openid, nickName } = req.body;
  console.log('检查用户:', { openid, nickName });
  
  const exists = users.some(user => user.openid === openid);
  res.json({ exists });
});

// 提交用户信息
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

// 管理员查询接口
app.get('/api/admin/users', (req, res) => {
  console.log('管理员查询，当前用户数:', users.length);
  res.json({ users });
});

// 删除指定用户接口
app.delete('/api/admin/user/:openid', (req, res) => {
  const { openid } = req.params;
  const initialLength = users.length;
  
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

// Vercel 导出
module.exports = app;
