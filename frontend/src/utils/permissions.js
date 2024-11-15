import { ROLE_PERMISSIONS } from './constants';

export const checkPermission = (user, action) => {
  const permissions = {
    canCreateTasks: ['sales_manager', 'editorial_manager', 'design_manager'].includes(user.role),
    canAssignTasks: ['sales_manager', 'editorial_manager', 'design_manager'].includes(user.role),
    canViewAllTasks: ['sales_manager', 'editorial_manager', 'design_manager'].includes(user.role),
    canApproveTasks: ['sales_manager', 'editorial_manager', 'design_manager'].includes(user.role),
    canDeleteTasks: ['sales_manager'].includes(user.role),
    canManageBrands: ['sales_manager'].includes(user.role),
    canManageEditions: ['sales_manager'].includes(user.role),
    canUploadFiles: true, // All users can upload files
    canComment: true, // All users can comment
    canViewDashboard: true // All users can view their dashboard
  };

  return permissions[action] || false;
};

export const getDepartmentAccess = (user, department) => {
  // Managers can access all tasks in their department
  if (user.role.includes('manager')) {
    return user.department === department;
  }

  // Team members can only access their assigned tasks
  return user.department === department;
};

export const getTaskAccess = (user, task) => {
  // Managers can access all tasks in their department
  if (user.role.includes('manager')) {
    return user.department === task.department;
  }

  // Team members can only access assigned tasks
  return task.assignedTo === user.id;
};

export const checkDepartmentPermission = (user, department) => {
  if (!user || !user.role || !user.department) return false;

  if (user.role === 'super_admin' || user.role === 'super_manager') {
    return true;
  }

  const rolePrefix = user.role.split('_')[0];
  return rolePrefix === department.toLowerCase();
};

export const canManageUsers = (user) => 
  checkPermission(user, 'manage_users');

export const canViewAllDashboards = (user) =>
  checkPermission(user, 'view_all_dashboards');

export const canManageDepartment = (user, department) =>
  checkDepartmentPermission(user, department) && 
  checkPermission(user, 'manage_team');

export const canCreateTasks = (user) =>
  checkPermission(user, 'create_tasks');

export const canAssignTasks = (user) =>
  checkPermission(user, 'assign_tasks');

export const canManageBrands = (user) =>
  checkPermission(user, 'manage_brands'); 