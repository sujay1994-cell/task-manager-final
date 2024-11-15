const ROLE_PERMISSIONS = require('../config/permissions');

const hasPermission = (user, requiredPermission) => {
  const userRole = user.role;
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(requiredPermission);
};

const hasDepartmentPermission = (user, department) => {
  if (user.role === 'super_admin' || user.role === 'super_manager') {
    return true;
  }
  
  const userDepartment = user.department;
  const rolePrefix = user.role.split('_')[0];
  
  if (rolePrefix === department.toLowerCase()) {
    return true;
  }
  
  return false;
};

const permissionCheck = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const hasAllPermissions = requiredPermissions.every(permission =>
      hasPermission(req.user, permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        message: 'Insufficient permissions',
        required: requiredPermissions
      });
    }

    next();
  };
};

const departmentPermissionCheck = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const department = req.params.department || req.body.department;
    
    if (!department) {
      return res.status(400).json({ message: 'Department parameter required' });
    }

    if (!hasDepartmentPermission(req.user, department)) {
      return res.status(403).json({
        message: 'Insufficient department permissions'
      });
    }

    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({
        message: 'Insufficient permissions',
        required: permission
      });
    }

    next();
  };
};

module.exports = {
  permissionCheck,
  departmentPermissionCheck,
  hasPermission,
  hasDepartmentPermission
}; 