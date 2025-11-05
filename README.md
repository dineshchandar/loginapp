# Work Location Tracker

Simple web app to track work location (HOME, JPMC OFFICE, DELOITTE OFFICE) and export records as CSV.

## Features
- Record location with timestamp
- List recent entries
- Edit or delete records
- Export all data in CSV format
- Basic authentication for security

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Copy example environment file and configure:
```bash
cp .env.example .env
# Edit .env to set AUTH_USERNAME and AUTH_PASSWORD if desired
```

3. Start the server:
```bash
npm start
# or npm run dev for development with auto-reload
```

4. Open http://localhost:3000 in your browser

## Deployment Options

### 1. Render (Recommended)

1. Push code to GitHub
2. Create new Web Service on render.com
3. Connect your repository
4. Configure environment variables:
   - PORT: 3000
   - AUTH_USERNAME: your-admin-username
   - AUTH_PASSWORD: your-secure-password
5. Deploy

### 2. Railway

Similar to Render:
1. Connect GitHub repo
2. Configure environment variables
3. Automatic deployments

### 3. Virtual Private Server (DigitalOcean, Linode)

1. SSH into your server
2. Install Node.js and npm
3. Clone repository
4. Install dependencies: `npm install`
5. Set up environment: `cp .env.example .env && nano .env`
6. Install PM2: `npm install -g pm2`
7. Start with PM2: `pm2 start server.js`
8. (Optional) Set up nginx as reverse proxy

### 4. Cloud Providers
- AWS Elastic Beanstalk
- Google Cloud App Engine
- Azure App Service

## Security Notes

- Always use HTTPS in production
- Set secure credentials in .env
- Back up data.json regularly
- Consider using a proper database for large deployments
- Set ALLOWED_ORIGINS in production to limit access

