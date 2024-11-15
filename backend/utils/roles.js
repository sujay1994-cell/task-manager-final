const ROLES = {
  SUPER_ADMIN: 'super_admin',
  SUPER_MANAGER: 'super_manager',
  SALES_MANAGER: 'sales_manager',
  EDITORIAL_MANAGER: 'editorial_manager',
  DESIGN_MANAGER: 'design_manager',
  SALES_MEMBER: 'sales_member',
  EDITORIAL_MEMBER: 'editorial_member',
  DESIGN_MEMBER: 'design_member'
};

const PERMISSIONS = {
  // Brand Management
  CREATE_BRAND: ['super_admin', 'super_manager'],
  EDIT_BRAND: ['super_admin', 'super_manager'],
  DELETE_BRAND: ['super_admin'],
  VIEW_ALL_BRANDS: ['super_admin', 'super_manager', 'sales_manager', 'editorial_manager', 'design_manager'],
  
  // Edition Management
  CREATE_EDITION: ['super_admin', 'super_manager', 'sales_manager'],
  EDIT_EDITION: ['super_admin', 'super_manager', 'sales_manager'],
  DELETE_EDITION: ['super_admin'],
  VIEW_ALL_EDITIONS: ['super_admin', 'super_manager', 'sales_manager', 'editorial_manager', 'design_manager'],
  
  // Task Management
  CREATE_TASK: ['super_admin', 'super_manager', 'sales_manager', 'editorial_manager', 'design_manager'],
  EDIT_TASK: ['super_admin', 'super_manager', 'sales_manager', 'editorial_manager', 'design_manager'],
  DELETE_TASK: ['super_admin'],
  VIEW_ALL_TASKS: ['super_admin', 'super_manager'],
  VIEW_DEPARTMENT_TASKS: ['sales_manager', 'editorial_manager', 'design_manager'],
  
  // User Management
  CREATE_USER: ['super_admin'],
  EDIT_USER: ['super_admin'],
  DELETE_USER: ['super_admin'],
  VIEW_ALL_USERS: ['super_admin'],
  VIEW_DEPARTMENT_USERS: ['sales_manager', 'editorial_manager', 'design_manager']
};

const hasPermission = (userRole, permission) => {
  return PERMISSIONS[permission]?.includes(userRole) || false;
};

const getDepartmentByRole = (role) => {
  switch (role) {
    case ROLES.SALES_MANAGER:
    case ROLES.SALES_MEMBER:
      return 'Sales';
    case ROLES.EDITORIAL_MANAGER:
    case ROLES.EDITORIAL_MEMBER:
      return 'Editorial';
    case ROLES.DESIGN_MANAGER:
    case ROLES.DESIGN_MEMBER:
      return 'Design';
    case ROLES.SUPER_ADMIN:
    case ROLES.SUPER_MANAGER:
      return 'All';
    default:
      return null;
  }
};

module.exports = {
  ROLES,
  PERMISSIONS,
  hasPermission,
  getDepartmentByRole
}; 