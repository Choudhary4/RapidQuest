# API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication via JWT token.

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Auth Endpoints

### Register User
Creates a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Login
Authenticates a user and returns JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Get Current User
Returns the authenticated user's profile.

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Competitors Endpoints

### Get All Competitors
Retrieves all competitors with pagination.

**Endpoint:** `GET /competitors`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `active` (optional): Filter by active status (true/false)

**Example:** `GET /competitors?page=1&limit=20&active=true`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Competitor Name",
      "baseUrl": "https://competitor.com",
      "industry": "SaaS",
      "active": true,
      "scrapeTargets": [
        {
          "name": "Pricing",
          "url": "/pricing",
          "type": "pricing"
        }
      ],
      "lastScrapedAt": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-10T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "totalItems": 45,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### Get Competitor by ID
Retrieves a specific competitor.

**Endpoint:** `GET /competitors/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Competitor Name",
    "baseUrl": "https://competitor.com",
    "industry": "SaaS",
    "active": true,
    "scrapeTargets": [...],
    "lastScrapedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Create Competitor (Admin Only)
Creates a new competitor to monitor.

**Endpoint:** `POST /competitors`

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Competitor Name",
  "baseUrl": "https://competitor.com",
  "industry": "SaaS",
  "scrapeTargets": [
    {
      "name": "Pricing Page",
      "url": "/pricing",
      "type": "pricing",
      "selector": ".pricing-card"
    },
    {
      "name": "Blog",
      "url": "/blog",
      "type": "news"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Competitor Name",
    "baseUrl": "https://competitor.com",
    "industry": "SaaS",
    "active": true,
    "scrapeTargets": [...],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Update Competitor (Admin Only)
Updates an existing competitor.

**Endpoint:** `PUT /competitors/:id`

**Request Body:**
```json
{
  "name": "Updated Name",
  "active": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Name",
    "active": false,
    ...
  }
}
```

---

### Delete Competitor (Admin Only)
Deletes a competitor.

**Endpoint:** `DELETE /competitors/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {}
}
```

---

### Get Competitor Stats
Retrieves statistics for a specific competitor.

**Endpoint:** `GET /competitors/:id/stats`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUpdates": 156,
    "updatesByCategory": {
      "pricing": 23,
      "product_launch": 12,
      "campaign": 45,
      "feature_update": 67,
      "press": 9
    },
    "averageImpactScore": 6.8,
    "lastUpdate": "2024-01-15T10:30:00.000Z",
    "alertsTriggered": 8
  }
}
```

---

## Updates Endpoints

### Get All Updates
Retrieves all updates with filtering and pagination.

**Endpoint:** `GET /updates`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `category` (optional): Filter by category (pricing, campaign, product_launch, etc.)
- `competitorId` (optional): Filter by competitor ID
- `sentiment` (optional): Filter by sentiment (positive, neutral, negative)
- `search` (optional): Search in title and summary
- `minImpact` (optional): Minimum impact score (0-10)

**Example:** `GET /updates?category=pricing&minImpact=7&page=1&limit=20`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "companyId": {
        "_id": "507f...",
        "name": "Competitor Name"
      },
      "title": "New Pricing Plans Announced",
      "summary": "Competitor has introduced new enterprise pricing...",
      "url": "https://competitor.com/pricing",
      "category": "pricing",
      "sentiment": "neutral",
      "sentimentScore": 0.1,
      "impactScore": 8,
      "confidence": 0.95,
      "entities": {
        "products": ["Enterprise Plan", "Pro Plan"],
        "prices": ["$99/month", "$299/month"],
        "keywords": ["pricing", "enterprise", "plans"]
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "classifiedAt": "2024-01-15T10:31:00.000Z"
    }
  ],
  "pagination": {...}
}
```

---

### Get Update by ID
Retrieves a specific update.

**Endpoint:** `GET /updates/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "companyId": {...},
    "title": "New Pricing Plans Announced",
    ...
  }
}
```

---

### Manually Refresh Updates (Admin Only)
Triggers immediate scraping for a competitor or all competitors.

**Endpoint:** `POST /updates/refresh`

**Request Body (optional):**
```json
{
  "competitorId": "507f1f77bcf86cd799439011"
}
```

If no `competitorId` provided, refreshes all active competitors.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Refresh initiated for 1 competitor(s)",
    "newUpdates": 5
  }
}
```

---

### Get Timeline Data
Retrieves aggregated update data for charts.

**Endpoint:** `GET /updates/timeline`

**Query Parameters:**
- `days` (optional): Number of days to include (default: 30)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "count": 12,
      "byCategory": {
        "pricing": 3,
        "campaign": 5,
        "product_launch": 2,
        "feature_update": 2
      }
    },
    ...
  ]
}
```

---

## Alerts Endpoints

### Get All Alerts
Retrieves all alerts with filtering.

**Endpoint:** `GET /alerts`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `read` (optional): Filter by read status (true/false)
- `severity` (optional): Filter by severity (low, medium, high, critical)
- `rule` (optional): Filter by rule type

**Example:** `GET /alerts?read=false&severity=high`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "companyId": {
        "_id": "507f...",
        "name": "Competitor Name"
      },
      "updateId": {
        "_id": "507f...",
        "title": "Price Drop on Enterprise Plan",
        "url": "https://competitor.com/pricing"
      },
      "rule": "price_drop",
      "severity": "high",
      "title": "Significant Price Drop Detected",
      "message": "Competitor Name reduced Enterprise Plan pricing by 25%",
      "metadata": {
        "previousValue": "$399/month",
        "newValue": "$299/month",
        "changePercentage": -25.06
      },
      "read": false,
      "emailSent": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {...}
}
```

---

### Mark Alert as Read
Marks a specific alert as read.

**Endpoint:** `PUT /alerts/:id/read`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "read": true,
    "readAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### Mark All Alerts as Read
Marks all alerts for the current user as read.

**Endpoint:** `PUT /alerts/mark-all-read`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Marked 15 alerts as read"
  }
}
```

---

## Analytics Endpoints

### Get Dashboard Overview
Retrieves summary statistics for the dashboard.

**Endpoint:** `GET /analytics/overview`

**Query Parameters:**
- `days` (optional): Number of days to analyze (default: 30)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUpdates": 487,
    "unreadAlerts": 12,
    "activeCompetitors": 8,
    "categoryBreakdown": {
      "pricing": 78,
      "campaign": 145,
      "product_launch": 34,
      "feature_update": 189,
      "press": 23,
      "negative_news": 8,
      "other": 10
    },
    "recentActivity": [
      {
        "date": "2024-01-15",
        "updates": 23,
        "alerts": 3
      },
      ...
    ],
    "topCompetitors": [
      {
        "name": "Competitor A",
        "updateCount": 89
      },
      ...
    ]
  }
}
```

---

### Get Timeline Data
Retrieves time-series data for charts.

**Endpoint:** `GET /analytics/timeline`

**Query Parameters:**
- `days` (optional): Number of days (default: 30)
- `competitorId` (optional): Filter by competitor

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "totalUpdates": 23,
      "pricing": 4,
      "campaign": 8,
      "product_launch": 2,
      "feature_update": 7,
      "press": 1,
      "negative_news": 0,
      "other": 1
    },
    ...
  ]
}
```

---

### Detect Activity Spikes
Detects unusual activity patterns.

**Endpoint:** `GET /analytics/spikes`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "competitorId": {
        "_id": "507f...",
        "name": "Competitor Name"
      },
      "date": "2024-01-15",
      "updateCount": 45,
      "averageCount": 12,
      "percentageIncrease": 275,
      "category": "campaign"
    }
  ]
}
```

---

## Error Responses

All endpoints return errors in the following format:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "User role 'user' is not authorized to access this route"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Resource not found with id of 507f1f77bcf86cd799439011"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **General endpoints:** 100 requests per 15 minutes
- **Auth endpoints:** 5 requests per 15 minutes

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

---

## Webhook Support (Coming Soon)

Future versions will support webhooks for real-time notifications:
- Alert triggered
- Update detected
- Competitor status changed
