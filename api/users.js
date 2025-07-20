let users = [];

module.exports = (req, res) => {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, url } = req;
  
  if (method === 'GET' && url === '/api/users') {
    res.json({ users });
  } else if (method === 'POST' && url === '/api/users/check') {
    const { openid } = req.body || {};
    const exists = users.some(user => user.openid === openid);
    res.json({ exists });
  } else if (method === 'POST' && url === '/api/users/submit') {
    const userData = req.body || {};
    users.push({
      ...userData,
      id: users.length + 1,
      submitTime: new Date().toISOString()
    });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
};