const ACCESS_LEVELS = {
  SUPER_ADMIN: ['super_admin'],
  SUPER_MANAGER: ['super_manager'],
  ALL_MANAGERS: ['super_admin', 'super_manager', 'sales_manager', 'editorial_manager', 'design_manager'],
  DEPARTMENT_MANAGERS: ['sales_manager', 'editorial_manager', 'design_manager'],
  TEAM_MEMBERS: ['sales_member', 'editorial_member', 'design_member']
};

export const canAccessDashboard = (userRole, targetDashboard) => {
  switch (targetDashboard) {
    case 'all':
      return ACCESS_LEVELS.SUPER_ADMIN.includes(userRole) || 
             ACCESS_LEVELS.SUPER_MANAGER.includes(userRole);
    case 'sales':
      return ACCESS_LEVELS.SUPER_ADMIN.includes(userRole) || 
             ACCESS_LEVELS.SUPER_MANAGER.includes(userRole) ||
             userRole === 'sales_manager';
    case 'editorial':
      return ACCESS_LEVELS.SUPER_ADMIN.includes(userRole) || 
             ACCESS_LEVELS.SUPER_MANAGER.includes(userRole) ||
             userRole === 'editorial_manager';
    case 'design':
      return ACCESS_LEVELS.SUPER_ADMIN.includes(userRole) || 
             ACCESS_LEVELS.SUPER_MANAGER.includes(userRole) ||
             userRole === 'design_manager';
    case 'team':
      return ACCESS_LEVELS.TEAM_MEMBERS.includes(userRole);
    default:
      return false;
  }
};

export const canManageTeam = (userRole) => {
  return ACCESS_LEVELS.ALL_MANAGERS.includes(userRole);
};

export const canViewAllDepartments = (userRole) => {
  return ACCESS_LEVELS.SUPER_ADMIN.includes(userRole) || 
         ACCESS_LEVELS.SUPER_MANAGER.includes(userRole);
};

export const canManageTasks = (userRole, taskDepartment, userDepartment) => {
  if (ACCESS_LEVELS.SUPER_ADMIN.includes(userRole) || 
      ACCESS_LEVELS.SUPER_MANAGER.includes(userRole)) {
    return true;
  }
  
  if (ACCESS_LEVELS.DEPARTMENT_MANAGERS.includes(userRole)) {
    return taskDepartment === userDepartment;
  }
  
  return false;
}; 