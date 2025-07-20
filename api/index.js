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
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #2c3e50;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .header h1 {
            font-size: 32px;
            color: #2c3e50;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .stat-number {
            font-size: 42px;
            font-weight: bold;
            color: #3498db;
            margin-bottom: 8px;
        }
        
        .stat-label {
            color: #7f8c8d;
            font-size: 16px;
            font-weight: 500;
        }
        
        .controls {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 25px;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            display: flex;
            gap: 15px;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .btn-primary {
            background: linear-gradient(45deg, #3498db, #2980b9);
            color: white;
        }
        
        .btn-danger {
            background: linear-gradient(45deg, #e74c3c, #c0392b);
            color: white;
            padding: 8px 16px;
            font-size: 12px;
        }
        
        .btn-danger:hover {
            background: linear-gradient(45deg, #c0392b, #a93226);
        }
        
        .table-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .loading, .empty {
            text-align: center;
            padding: 60px;
            color: #7f8c8d;
            font-size: 18px;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .table th,
        .table td {
            padding: 18px;
            text-align: left;
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        
        .table th {
            background: linear-gradient(45deg, #f8f9fa, #e9ecef);
            font-weight: 700;
            color: #2c3e50;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 用户数据管理中心</h1>
            <p>实时查看用户提交的信息数据</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number" id="totalUsers">0</div>
                <div class="stat-label">总用户数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="todayUsers">0</div>
                <div class="stat-label">今日新增</div>
            </div>
        </div>
        
        <div class="controls">
            <button class="btn btn-primary" onclick="loadUsers()">🔄 刷新数据</button>
        </div>
        
        <div class="table-container">
            <div id="loading" class="loading">
                <p>📊 正在加载数据...</p>
            </div>
            
            <div id="empty" class="empty" style="display: none;">
                <p>📝 暂无用户数据</p>
            </div>
            
            <table class="table" id="userTable" style="display: none;">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>微信昵称</th>
                        <th>微信手机号</th>
                        <th>介绍人</th>
                        <th>钉钉名称</th>
                        <th>手机号</th>
                        <th>提交时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="userTableBody">
                </tbody>
            </table>
        </div>
    </div>

    <script>
        let allUsers = [];
        
        window.onload = function() {
            loadUsers();
        };
        
        async function loadUsers() {
            try {
                const response = await fetch('/api/admin/users');
                const data = await response.json();
                allUsers = data.users || [];
                
                renderTable(allUsers);
                updateStats();
                
                document.getElementById('loading').style.display = 'none';
                if (allUsers.length === 0) {
                    document.getElementById('empty').style.display = 'block';
                    document.getElementById('userTable').style.display = 'none';
                } else {
                    document.getElementById('empty').style.display = 'none';
                    document.getElementById('userTable').style.display = 'table';
                }
            } catch (error) {
                console.error('加载失败:', error);
                document.getElementById('loading').innerHTML = '<p>❌ 加载失败，请刷新重试</p>';
            }
        }
        
        function updateStats() {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            const todayCount = allUsers.filter(user => 
                new Date(user.submitTime) >= today
            ).length;
            
            document.getElementById('totalUsers').textContent = allUsers.length;
            document.getElementById('todayUsers').textContent = todayCount;
        }
        
        function renderTable(users) {
            const tbody = document.getElementById('userTableBody');
            tbody.innerHTML = '';
            
            users.forEach((user, index) => {
                const row = document.createElement('tr');
                const submitTime = new Date(user.submitTime);
                
                row.innerHTML = \`
                    <td>\${user.id || index + 1}</td>
                    <td>\${user.userInfo?.nickName || '未获取'}</td>
                    <td>\${user.wechatPhone || '未获取'}</td>
                    <td>\${user.referrer || '-'}</td>
                    <td>\${user.dingName || '-'}</td>
                    <td>\${user.phone || '-'}</td>
                    <td>\${submitTime.toLocaleString('zh-CN')}</td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteUser('\${user.openid}', '\${user.userInfo?.nickName || '未知'}')">
                            删除
                        </button>
                    </td>
                \`;
                tbody.appendChild(row);
            });
        }
        
        async function deleteUser(openid, nickName) {
            if (!confirm(\`确定要删除用户 "\${nickName}" 吗？\`)) {
                return;
            }
            
            try {
                const response = await fetch(\`/api/admin/user/\${encodeURIComponent(openid)}\`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('删除成功！');
                    loadUsers();
                } else {
                    alert('删除失败：' + result.message);
                }
            } catch (error) {
                console.error('删除失败:', error);
                alert('删除失败，请重试');
            }
        }
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
