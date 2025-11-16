# Competitor Examples

Here are real-world competitor examples you can use to test the platform:

## Example 1: Stripe (Payment Processing SaaS)

### Via Frontend UI:
1. Go to the Competitors page
2. Click "Add Competitor"
3. Fill in the form:

```
Name: Stripe
Base URL: https://stripe.com
Industry: Payment Processing / FinTech
```

**Scrape Targets:**
```json
[
  {
    "name": "Pricing Page",
    "url": "/pricing",
    "type": "pricing"
  },
  {
    "name": "Blog",
    "url": "/blog",
    "type": "news"
  },
  {
    "name": "Product Updates",
    "url": "/newsroom",
    "type": "press"
  }
]
```

### Via API (Postman/cURL):

```bash
curl -X POST http://localhost:5000/api/v1/competitors \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Stripe",
    "baseUrl": "https://stripe.com",
    "industry": "Payment Processing",
    "scrapeTargets": [
      {
        "name": "Pricing Page",
        "url": "/pricing",
        "type": "pricing"
      },
      {
        "name": "Blog",
        "url": "/blog",
        "type": "news"
      },
      {
        "name": "Product Updates",
        "url": "/newsroom",
        "type": "press"
      }
    ]
  }'
```

---

## Example 2: Notion (Productivity SaaS)

```json
{
  "name": "Notion",
  "baseUrl": "https://www.notion.so",
  "industry": "Productivity / Collaboration",
  "scrapeTargets": [
    {
      "name": "Pricing",
      "url": "/pricing",
      "type": "pricing"
    },
    {
      "name": "What's New",
      "url": "/releases",
      "type": "product"
    },
    {
      "name": "Blog",
      "url": "/blog",
      "type": "news"
    }
  ]
}
```

---

## Example 3: Shopify (E-commerce Platform)

```json
{
  "name": "Shopify",
  "baseUrl": "https://www.shopify.com",
  "industry": "E-commerce",
  "scrapeTargets": [
    {
      "name": "Pricing Plans",
      "url": "/pricing",
      "type": "pricing"
    },
    {
      "name": "Blog",
      "url": "/blog",
      "type": "news"
    },
    {
      "name": "Changelog",
      "url": "/changelog",
      "type": "product"
    }
  ]
}
```

---

## Example 4: Vercel (Hosting Platform)

```json
{
  "name": "Vercel",
  "baseUrl": "https://vercel.com",
  "industry": "Cloud Hosting / DevOps",
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
    },
    {
      "name": "Changelog",
      "url": "/changelog",
      "type": "product"
    }
  ]
}
```

---

## Example 5: Linear (Project Management)

```json
{
  "name": "Linear",
  "baseUrl": "https://linear.app",
  "industry": "Project Management",
  "scrapeTargets": [
    {
      "name": "Pricing",
      "url": "/pricing",
      "type": "pricing"
    },
    {
      "name": "Changelog",
      "url": "/changelog",
      "type": "product"
    },
    {
      "name": "Blog",
      "url": "/blog",
      "type": "news"
    }
  ]
}
```

---

## Example 6: Figma (Design Tool)

```json
{
  "name": "Figma",
  "baseUrl": "https://www.figma.com",
  "industry": "Design / Collaboration",
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
    },
    {
      "name": "What's New",
      "url": "/whats-new",
      "type": "product"
    }
  ]
}
```

---

## Example 7: Airtable (Database/No-Code)

```json
{
  "name": "Airtable",
  "baseUrl": "https://www.airtable.com",
  "industry": "Database / No-Code",
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
    },
    {
      "name": "Product Updates",
      "url": "/releases",
      "type": "product"
    }
  ]
}
```

---

## Example 8: GitHub (Developer Platform)

```json
{
  "name": "GitHub",
  "baseUrl": "https://github.com",
  "industry": "Developer Tools",
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
    },
    {
      "name": "Changelog",
      "url": "/changelog",
      "type": "product"
    }
  ]
}
```

---

## Quick Start Guide

### Step 1: Register as Admin
1. Go to `http://localhost:5173/register`
2. Fill in your details
3. **Select "Admin" from the Role dropdown**
4. Click "Sign Up"

### Step 2: Add Your First Competitor
1. Navigate to the **Competitors** page
2. Click **"Add Competitor"** button
3. Copy one of the examples above
4. Paste the values into the form
5. Click **"Add Competitor"**

### Step 3: Trigger First Scrape
**Option A: Wait for automatic scraping** (runs every 10 minutes)

**Option B: Manual refresh:**
1. Click the **"Refresh"** button on the competitor card
2. Or use the API:
```bash
curl -X POST http://localhost:5000/api/v1/updates/refresh \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"competitorId": "COMPETITOR_ID_HERE"}'
```

### Step 4: View Updates
1. Go to the **Updates** page
2. You'll see scraped content with AI classification:
   - Category (pricing, product_launch, campaign, etc.)
   - Sentiment (positive, neutral, negative)
   - Impact Score (0-10)

### Step 5: Check Alerts
1. Go to the **Alerts** page
2. View triggered alerts for:
   - Price changes
   - Product launches
   - Negative news
   - Activity spikes

---

## Testing with Custom Selectors

For more targeted scraping, you can add CSS selectors:

```json
{
  "name": "Example Company",
  "baseUrl": "https://example.com",
  "industry": "SaaS",
  "scrapeTargets": [
    {
      "name": "Pricing Cards",
      "url": "/pricing",
      "type": "pricing",
      "selector": ".pricing-card"
    },
    {
      "name": "Latest Blog Posts",
      "url": "/blog",
      "type": "news",
      "selector": "article.blog-post"
    }
  ]
}
```

---

## Bulk Import Script

Want to add multiple competitors at once? Use this script:

```bash
cd c:\red\backend
node scripts/importCompetitors.js
```

Let me create that script for you:
