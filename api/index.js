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
      const adminHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>用户管理后台</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: flex; gap: 20px; margin-bottom: 20px; }
        .stat-card { background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; }
        .btn { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 用户数据管理中心</h1>
        <p>实时查看用户提交的信息数据</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <div id="totalUsers">0</div>
            <div>总用户数</div>
        </div>
        <div class="stat-card">
            <div id="todayUsers">0</div>
            <div>今日新增</div>
        </div>
    </div>
    
    <button class="btn" onclick="loadUsers()">🔄 刷新数据</button>
    
    <div id="loading">正在加载数据...</div>
    <table id="userTable" style="display: none;">
        <thead>
            <tr>
                <th>ID</th>
                <th>微信昵称</th>
                <th>介绍人</th>
                <th>钉钉名称</th>
                <th>手机号</th>
                <th>提交时间</th>
            </tr>
        </thead>
        <tbody id="userTableBody"></tbody>
    </table>

    <script>
        async function loadUsers() {
            try {
                const response = await fetch('/api/admin/users');
                const data = await response.json();
                const users = data.users || [];
                
                document.getElementById('totalUsers').textContent = users.length;
                document.getElementById('todayUsers').textContent = users.filter(u => 
                    new Date(u.submitTime).toDateString() === new Date().toDateString()
                ).length;
                
                const tbody = document.getElementById('userTableBody');
                tbody.innerHTML = '';
                
                users.forEach((user, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = \`
                        <td>\${user.id || index + 1}</td>
                        <td>\${user.userInfo?.nickName || '未知'}</td>
                        <td>\${user.referrer || '-'}</td>
                        <td>\${user.dingName || '-'}</td>
                        <td>\${user.phone || '-'}</td>
                        <td>\${new Date(user.submitTime).toLocaleString('zh-CN')}</td>
                    \`;
                    tbody.appendChild(row);
                });
                
                document.getElementById('loading').style.display = 'none';
                document.getElementById('userTable').style.display = 'table';
            } catch (error) {
                console.error('加载失败:', error);
                document.getElementById('loading').innerHTML = '❌ 加载失败，请刷新重试';
            }
        }
        
        window.onload = loadUsers;
    </script>
</body>
</html>`;
  
      res.setHeader('Content-Type', 'text/html');
      return res.send(adminHTML);
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
