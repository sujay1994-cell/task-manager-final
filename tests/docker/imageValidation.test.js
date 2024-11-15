const Docker = require('dockerode');
const axios = require('axios');
const { MongoClient } = require('mongodb');
const TestLogger = require('../../utils/testLogger');

const docker = new Docker();
const config = require('../../config/test.config');

describe('Docker Image Validation Tests', () => {
  let containers = {};
  let mongoClient;

  beforeAll(async () => {
    TestLogger.logInfo('Starting Docker image validation tests');
    try {
      // Pull required images
      await Promise.all([
        docker.pull('node:16-alpine'),
        docker.pull('mongo:latest'),
        docker.pull('nginx:alpine')
      ]);

      // Build images
      await docker.compose.build({
        cwd: process.cwd(),
        log: true
      });

      TestLogger.logInfo('Docker images built successfully');
    } catch (error) {
      TestLogger.logError('DockerBuildError', error);
      throw error;
    }
  });

  afterAll(async () => {
    // Cleanup
    if (mongoClient) {
      await mongoClient.close();
    }
    await docker.compose.down({
      cwd: process.cwd(),
      volumes: true
    });
    TestLogger.logInfo('Test cleanup completed');
  });

  describe('Container Creation Tests', () => {
    test('All required containers should be created', async () => {
      try {
        const containers = await docker.listContainers();
        const requiredContainers = [
          'magazine-frontend',
          'magazine-backend',
          'magazine-mongodb'
        ];

        for (const required of requiredContainers) {
          const containerExists = containers.some(container => 
            container.Names.some(name => name.includes(required))
          );
          expect(containerExists).toBeTruthy();
          TestLogger.logInfo(`Container ${required} created successfully`);
        }
      } catch (error) {
        TestLogger.logError('ContainerCreationError', error);
        throw error;
      }
    });

    test('All containers should be in running state', async () => {
      try {
        const containers = await docker.listContainers();
        containers.forEach(container => {
          expect(container.State).toBe('running');
          expect(container.Status).toContain('Up');
          TestLogger.logInfo(`Container ${container.Names[0]} is running`);
        });
      } catch (error) {
        TestLogger.logError('ContainerStateError', error);
        throw error;
      }
    });
  });

  describe('Network Tests', () => {
    test('Required networks should exist', async () => {
      try {
        const networks = await docker.listNetworks();
        const requiredNetworks = [
          'magazine-frontend-network',
          'magazine-backend-network'
        ];

        for (const network of requiredNetworks) {
          const networkExists = networks.some(n => n.Name === network);
          expect(networkExists).toBeTruthy();
          TestLogger.logInfo(`Network ${network} exists`);
        }
      } catch (error) {
        TestLogger.logError('NetworkValidationError', error);
        throw error;
      }
    });

    test('Containers should be connected to correct networks', async () => {
      try {
        const frontendNetwork = await docker.getNetwork('magazine-frontend-network');
        const backendNetwork = await docker.getNetwork('magazine-backend-network');

        const frontendInfo = await frontendNetwork.inspect();
        const backendInfo = await backendNetwork.inspect();

        // Frontend network should contain frontend and backend
        expect(frontendInfo.Containers).toHaveProperty('magazine-frontend');
        expect(frontendInfo.Containers).toHaveProperty('magazine-backend');

        // Backend network should contain backend and mongodb
        expect(backendInfo.Containers).toHaveProperty('magazine-backend');
        expect(backendInfo.Containers).toHaveProperty('magazine-mongodb');

        TestLogger.logInfo('Network connections validated successfully');
      } catch (error) {
        TestLogger.logError('NetworkConnectionError', error);
        throw error;
      }
    });
  });

  describe('Service Health Checks', () => {
    test('Frontend service should be healthy', async () => {
      try {
        const response = await axios.get('http://localhost/health');
        expect(response.status).toBe(200);
        TestLogger.logInfo('Frontend health check passed');
      } catch (error) {
        TestLogger.logError('FrontendHealthCheckError', error);
        throw error;
      }
    });

    test('Backend service should be healthy', async () => {
      try {
        const response = await axios.get('http://localhost:5000/health');
        expect(response.status).toBe(200);
        TestLogger.logInfo('Backend health check passed');
      } catch (error) {
        TestLogger.logError('BackendHealthCheckError', error);
        throw error;
      }
    });

    test('MongoDB should be accessible', async () => {
      try {
        mongoClient = await MongoClient.connect(
          'mongodb://localhost:27017',
          { useNewUrlParser: true, useUnifiedTopology: true }
        );
        const isConnected = mongoClient.isConnected();
        expect(isConnected).toBeTruthy();
        TestLogger.logInfo('MongoDB health check passed');
      } catch (error) {
        TestLogger.logError('MongoDBHealthCheckError', error);
        throw error;
      }
    });
  });

  describe('Service Communication Tests', () => {
    test('Frontend should communicate with backend API', async () => {
      try {
        const response = await axios.get('http://localhost/api/health');
        expect(response.status).toBe(200);
        TestLogger.logInfo('Frontend to Backend communication successful');
      } catch (error) {
        TestLogger.logError('FrontendBackendCommunicationError', error);
        throw error;
      }
    });

    test('Backend should communicate with MongoDB', async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/db-check');
        expect(response.status).toBe(200);
        expect(response.data.connected).toBeTruthy();
        TestLogger.logInfo('Backend to MongoDB communication successful');
      } catch (error) {
        TestLogger.logError('BackendMongoDBCommunicationError', error);
        throw error;
      }
    });
  });

  describe('Resource Usage Tests', () => {
    test('Container resource limits should be respected', async () => {
      try {
        const containers = await docker.listContainers();
        for (const container of containers) {
          const stats = await docker.getContainer(container.Id).stats({ stream: false });
          
          // Check memory usage
          const memoryUsage = stats.memory_stats.usage;
          const memoryLimit = stats.memory_stats.limit;
          expect(memoryUsage).toBeLessThan(memoryLimit);

          // Check CPU usage
          const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
          const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
          const cpuPercent = (cpuDelta / systemDelta) * 100;
          expect(cpuPercent).toBeLessThan(80); // CPU usage should be less than 80%

          TestLogger.logInfo(`Resource usage validated for ${container.Names[0]}`);
        }
      } catch (error) {
        TestLogger.logError('ResourceUsageError', error);
        throw error;
      }
    });
  });
}); 