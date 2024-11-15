const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email templates
const templates = {
  taskAssigned: (user, task) => ({
    subject: `New Task Assigned: ${task.name}`,
    html: `
      <h2>New Task Assignment</h2>
      <p>Hello ${user.name},</p>
      <p>You have been assigned a new task:</p>
      <ul>
        <li><strong>Task:</strong> ${task.name}</li>
        <li><strong>Deadline:</strong> ${new Date(task.deadline).toLocaleDateString()}</li>
        <li><strong>Priority:</strong> ${task.priority}</li>
      </ul>
      <p>Please log in to the system to view more details.</p>
    `
  }),
  
  deadlineReminder: (user, task) => ({
    subject: `Deadline Reminder: ${task.name}`,
    html: `
      <h2>Task Deadline Reminder</h2>
      <p>Hello ${user.name},</p>
      <p>This is a reminder about an upcoming deadline:</p>
      <ul>
        <li><strong>Task:</strong> ${task.name}</li>
        <li><strong>Deadline:</strong> ${new Date(task.deadline).toLocaleDateString()}</li>
        <li><strong>Status:</strong> ${task.status}</li>
      </ul>
      <p>Please ensure the task is completed before the deadline.</p>
    `
  }),

  commentAdded: (user, task, comment) => ({
    subject: `New Comment on: ${task.name}`,
    html: `
      <h2>New Comment Added</h2>
      <p>Hello ${user.name},</p>
      <p>A new comment has been added to task "${task.name}":</p>
      <blockquote>${comment.text}</blockquote>
      <p>By: ${comment.user.name}</p>
      <p>Please log in to respond or view more details.</p>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const { subject, html } = templates[template](data.user, data.task, data.comment);
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: to,
      subject: subject,
      html: html
    });

    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

module.exports = {
  sendEmail
}; 