# Coupon Management System

## Project Overview
Backend REST API for an e-commerce coupon management system. The service allows creating coupons with complex eligibility rules, finding the best coupon for a given user and cart, applying coupons with usage tracking, and viewing coupon analytics. All data is stored in memory (no database), as allowed in the assignment.

## Tech Stack
- Language: Node.js (JavaScript)
- Framework: Express.js
- Storage: In-memory JavaScript objects
- Tools: Thunder Client / Postman for API testing

---

## Features

- Create coupons with:
  - FLAT or PERCENT discount type
  - Optional max discount cap for percentage coupons
  - Validity period (startDate, endDate)
  - Optional per-user usage limit
  - Eligibility rules for user and cart
- Best coupon selection:
  - Filters only valid and eligible coupons
  - Computes discount for each coupon
  - Selects best coupon using:
    1. Highest discount
    2. Earliest end date
    3. Lexicographically smaller code
- Apply coupon:
  - Applies a specific coupon to a cart
  - Tracks usage per user and enforces usageLimitPerUser
  - Returns final amount, discount, and savings percentage
- Analytics:
  - System-wide coupon statistics
  - Detailed analytics for a single coupon
- Seed data:
  - 10 pre-loaded coupons covering multiple scenarios (new users, GOLD tier, category-based, bulk purchases, etc.)
- No UI and no authentication, as per assignment instructions.

---

## Prerequisites

- Node.js 18+ installed
- npm (comes with Node.js)

---

## Getting Started

### 1. Clone the repository

git clone <your-repo-url>
cd coupon-management


### 2. Install dependencies

npm install


### 3. Environment variables

Create a `.env` file (optional, defaults are safe):

PORT=3000
NODE_ENV=development


### 4. Run the server

npm start


The server starts at:

http://localhost:3000


Visit this URL in your browser to see a JSON welcome message with all endpoints listed.

---

## Demo User (Required by Assignment)

The following demo user is hard-coded in the backend and should be used when testing APIs:

- Email: `hire-me@anshumat.org`
- Password: `HireMe@2025!`
- userId: `demo-user-001`
- userTier: `GOLD`
- country: `IN`
- lifetimeSpend: `15000`
- ordersPlaced: `10`

---

## API Endpoints

Base URL (local):

http://localhost:3000


All endpoints are under `/api`.

### 1. Coupon Management

#### Create Coupon  
**POST** `/api/coupons`  

Example request body:

{
"code": "SAVE50",
"description": "₹50 off on orders above ₹500",
"discountType": "FLAT",
"discountValue": 50,
"startDate": "2025-12-01",
"endDate": "2025-12-31",
"usageLimitPerUser": 1,
"eligibility": {
"minCartValue": 500,
"allowedUserTiers": ["NEW", "REGULAR"]
}
}


#### List Coupons  
**GET** `/api/coupons`  

Supports optional query filters:

- `status=active|upcoming|expired`
- `discountType=FLAT|PERCENT`
- `userTier=NEW|REGULAR|GOLD`

Example:

- `/api/coupons?status=active`
- `/api/coupons?discountType=FLAT&userTier=GOLD`

#### Get Coupon by Code  
**GET** `/api/coupons/:code`  

Example: `/api/coupons/GOLD20`

#### Delete Coupon (for testing)  
**DELETE** `/api/coupons/:code`

---

### 2. Best Coupon Selection

#### Get Best Coupon  
**POST** `/api/best-coupon`

Request body:

{
"user": {
"userId": "demo-user-001",
"userTier": "GOLD",
"country": "IN",
"lifetimeSpend": 15000,
"ordersPlaced": 10
},
"cart": {
"items": [
{
"productId": "p1",
"category": "electronics",
"unitPrice": 3000,
"quantity": 1
},
{
"productId": "p2",
"category": "fashion",
"unitPrice": 500,
"quantity": 2
}
]
}
}


Example response (shape):

{
"message": "Best coupon found",
"bestCoupon": {
"code": "BIGSPENDER",
"description": "₹500 off for high spenders",
"discountType": "FLAT",
"discountValue": 500,
"maxDiscountAmount": null,
"validUntil": "2025-12-31T00:00:00.000Z"
},
"discount": 500,
"savingsPercentage": "14.29%",
"cartValue": 3500,
"finalAmount": 3000,
"youSave": "₹500",
"applicableCouponsCount": 3,
"allApplicableCoupons": [
{
"code": "BIGSPENDER",
"description": "₹500 off for high spenders",
"discount": 500,
"savings": "14.29%"
}
]
}


---

### 3. Apply Coupon

#### Apply Specific Coupon and Track Usage  
**POST** `/api/apply-coupon`

Request body:

{
"user": {
"userId": "demo-user-001",
"userTier": "GOLD",
"country": "IN",
"lifetimeSpend": 15000,
"ordersPlaced": 10
},
"cart": {
"items": [
{
"productId": "p1",
"category": "electronics",
"unitPrice": 3000,
"quantity": 1
}
]
},
"couponCode": "GOLD20"
}


Response (shape):

{
"success": true,
"message": "Coupon applied successfully!",
"appliedCoupon": {
"code": "GOLD20",
"description": "20% off for Gold tier users"
},
"discount": 500,
"cartValue": 3000,
"finalAmount": 2500,
"youSaved": "₹500",
"savingsPercentage": "16.67%",
"usageInfo": {
"timesUsed": 1,
"remainingUses": "unlimited"
}
}


---

### 4. Analytics

#### System-wide Coupon Analytics  
**GET** `/api/analytics/coupons`

Returns:

- totalCoupons, activeCoupons, upcomingCoupons, expiredCoupons
- Number of FLAT vs PERCENT coupons
- Distribution by user tiers
- Category-wise coupon counts
- Most generous coupon
- List of active coupons with days until expiry

#### Single Coupon Analytics  
**GET** `/api/analytics/coupon/:code`

Returns:

- Status: Active / Upcoming / Expired
- Discount details (type, value, max cap)
- Timeline (start, end, days remaining, percentage elapsed)
- Eligibility criteria
- Usage limit per user

---

## Eligibility Rules Supported

User-based:

- `allowedUserTiers` (e.g., `["NEW", "REGULAR", "GOLD"]`)
- `minLifetimeSpend`
- `minOrdersPlaced`
- `firstOrderOnly`
- `allowedCountries` (e.g., `["IN", "US"]`)

Cart-based:

- `minCartValue`
- `applicableCategories` (at least one item in these categories)
- `excludedCategories` (none of these categories allowed)
- `minItemsCount` (total quantity across items)

---

## AI Usage Note

This project was built with assistance from Perplexity AI. AI was used for:

- Designing the project structure and endpoints
- Generating boilerplate Express.js code
- Implementing coupon eligibility and best-coupon selection logic
- Drafting this README

All AI-generated code and text were reviewed, tested, and adapted to meet the assignment requirements.

---

## Assignment Info

- Assignment: **Coupon Management** (Backend API)  
- Role: Software Developer  
- Deliverables: GitHub repo + live deployment URL + this README