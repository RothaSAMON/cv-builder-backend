module.exports = {
  apps: [
    {
      name: 'cv-builder-backend', // Name of the app for PM2
      script: 'dist/main', // The entry file after building your app
      instances: 'max', // Use all available CPU cores
      autorestart: true, // Ensure the app restarts on crash
      watch: false, // Disable file watching for production (optional)
      max_memory_restart: '1G', // Restart the app if it exceeds 1GB memory usage
      env: {
        NODE_ENV: 'development', // Development environment for development mode
      },
      env_production: {
        NODE_ENV: 'production', // Production environment for production mode
        PORT: 3000, // You can set any port you like
      },
    },
  ],
};
