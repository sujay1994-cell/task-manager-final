const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'super_admin',
      'super_manager',
      'sales_manager',
      'editorial_manager',
      'design_manager',
      'sales_member',
      'editorial_member',
      'design_member'
    ]
  },
  permissions: [{
    type: String,
    enum: [
      // User Management
      'manage_users',
      'view_all_users',
      'manage_department_users',
      'view_department_users',
      
      // Brand Management
      'manage_brands',
      'view_brands',
      
      // Edition Management
      'manage_editions',
      'view_editions',
      'create_editions',
      
      // Task Management
      'manage_all_tasks',
      'manage_department_tasks',
      'view_all_tasks',
      'view_department_tasks',
      'create_tasks',
      'assign_tasks',
      
      // Dashboard Access
      'view_all_dashboards',
      'view_department_dashboard',
      
      // Reports
      'view_all_reports',
      'view_department_reports',
      
      // Team Management
      'manage_team',
      'view_team'
    ]
  }]
});

module.exports = mongoose.model('Role', roleSchema); 