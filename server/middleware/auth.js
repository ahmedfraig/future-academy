const jwt = require('jsonwebtoken');

// Verify JWT token
const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'لم يتم تقديم رمز المصادقة' });
  }
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'رمز المصادقة غير صالح أو منتهي الصلاحية' });
  }
};

// Role guard — pass allowed roles as arguments
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'غير مصرح' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'ليس لديك صلاحية للوصول إلى هذا المورد' });
  }
  next();
};

module.exports = { verifyToken, requireRole };
