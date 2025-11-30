const express = require('express');
const cors = require('cors');
const couponRoutes = require('./routes/coupons');
const bestCouponRoute = require('./routes/bestCoupon');
const analyticsRoute = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Welcome route with ALL endpoints
app.get('/', (req, res) => {
  res.json({ 
    message: '🎉 Coupon Management API - Enhanced Edition',
    demoUser: {
      email: 'hire-me@anshumat.org',
      password: 'HireMe@2025!',
      userId: 'demo-user-001',
      userTier: 'GOLD',
      lifetimeSpend: 15000,
      ordersPlaced: 10
    },
    endpoints: {
      'Coupon Management': {
        'POST /api/coupons': 'Create a new coupon',
        'GET /api/coupons': 'List all coupons',
        'GET /api/coupons/:code': 'Get coupon by code',
        'DELETE /api/coupons/:code': 'Delete a coupon'
      },
      'Coupon Application': {
        'POST /api/best-coupon': 'Get best coupon for user and cart (shows ALL applicable)',
        'POST /api/apply-coupon': '✨ NEW: Apply specific coupon and track usage'
      },
      'Analytics & Insights': {
        'GET /api/analytics/coupons': '✨ NEW: System-wide coupon statistics',
        'GET /api/analytics/coupon/:code': '✨ NEW: Detailed analytics for specific coupon'
      }
    },
    features: [
      '✅ Smart best-coupon selection algorithm',
      '✅ Real-time usage tracking',
      '✅ Comprehensive analytics dashboard',
      '✅ Shows ALL applicable coupons with savings percentage',
      '✅ 10 pre-loaded seed coupons',
      '✅ Complex eligibility rules (user tier, cart value, categories, etc.)'
    ]
  });
});

// Mount routes
app.use('/api', couponRoutes);
app.use('/api', bestCouponRoute);
app.use('/api', analyticsRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    details: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: 'Visit http://localhost:' + PORT + ' for all endpoints'
  });
});

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 COUPON MANAGEMENT API - ENHANCED EDITION');
  console.log('='.repeat(60));
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
  console.log('\n📧 Demo User Credentials:');
  console.log('   Email: hire-me@anshumat.org');
  console.log('   Password: HireMe@2025!');
  console.log('\n✨ Enhanced Features:');
  console.log('   • Apply Coupon API with usage tracking');
  console.log('   • Real-time Analytics Dashboard');
  console.log('   • Shows ALL applicable coupons (not just best)');
  console.log('   • Savings percentage calculator');
  console.log('='.repeat(60) + '\n');
});

module.exports = app;