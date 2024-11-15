const TEAM_MEMBER_BASE_PERMISSIONS = {
  tasks: [
    'view_own_tasks',
    'edit_own_tasks',
    'upload_files',
    'add_comments',
    'view_task_history'
  ],
  team: [
    'view_team_members',
    'view_team_dashboard'
  ],
  editions: [
    'view_assigned_editions'
  ]
};

const ROLE_PERMISSIONS = {
  super_admin: [
    'manage_users',
    'view_all_users',
    'manage_brands',
    'view_brands',
    'manage_editions',
    'view_editions',
    'create_editions',
    'manage_all_tasks',
    'view_all_tasks',
    'create_tasks',
    'assign_tasks',
    'view_all_dashboards',
    'view_all_reports',
    'manage_team'
  ],

  super_manager: {
    dashboard: [
      'view_all_dashboards',
      'view_all_reports',
      'view_all_analytics'
    ],
    tasks: [
      'view_all_tasks',
      'edit_all_tasks',
      'create_tasks',
      'assign_tasks',
      'manage_task_status'
    ],
    editions: [
      'view_editions',
      'edit_editions',
      'create_editions'
    ],
    brands: [
      'view_brands',
      'edit_brands'
    ],
    users: [
      'view_all_users',
      'view_team_members'
    ]
  },

  sales_manager: {
    dashboard: [
      'view_department_dashboard',
      'view_department_reports',
      'view_department_analytics'
    ],
    tasks: [
      'create_tasks',
      'edit_department_tasks',
      'delete_department_tasks',
      'assign_department_tasks',
      'manage_task_status'
    ],
    editions: [
      'create_editions',
      'edit_editions',
      'view_editions'
    ],
    team: [
      'manage_department_users',
      'view_department_users',
      'assign_team_tasks'
    ],
    brands: [
      'view_brands'
    ]
  },

  editorial_manager: {
    dashboard: [
      'view_department_dashboard',
      'view_department_reports',
      'view_department_analytics'
    ],
    tasks: [
      'view_department_tasks',
      'edit_department_tasks',
      'assign_department_tasks',
      'approve_editorial_tasks',
      'reassign_tasks',
      'manage_task_status'
    ],
    team: [
      'manage_department_users',
      'view_department_users',
      'assign_team_tasks'
    ],
    editions: [
      'view_editions',
      'approve_editorial_content'
    ],
    reviews: [
      'review_content',
      'provide_feedback',
      'request_revisions'
    ]
  },

  design_manager: {
    dashboard: [
      'view_department_dashboard',
      'view_department_reports',
      'view_department_analytics'
    ],
    tasks: [
      'view_department_tasks',
      'edit_department_tasks',
      'assign_department_tasks',
      'manage_design_tasks',
      'reassign_tasks',
      'manage_task_status',
      'approve_design_work'
    ],
    team: [
      'manage_department_users',
      'view_department_users',
      'assign_team_tasks'
    ],
    editions: [
      'view_editions',
      'approve_design_content',
      'manage_print_tasks'
    ],
    design: [
      'manage_design_assets',
      'approve_designs',
      'manage_print_workflow',
      'sign_off_editions'
    ]
  },

  sales_member: {
    ...TEAM_MEMBER_BASE_PERMISSIONS,
    tasks: [
      ...TEAM_MEMBER_BASE_PERMISSIONS.tasks,
      'create_sales_tasks',
      'request_approval',
      'mark_task_complete'
    ],
    editions: [
      ...TEAM_MEMBER_BASE_PERMISSIONS.editions,
      'view_all_editions'
    ]
  },

  editorial_member: {
    ...TEAM_MEMBER_BASE_PERMISSIONS,
    tasks: [
      ...TEAM_MEMBER_BASE_PERMISSIONS.tasks,
      'review_content',
      'submit_for_approval'
    ],
    content: [
      'edit_content',
      'review_assigned_content'
    ]
  },

  design_member: {
    ...TEAM_MEMBER_BASE_PERMISSIONS,
    tasks: [
      ...TEAM_MEMBER_BASE_PERMISSIONS.tasks,
      'upload_designs',
      'submit_for_review'
    ],
    design: [
      'manage_design_files',
      'view_design_assets'
    ]
  }
};

module.exports = ROLE_PERMISSIONS; 