const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

let coupons = [];

const seedCoupons = [
  {
    code: "WELCOME100",
    description: "₹100 off for new users on first order",
    discountType: "FLAT",
    discountValue: 100,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    usageLimitPerUser: 1,
    eligibility: { firstOrderOnly: true, minCartValue: 500 }
  },
  {
    code: "GOLD20",
    description: "20% off for Gold tier users",
    discountType: "PERCENT",
    discountValue: 20,
    maxDiscountAmount: 500,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    eligibility: { allowedUserTiers: ["GOLD"], minCartValue: 1000 }
  },
  {
    code: "ELECTRONICS15",
    description: "15% off on electronics",
    discountType: "PERCENT",
    discountValue: 15,
    maxDiscountAmount: 300,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    eligibility: { applicableCategories: ["electronics"], minCartValue: 2000 }
  },
  {
    code: "BIGSPENDER",
    description: "₹500 off for high spenders",
    discountType: "FLAT",
    discountValue: 500,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    eligibility: { minLifetimeSpend: 10000, minOrdersPlaced: 5, minCartValue: 3000 }
  },
  {
    code: "FASHION25",
    description: "25% off on fashion items",
    discountType: "PERCENT",
    discountValue: 25,
    maxDiscountAmount: 400,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    eligibility: { applicableCategories: ["fashion"], minItemsCount: 2 }
  },
  {
    code: "REGULAR10",
    description: "₹10 off for regular customers",
    discountType: "FLAT",
    discountValue: 10,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    eligibility: { allowedUserTiers: ["REGULAR", "GOLD"], minCartValue: 300 }
  },
  {
    code: "MEGA50",
    description: "50% off mega sale (max ₹1000)",
    discountType: "PERCENT",
    discountValue: 50,
    maxDiscountAmount: 1000,
    startDate: "2025-01-01",
    endDate: "2025-03-31",
    eligibility: { minCartValue: 5000, minItemsCount: 3 }
  },
  {
    code: "BULKBUY200",
    description: "₹200 off on bulk purchases",
    discountType: "FLAT",
    discountValue: 200,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    eligibility: { minItemsCount: 5, minCartValue: 2000 }
  },
  {
    code: "VIPSALE30",
    description: "30% off VIP exclusive",
    discountType: "PERCENT",
    discountValue: 30,
    maxDiscountAmount: 800,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    eligibility: { allowedUserTiers: ["GOLD"], minLifetimeSpend: 20000, minCartValue: 3000 }
  },
  {
    code: "SAVE5",
    description: "₹5 off on any purchase",
    discountType: "FLAT",
    discountValue: 5,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    eligibility: { minCartValue: 100 }
  }
];

seedCoupons.forEach(couponData => {
  try {
    const coupon = new Coupon(couponData);
    coupon.validate();
    coupons.push(coupon);
  } catch (error) {
    console.error(`Failed to load seed coupon ${couponData.code}:`, error.message);
  }
});

console.log(`✅ Loaded ${coupons.length} seed coupons`);

router.post('/coupons', (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    coupon.validate();

    const existingCoupon = coupons.find(c => c.code === coupon.code);
    if (existingCoupon) {
      return res.status(400).json({ 
        error: 'Coupon code already exists',
        code: coupon.code,
        suggestion: 'Try a different code'
      });
    }

    coupons.push(coupon);
    res.status(201).json({ 
      message: 'Coupon created successfully', 
      coupon,
      totalCoupons: coupons.length
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/coupons', (req, res) => {
  try {
    const { status, discountType, userTier } = req.query;
    let filteredCoupons = [...coupons];
    const now = new Date();

    if (status) {
      if (status === 'active') {
        filteredCoupons = filteredCoupons.filter(c => c.startDate <= now && c.endDate >= now);
      } else if (status === 'upcoming') {
        filteredCoupons = filteredCoupons.filter(c => c.startDate > now);
      } else if (status === 'expired') {
        filteredCoupons = filteredCoupons.filter(c => c.endDate < now);
      }
    }

    if (discountType) {
      filteredCoupons = filteredCoupons.filter(c => c.discountType === discountType.toUpperCase());
    }

    if (userTier) {
      filteredCoupons = filteredCoupons.filter(c => 
        !c.eligibility?.allowedUserTiers || 
        c.eligibility.allowedUserTiers.includes(userTier.toUpperCase())
      );
    }

    res.json({ 
      total: filteredCoupons.length,
      filters: { status, discountType, userTier },
      coupons: filteredCoupons
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/coupons/:code', (req, res) => {
  const coupon = coupons.find(c => c.code === req.params.code);
  if (!coupon) {
    return res.status(404).json({ 
      error: 'Coupon not found',
      availableCodes: coupons.map(c => c.code)
    });
  }
  res.json(coupon);
});

router.delete('/coupons/:code', (req, res) => {
  const index = coupons.findIndex(c => c.code === req.params.code);
  if (index === -1) {
    return res.status(404).json({ error: 'Coupon not found' });
  }
  const deleted = coupons.splice(index, 1)[0];
  res.json({ 
    message: 'Coupon deleted successfully',
    deletedCoupon: deleted.code,
    remainingCoupons: coupons.length
  });
});

module.exports = router;
module.exports.getCoupons = () => coupons;
module.exports.setCoupons = (newCoupons) => { coupons = newCoupons; };
