const { exec } = require('child_process');

function killPort(port) {
  return new Promise((resolve, reject) => {
    const command = process.platform === 'win32'
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port} | grep LISTEN | awk '{print $2}'`;

    exec(command, (error, stdout, stderr) => {
      if (error || !stdout) {
        console.log(`No process running on port ${port}`);
        resolve();
        return;
      }

      const pid = process.platform === 'win32'
        ? stdout.split('\n')[0].split(' ').filter(Boolean).pop()
        : stdout.trim();

      const killCommand = process.platform === 'win32'
        ? `taskkill /F /PID ${pid}`
        : `kill -9 ${pid}`;

      exec(killCommand, (err) => {
        if (err) {
          console.log(`Failed to kill process on port ${port}`);
        } else {
          console.log(`Killed process on port ${port}`);
        }
        resolve();
      });
    });
  });
}

module.exports = killPort; 