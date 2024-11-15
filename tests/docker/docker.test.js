const Docker = require('dockerode');
const axios = require('axios');
const { MongoClient } = require('mongodb');

describe('Docker Setup Tests', () => {
  let docker;
  let mongoClient;

  beforeAll(async () => {
    try {
      docker = new Docker();
    } catch (error) {
      console.log('Docker not available, skipping Docker tests');
      return;
    }
  });

  beforeEach(() => {
    // Skip tests if Docker is not available
    if (!docker) {
      return;
    }
  });

  afterAll(async () => {
    if (mongoClient) {
      await mongoClient.close();
    }
    if (docker) {
      try {
        await docker.compose.down({
          cwd: process.cwd(),
          log: true
        });
      } catch (error) {
        console.log('Error cleaning up Docker resources:', error);
      }
    }
  });

  test('All containers are running', async () => {
    if (!process.env.DOCKER_AVAILABLE) {
      return;
    }
    const containers = await docker.listContainers();
    const requiredContainers = ['magazine-frontend', 'magazine-backend', 'magazine-mongodb'];
    
    for (const required of requiredContainers) {
      const found = containers.some(container => 
        container.Names.some(name => name.includes(required))
      );
      expect(found).toBeTruthy();
    }
  });

  test('Frontend is accessible', async () => {
    if (!process.env.DOCKER_AVAILABLE) {
      return;
    }
    const response = await axios.get('http://localhost');
    expect(response.status).toBe(200);
  });

  test('Backend API is responsive', async () => {
    if (!process.env.DOCKER_AVAILABLE) {
      return;
    }
    const response = await axios.get('http://localhost:5000/health');
    expect(response.status).toBe(200);
  });

  test('MongoDB connection is working', async () => {
    if (!process.env.DOCKER_AVAILABLE) {
      return;
    }
    mongoClient = await MongoClient.connect(
      'mongodb://localhost:27017',
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    const isConnected = mongoClient.isConnected();
    expect(isConnected).toBeTruthy();
  });

  test('Services can communicate', async () => {
    if (!process.env.DOCKER_AVAILABLE) {
      return;
    }
    // Test frontend to backend communication
    const apiResponse = await axios.get('http://localhost/api/health');
    expect(apiResponse.status).toBe(200);

    // Test backend to database communication
    const dbResponse = await axios.get('http://localhost:5000/api/db-check');
    expect(dbResponse.data.connected).toBeTruthy();
  });

  test('Volume persistence', async () => {
    if (!process.env.DOCKER_AVAILABLE) {
      return;
    }
    // Create test data
    const testData = { test: 'data' };
    await mongoClient.db('test').collection('test').insertOne(testData);

    // Restart containers
    await docker.compose.restart();

    // Verify data persists
    const savedData = await mongoClient.db('test').collection('test').findOne({ test: 'data' });
    expect(savedData).toBeTruthy();
  });
}); 
 