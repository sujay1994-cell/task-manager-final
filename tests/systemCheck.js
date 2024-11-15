const axios = require('axios');
const fs = require('fs');

const systemCheck = {
  async testAuth() {
    try {
      // Test login
      const loginRes = await axios.post('/api/auth/login', {
        email: 'admin@example.com',
        password: 'admin123'
      });
      console.log('✓ Authentication working');
      return loginRes.data.token;
    } catch (error) {
      console.error('✗ Authentication failed:', error.message);
      throw error;
    }
  },

  async testBrandManagement(token) {
    try {
      // Create brand
      const brand = await axios.post('/api/brands', {
        name: 'Test Brand',
        description: 'Test Description'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Create edition
      const edition = await axios.post('/api/editions', {
        name: 'Test Edition',
        brandId: brand.data._id,
        publishDate: new Date(),
        deadline: new Date()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✓ Brand & Edition management working');
      return { brandId: brand.data._id, editionId: edition.data._id };
    } catch (error) {
      console.error('✗ Brand management failed:', error.message);
      throw error;
    }
  },

  async testTaskWorkflow(token, { brandId, editionId }) {
    try {
      // Create task
      const task = await axios.post('/api/tasks', {
        name: 'Test Task',
        type: 'editorial',
        brand: brandId,
        edition: editionId,
        department: 'Editorial',
        deadline: new Date()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update status
      await axios.put(`/api/tasks/${task.data._id}/status`, {
        status: 'in-progress'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✓ Task workflow working');
      return task.data._id;
    } catch (error) {
      console.error('✗ Task workflow failed:', error.message);
      throw error;
    }
  },

  async testFileUpload(token, taskId) {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream('test.pdf'));

      await axios.post(`/api/tasks/${taskId}/attachments`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✓ File upload working');
    } catch (error) {
      console.error('✗ File upload failed:', error.message);
      throw error;
    }
  },

  async testNotifications(token) {
    try {
      const notifications = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✓ Notifications working');
    } catch (error) {
      console.error('✗ Notifications failed:', error.message);
      throw error;
    }
  }
};

module.exports = systemCheck; 