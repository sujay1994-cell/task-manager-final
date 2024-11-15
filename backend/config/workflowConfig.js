const WORKFLOW_STEPS = {
  CREATED: {
    id: 'created',
    label: 'Created',
    nextSteps: ['in_progress'],
    color: 'default'
  },
  IN_PROGRESS: {
    id: 'in_progress',
    label: 'In Progress',
    nextSteps: ['review_requested', 'completed'],
    color: 'primary'
  },
  REVIEW_REQUESTED: {
    id: 'review_requested',
    label: 'Review Requested',
    nextSteps: ['approved', 'revision_needed'],
    color: 'info'
  },
  REVISION_NEEDED: {
    id: 'revision_needed',
    label: 'Revision Needed',
    nextSteps: ['in_progress'],
    color: 'warning'
  },
  APPROVED: {
    id: 'approved',
    label: 'Approved',
    nextSteps: ['completed'],
    color: 'success'
  },
  COMPLETED: {
    id: 'completed',
    label: 'Completed',
    nextSteps: [],
    color: 'success'
  }
};

const DEPARTMENT_WORKFLOWS = {
  Editorial: {
    steps: [
      { step: WORKFLOW_STEPS.CREATED, requiredRole: ['editorial_manager', 'super_admin'] },
      { step: WORKFLOW_STEPS.IN_PROGRESS, requiredRole: ['editorial_member', 'editorial_manager'] },
      { step: WORKFLOW_STEPS.REVIEW_REQUESTED, requiredRole: ['editorial_manager', 'sales_manager'] },
      { step: WORKFLOW_STEPS.REVISION_NEEDED, requiredRole: ['editorial_manager', 'sales_manager'] },
      { step: WORKFLOW_STEPS.APPROVED, requiredRole: ['editorial_manager', 'sales_manager'] },
      { step: WORKFLOW_STEPS.COMPLETED, requiredRole: ['editorial_manager', 'sales_manager'] }
    ]
  },
  Design: {
    steps: [
      { step: WORKFLOW_STEPS.CREATED, requiredRole: ['design_manager', 'super_admin'] },
      { step: WORKFLOW_STEPS.IN_PROGRESS, requiredRole: ['design_member', 'design_manager'] },
      { step: WORKFLOW_STEPS.REVIEW_REQUESTED, requiredRole: ['design_manager', 'sales_manager'] },
      { step: WORKFLOW_STEPS.REVISION_NEEDED, requiredRole: ['design_manager', 'sales_manager'] },
      { step: WORKFLOW_STEPS.APPROVED, requiredRole: ['design_manager', 'sales_manager'] },
      { step: WORKFLOW_STEPS.COMPLETED, requiredRole: ['design_manager', 'sales_manager'] }
    ]
  },
  Sales: {
    steps: [
      { step: WORKFLOW_STEPS.CREATED, requiredRole: ['sales_manager', 'super_admin'] },
      { step: WORKFLOW_STEPS.IN_PROGRESS, requiredRole: ['sales_member', 'sales_manager'] },
      { step: WORKFLOW_STEPS.REVIEW_REQUESTED, requiredRole: ['sales_manager'] },
      { step: WORKFLOW_STEPS.REVISION_NEEDED, requiredRole: ['sales_manager'] },
      { step: WORKFLOW_STEPS.APPROVED, requiredRole: ['sales_manager'] },
      { step: WORKFLOW_STEPS.COMPLETED, requiredRole: ['sales_manager'] }
    ]
  }
};

module.exports = {
  WORKFLOW_STEPS,
  DEPARTMENT_WORKFLOWS
}; 