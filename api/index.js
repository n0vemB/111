// 内存存储（注意：重启后会丢失）
let users = [];

export default function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;
  // 从查询参数获取实际路径，如果没有则使用原始 URL
  const url = req.query.url || req.url;
  
  console.log('API Request:', { method, url, originalUrl: req.url, query: req.query });

  try {
    // 根路径
    if (method === 'GET' && (url === '/api' || url === '/')) {
      return res.json({ 
        message: 'API is working', 
        timestamp: new Date().toISOString(),
        users: users.length 
      });
    }

    // 管理员查看用户
    if (method === 'GET' && url === '/api/admin/users') {
      return res.json({ users });
    }

    // 检查用户是否存在
    if (method === 'POST' && url === '/api/check-user') {
      const { openid } = req.body || {};
      const exists = users.some(user => user.openid === openid);
      return res.json({ exists });
    }

    // 提交用户信息
    if (method === 'POST' && url === '/api/submit') {
      const userData = req.body || {};
      users.push({
        ...userData,
        id: users.length + 1,
        submitTime: new Date().toISOString()
      });
      return res.json({ success: true });
    }

    // 删除用户
    if (method === 'DELETE' && url.startsWith('/api/admin/user/')) {
      const openid = url.split('/').pop();
      const userIndex = users.findIndex(user => user.openid === openid);
      
      if (userIndex === -1) {
        return res.status(404).json({ 
          success: false, 
          message: '用户不存在' 
        });
      }
      
      const deletedUser = users.splice(userIndex, 1)[0];
      return res.json({ 
        success: true, 
        message: '用户已删除'
      });
    }

    // 管理员页面
    if (method === 'GET' && url === '/api/admin') {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>管理后台</title>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .user { border: 1px solid #ddd; margin: 10px 0; padding: 10px; }
                button { background: #ff4444; color: white; border: none; padding: 5px 10px; cursor: pointer; }
            </style>
        </head>
        <body>
            <h1>用户管理后台</h1>
            <div id="users"></div>
            <script>
                function loadUsers() {
                    fetch('/api/admin/users')
                        .then(res => res.json())
                        .then(data => {
                            const usersDiv = document.getElementById('users');
                            if (data.users.length === 0) {
                                usersDiv.innerHTML = '<p>暂无用户数据</p>';
                                return;
                            }
                            usersDiv.innerHTML = data.users.map(user => \`
                                <div class="user">
                                    <h3>\${user.userInfo?.nickName || '未知用户'}</h3>
                                    <p>推荐人: \${user.referrer || '未知'}</p>
                                    <p>钉钉名: \${user.dingName || '未知'}</p>
                                    <p>手机: \${user.phone || '未知'}</p>
                                    <p>提交时间: \${user.submitTime || '未知'}</p>
                                    <button onclick="deleteUser('\${user.openid}')">删除</button>
                                </div>
                            \`).join('');
                        });
                }
                
                function deleteUser(openid) {
                    if (confirm('确定删除此用户？')) {
                        fetch('/api/admin/user/' + openid, { method: 'DELETE' })
                            .then(() => loadUsers());
                    }
                }
                
                loadUsers();
                setInterval(loadUsers, 5000);
            </script>
        </body>
        </html>
      `);
    }

    // 404 - 显示调试信息
    return res.status(404).json({ 
      error: 'Not Found', 
      path: url,
      originalUrl: req.url,
      method: method,
      query: req.query,
      debug: 'Check the URL path and method'
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}
