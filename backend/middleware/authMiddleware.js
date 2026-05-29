const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'eixomano_secret_key';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, msg: 'larga de ser caba safado' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, msg: 'larga de ser caba safado' });
    }
    req.user = decoded;
    next();
  });
}

module.exports = authMiddleware;
