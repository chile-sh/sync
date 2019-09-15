/* eslint-disable @typescript-eslint/camelcase */

module.exports = {
  apps: [
    {
      name: 'sync-api',
      script: 'app.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'chile.sh',
      port: '42069',
      ref: 'origin/master',
      repo: 'git@github.com:chile-sh/sync.git',
      path: '/home/deploy/apps/sync/production',
      'post-deploy':
        'yarn install && pm2 reload ecosystem.config.js --env production',
    },
  },
}
