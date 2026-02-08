require('dotenv').config();

module.exports = {
  apps: [{
    name: 'backend',
    script: './src/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: process.env.NODE_ENV || 'production',
      MONGODB_URI: process.env.MONGODB_URI,
      PORT: process.env.PORT || 5000,
      JWT_SECRET: process.env.JWT_SECRET,
      // Thêm các biến môi trường khác nếu cần
      ...process.env
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
  }]
};

