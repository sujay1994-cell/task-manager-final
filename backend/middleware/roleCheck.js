const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const hasRole = roles.some(role => req.user.role.includes(role));
    if (!hasRole) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};

module.exports = { checkRole }; 