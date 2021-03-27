module.exports = {
  apps: [
    {
      name: 'ALEKSAI',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'dev',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      env_staging: {
        NODE_ENV: 'staging',
      },
    },
  ],

  deploy : {
    staging : {
      user : 'root',
      host : 'gb.lenyapugachev.com',
      key  : '~/.ssh/id_rsa',
      ref  : 'origin/master',
      repo : 'git@github.com:lenyapugachev/aleksai.git',
      path : '/var/www/aleksai',
      'post-deploy' : 'npm i && ./node_modules/pm2/bin/pm2 start ecosystem.config.js --env staging'
    }
  }
};