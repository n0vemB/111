// 使用全局变量模拟共享存储
global.users = global.users || [];

export default function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;
  const url = req.query.url || req.url;
  
  console.log('API Request:', { method, url, body: req.body });

  try {
    // 管理员页面
    if (method === 'GET' && (url === '/admin' || url === '/api/admin')) {
      return res.redirect('/public/admin.html');
    }

    // 检查用户是否存在
    if (method === 'POST' && url === '/api/check-user') {
      const { openid } = req.body || {};
      
      if (!openid) {
        return res.status(400).json({ error: '缺少 openid 参数' });
      }
      
      const exists = global.users.some(user => user.openid === openid);
      return res.json({ exists });
    }

    // 提交用户信息
    if (method === 'POST' && url === '/api/submit') {
      const userData = req.body || {};
      const { openid, phone, referrer, dingName } = userData;
      
      // 验证必填字段
      if (!openid || !phone || !referrer || !dingName) {
        return res.status(400).json({ 
          success: false, 
          message: '请填写完整信息' 
        });
      }
      
      // 检查用户是否已存在
      const exists = global.users.some(user => user.openid === openid);
      if (exists) {
        return res.status(400).json({ 
          success: false, 
          message: '您已经提交过信息了' 
        });
      }
      
      // 添加用户
      const newUser = {
        ...userData,
        id: global.users.length + 1,
        submitTime: new Date().toISOString()
      };
      
      global.users.push(newUser);
      return res.json({ success: true });
    }

    // 管理员查看用户
    if (method === 'GET' && url === '/api/admin/users') {
      return res.json({ users: global.users });
    }

    // 删除用户
    if (method === 'DELETE' && url.startsWith('/api/admin/user/')) {
      const openid = decodeURIComponent(url.split('/').pop());
      const userIndex = global.users.findIndex(user => user.openid === openid);
      
      if (userIndex === -1) {
        return res.status(404).json({ 
          success: false, 
          message: '用户不存在' 
        });
      }
      
      global.users.splice(userIndex, 1);
      return res.json({ 
        success: true, 
        message: '用户已删除'
      });
    }

    // 根路径
    if (method === 'GET' && (url === '/api' || url === '/' || !url)) {
      return res.json({ 
        message: 'API is working', 
        timestamp: new Date().toISOString(),
        users: global.users.length 
      });
    }

    // 404
    return res.status(404).json({ 
      error: 'Not Found', 
      path: url,
      method: method
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}
