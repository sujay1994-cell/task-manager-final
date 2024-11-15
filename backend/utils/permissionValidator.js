const { hasPermission, hasDepartmentPermission } = require('../middleware/permissionCheck');

const permissionValidator = {
  canManageUsers: (user) => hasPermission(user, 'manage_users'),
  
  canViewAllUsers: (user) => hasPermission(user, 'view_all_users'),
  
  canManageDepartmentUsers: (user, department) => 
    hasDepartmentPermission(user, department) && 
    hasPermission(user, 'manage_department_users'),
  
  canManageBrands: (user) => hasPermission(user, 'manage_brands'),
  
  canCreateEditions: (user) => hasPermission(user, 'create_editions'),
  
  canManageEdition: (user, edition) => {
    if (hasPermission(user, 'manage_all_editions')) return true;
    if (!hasPermission(user, 'manage_department_editions')) return false;
    return hasDepartmentPermission(user, edition.department);
  },
  
  canAssignTasks: (user) => hasPermission(user, 'assign_tasks'),
  
  canUpdateTaskStatus: (user, task) => {
    if (hasPermission(user, 'manage_all_tasks')) return true;
    if (!hasPermission(user, 'manage_department_tasks')) return false;
    return hasDepartmentPermission(user, task.department);
  },
  
  canViewDashboard: (user, department) => {
    if (hasPermission(user, 'view_all_dashboards')) return true;
    if (!hasPermission(user, 'view_department_dashboard')) return false;
    return hasDepartmentPermission(user, department);
  }
};

module.exports = permissionValidator; 