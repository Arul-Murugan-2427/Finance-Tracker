import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rupeetrack_super_secret_jwt_key_2026';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, name }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token. Please log in again.' });
  }
};

export { JWT_SECRET };
