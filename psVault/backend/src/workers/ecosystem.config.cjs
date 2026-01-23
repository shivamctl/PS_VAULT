module.exports = {
  apps: [
    {
      name: "listingWorker",
      script: "src/workers/listingWorker.js",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      watch: false,
    },
    {
      name: "retryWorker",
      script: "src/workers/retryWorker.js",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      watch: false,
    },
    {
      name: "notifyWorker",
      script: "src/workers/notifyWorker.js",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      watch: false,
    },
  ],
};
