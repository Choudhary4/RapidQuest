# Installation Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18 or higher
- **npm** (comes with Node.js)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** (for cloning the repository)

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd competitive-landscape-monitoring
```

### 2. Install All Dependencies

```bash
npm run install:all
```

This will install dependencies for both backend and frontend.

### 3. Configure Backend Environment

Navigate to the backend directory and create `.env` file:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and configure the following required variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/competitive-monitoring

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# At least one AI API key is required
ANTHROPIC_API_KEY=sk-ant-xxxxx
# OR
OPENAI_API_KEY=sk-xxxxx

# Email (optional but recommended for alerts)
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=alerts@yourcompany.com
```

### 4. Start MongoDB

If using local MongoDB:

**macOS/Linux:**
```bash
mongod
```

**Windows:**
```bash
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
```

**Using MongoDB Atlas:**
- No local MongoDB needed
- Update `MONGODB_URI` in `.env` with your Atlas connection string

### 5. Start the Application

From the root directory:

**Development mode (both backend and frontend):**
```bash
npm run dev
```

This will start:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:5173`

**Or start separately:**

Backend only:
```bash
cd backend
npm run dev
```

Frontend only:
```bash
cd frontend
npm run dev
```

## Verify Installation

1. Open your browser to `http://localhost:5173`
2. You should see the login page
3. Create a new account using the Register link
4. After registration, you'll be logged in automatically

## Initial Setup

### Create Your First Competitor

1. Navigate to the Competitors page
2. Click "Add Competitor"
3. Fill in the form:
   - **Name:** Competitor name
   - **Base URL:** https://competitor.com
   - **Industry:** SaaS, E-commerce, etc.
   - **Scrape Targets:** Add URLs to monitor

Example scrape target:
```json
{
  "name": "Pricing Page",
  "url": "/pricing",
  "type": "pricing"
}
```

4. Click "Add Competitor"
5. The system will automatically start scraping within 10 minutes (or click "Refresh" for immediate scraping)

## API Keys Setup

### Anthropic Claude API

1. Go to https://console.anthropic.com/
2. Create an account or sign in
3. Navigate to API Keys
4. Create a new API key
5. Copy and paste into `.env` as `ANTHROPIC_API_KEY`

### OpenAI API

1. Go to https://platform.openai.com/
2. Create an account or sign in
3. Navigate to API Keys
4. Create a new API key
5. Copy and paste into `.env` as `OPENAI_API_KEY`

### SendGrid Email

1. Go to https://sendgrid.com/
2. Create an account
3. Navigate to Settings > API Keys
4. Create an API key with Mail Send permissions
5. Copy and paste into `.env` as `SENDGRID_API_KEY`
6. Verify sender email in SendGrid dashboard

## Troubleshooting

### MongoDB Connection Failed

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For local MongoDB, try: `mongodb://127.0.0.1:27017/competitive-monitoring`
- For Atlas, ensure IP whitelist is configured

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**
- Change `PORT` in backend `.env`
- Kill process using the port:
  ```bash
  # Find process
  lsof -i :5000
  # Kill it
  kill -9 <PID>
  ```

### Frontend Can't Connect to Backend

**Error:** Network errors or CORS issues

**Solutions:**
- Ensure backend is running on `http://localhost:5000`
- Check `VITE_API_URL` in frontend `.env`
- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL

### AI Classification Not Working

**Symptoms:** Updates appear but without proper categorization

**Solutions:**
- Verify at least one API key (`ANTHROPIC_API_KEY` or `OPENAI_API_KEY`) is set
- Check API key is valid and has credits
- Review backend logs for API errors
- System will fall back to rule-based classification if AI fails

### Scraping Not Working

**Symptoms:** No updates appearing for competitors

**Solutions:**
- Check target website is accessible
- Verify scrape target URLs are correct
- Review backend logs for errors
- Try manual refresh from Competitors page
- Some websites block scrapers - may need to adjust user agent or use proxies

## Next Steps

After successful installation:

1. **Add Competitors** - Start monitoring your key competitors
2. **Configure Alerts** - Customize alert rules in backend code
3. **Set Up Email** - Configure SendGrid for email notifications
4. **Schedule Backups** - Set up MongoDB backup strategy
5. **Production Deployment** - Follow deployment guides for Render/Vercel

## Getting Help

If you encounter issues:
1. Check the logs: `backend/logs/error.log`
2. Review the troubleshooting section above
3. Consult the main README.md for detailed documentation
4. Create an issue on GitHub with error logs and steps to reproduce
