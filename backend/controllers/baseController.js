const { permissionValidator } = require('../utils/permissionValidator');

class BaseController {
  checkPermission(user, action, resource) {
    switch (action) {
      case 'manage_users':
        return permissionValidator.canManageUsers(user);
      case 'view_users':
        return permissionValidator.canViewAllUsers(user);
      case 'manage_department_users':
        return permissionValidator.canManageDepartmentUsers(user, resource);
      case 'manage_brands':
        return permissionValidator.canManageBrands(user);
      case 'create_editions':
        return permissionValidator.canCreateEditions(user);
      case 'manage_edition':
        return permissionValidator.canManageEdition(user, resource);
      case 'assign_tasks':
        return permissionValidator.canAssignTasks(user);
      case 'update_task_status':
        return permissionValidator.canUpdateTaskStatus(user, resource);
      case 'view_dashboard':
        return permissionValidator.canViewDashboard(user, resource);
      default:
        return false;
    }
  }

  async authorizeAction(req, action, resource) {
    if (!this.checkPermission(req.user, action, resource)) {
      throw new Error('Unauthorized action');
    }
  }
}

module.exports = BaseController; 