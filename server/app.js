const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// 中间件
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // 添加静态文件服务

// 临时存储（实际项目应使用数据库）
let users = [];

// 检查用户是否存在
app.post('/check-user', (req, res) => {
  const { openid, nickName } = req.body;
  console.log('检查用户:', { openid, nickName });
  
  const exists = users.some(user => user.openid === openid);
  res.json({ exists });
});

// 提交用户信息
app.post('/submit', (req, res) => {
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
app.get('/admin/users', (req, res) => {
  console.log('管理员查询，当前用户数:', users.length);
  res.json({ users });
});

// 管理员页面路由
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 删除指定用户接口
app.delete('/admin/user/:openid', (req, res) => {
  const { openid } = req.params;
  const initialLength = users.length;
  
  // 查找并删除用户
  const userIndex = users.findIndex(user => user.openid === openid);
  
  if (userIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: '用户不存在' 
    });
  }
  
  const deletedUser = users.splice(userIndex, 1)[0];
  
  console.log(`删除用户: ${deletedUser.userInfo?.nickName || '未知'} (${openid})`);
  console.log(`删除前：${initialLength}，删除后：${users.length}`);
  
  res.json({ 
    success: true, 
    message: '用户已删除',
    deletedUser: {
      nickName: deletedUser.userInfo?.nickName || '未知',
      phone: deletedUser.phone || '未知'
    }
  });
});

// 可选：批量删除接口
app.post('/admin/users/batch-delete', (req, res) => {
  const { openids } = req.body;
  
  if (!Array.isArray(openids)) {
    return res.status(400).json({
      success: false,
      message: '参数格式错误'
    });
  }
  
  const initialLength = users.length;
  users = users.filter(user => !openids.includes(user.openid));
  const deletedCount = initialLength - users.length;
  
  console.log(`批量删除 ${deletedCount} 个用户`);
  
  res.json({
    success: true,
    message: `成功删除 ${deletedCount} 个用户`,
    deletedCount
  });
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('API接口:');
  console.log('- POST /check-user - 检查用户是否存在');
  console.log('- POST /submit - 提交用户信息');
  console.log('- GET /admin/users - 管理员查询');
});
