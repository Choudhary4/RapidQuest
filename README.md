# Competitive Landscape Monitoring Platform

A complete full-stack application for monitoring competitor updates, pricing changes, product launches, and campaigns with AI-powered classification and real-time alerts.

## 🚀 Features

### Core Functionality
- **Automated Web Scraping** - Monitor competitor websites automatically
- **AI Classification** - Intelligent categorization using Claude/OpenAI
- **Real-time Alerts** - Email and in-app notifications for important updates
- **Analytics Dashboard** - Comprehensive insights and visualizations
- **Impact Scoring** - Automatic assessment of update significance
- **Sentiment Analysis** - Track positive/negative competitive news

### Technical Highlights
- ✅ Full-stack MERN application (MongoDB, Express, React, Node.js)
- ✅ AI-powered classification (Claude Sonnet 4.5 & OpenAI GPT-4)
- ✅ Automated scraping with Cheerio
- ✅ JWT authentication
- ✅ Role-based access control (Admin/User)
- ✅ Scheduled jobs with node-cron
- ✅ Email notifications via SendGrid
- ✅ Modern React UI with TailwindCSS
- ✅ Real-time charts with Recharts
- ✅ Production-ready error handling

## 📁 Project Structure

```
competitive-landscape-monitoring/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── jobs/             # Cron jobs
│   │   ├── middlewares/      # Express middlewares
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Helper functions
│   │   └── index.js          # Main server file
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── store/            # Zustand store
│   │   ├── utils/            # Helper functions
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- API keys for Claude and/or OpenAI
- SendGrid API key (for email notifications)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/competitive-monitoring
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/competitive-monitoring

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# AI APIs (at least one required)
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=alerts@yourcompany.com
ADMIN_EMAIL=admin@yourcompany.com

# CORS
CORS_ORIGIN=http://localhost:5173
```

5. Start MongoDB (if running locally):
```bash
# On macOS/Linux
mongod

# On Windows
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
```

6. Start backend server:
```bash
# Development
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment (optional, defaults to localhost:5000):
```env
VITE_API_URL=http://localhost:5000/api/v1
```

5. Start development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

### Competitors Endpoints

#### Get All Competitors
```http
GET /api/v1/competitors?page=1&limit=10
Authorization: Bearer <token>
```

#### Create Competitor (Admin)
```http
POST /api/v1/competitors
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Competitor Name",
  "baseUrl": "https://competitor.com",
  "industry": "SaaS",
  "scrapeTargets": [
    {
      "name": "Pricing",
      "url": "/pricing",
      "type": "pricing"
    },
    {
      "name": "Blog",
      "url": "/blog",
      "type": "news"
    }
  ]
}
```

#### Get Competitor Stats
```http
GET /api/v1/competitors/:id/stats
Authorization: Bearer <token>
```

### Updates Endpoints

#### Get All Updates
```http
GET /api/v1/updates?page=1&limit=20&category=pricing
Authorization: Bearer <token>
```

#### Manually Refresh Updates (Admin)
```http
POST /api/v1/updates/refresh
Authorization: Bearer <token>
Content-Type: application/json

{
  "competitorId": "507f1f77bcf86cd799439011"
}
```

### Alerts Endpoints

#### Get All Alerts
```http
GET /api/v1/alerts?read=false&severity=high
Authorization: Bearer <token>
```

#### Mark Alert as Read
```http
PUT /api/v1/alerts/:id/read
Authorization: Bearer <token>
```

### Analytics Endpoints

#### Get Dashboard Overview
```http
GET /api/v1/analytics/overview?days=30
Authorization: Bearer <token>
```

#### Get Timeline Data
```http
GET /api/v1/analytics/timeline?days=30
Authorization: Bearer <token>
```

## 🚀 Deployment

### Deploy Backend (Render/Railway)

#### Using Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Environment:** Add all variables from `.env`
4. Deploy

#### Using Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
railway login
cd backend
railway init
railway up
```

3. Add environment variables via Railway dashboard

### Deploy Frontend (Vercel)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

3. Configure environment variables in Vercel dashboard:
   - `VITE_API_URL`: Your backend URL

Or use Vercel GitHub integration for automatic deployments.

### Database (MongoDB Atlas)

1. Create cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP addresses (or allow all: 0.0.0.0/0)
4. Get connection string
5. Update `MONGODB_URI` in backend environment variables

## 🔧 Configuration

### Scraping Configuration

Update competitor scrape targets in the database or via API:

```javascript
{
  "scrapeTargets": [
    {
      "name": "Pricing Page",
      "url": "/pricing",
      "type": "pricing",
      "selector": ".pricing-card" // Optional CSS selector
    },
    {
      "name": "News",
      "url": "/news",
      "type": "news"
    }
  ]
}
```

### Alert Rules

Alerts are automatically triggered for:
- Price drops ≥ 10%
- Price increases ≥ 15%
- New product launches
- Marketing campaigns
- Negative news (sentiment < -0.5)
- High impact updates (score ≥ 8)
- Activity spikes (3x average)

Customize in `backend/src/services/alertService.js`

### Cron Job Schedule

Default schedule (customize in `backend/src/jobs/cronJobs.js`):
- **Scraping:** Every 10 minutes
- **Re-classification:** Every hour
- **Cleanup:** Daily at 2 AM
- **Analytics:** Every 6 hours

## 🧪 Testing

### Create Test User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Add Test Competitor

```bash
curl -X POST http://localhost:5000/api/v1/competitors \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Example Competitor",
    "baseUrl": "https://example.com",
    "scrapeTargets": [
      {
        "name": "Pricing",
        "url": "/pricing",
        "type": "pricing"
      }
    ]
  }'
```

## 📊 Features Breakdown

### AI Classification

The platform uses Claude Sonnet 4.5 or OpenAI GPT-4 to classify updates:

- **Categories:** pricing, campaign, product_launch, feature_update, press, negative_news, other
- **Sentiment:** positive, neutral, negative (with -1 to 1 score)
- **Impact Score:** 0-10 based on significance
- **Entity Extraction:** Products, prices, discounts, dates, keywords
- **Confidence:** 0-1 indicating classification certainty

Fallback to rule-based classification if AI is unavailable.

### Scraping Engine

- Supports static and dynamic pages
- Handles multiple content types (pricing, news, blogs)
- Automatic deduplication
- Retry logic with exponential backoff
- Custom CSS selectors for targeted scraping
- Respects robots.txt and rate limiting

## 🔒 Security

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on API endpoints
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Input validation
- ✅ SQL injection prevention (Mongoose)
- ✅ XSS protection

## 📈 Performance

- Indexed database queries
- Pagination on all list endpoints
- Response caching (React Query)
- Optimized bundle size (Vite)
- Lazy loading for routes
- Efficient data aggregation

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify `.env` configuration
- Check port 5000 is available

### Frontend can't connect
- Verify backend is running
- Check CORS settings
- Verify `VITE_API_URL` in frontend `.env`

### Scraping fails
- Check target website is accessible
- Verify CSS selectors are correct
- Check for rate limiting
- Review logs for specific errors

### AI classification not working
- Verify API keys are set correctly
- Check API key validity and credits
- Review logs for API errors
- System falls back to rule-based classification

## 📝 License

MIT License - feel free to use for commercial projects

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📧 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@yourcompany.com

## 🎯 Roadmap

- [ ] Slack notifications
- [ ] Webhook support
- [ ] Custom alert rules
- [ ] PDF report generation
- [ ] Competitor benchmarking
- [ ] Social media monitoring
- [ ] Advanced sentiment analysis
- [ ] Multi-language support

---

Built with ❤️ using Claude Sonnet 4.5
