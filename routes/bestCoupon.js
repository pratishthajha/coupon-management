const express = require('express');
const router = express.Router();
const { getCoupons } = require('./coupons');
const { getUserCouponUsage, incrementCouponUsage } = require('../models/User');
const { checkEligibility } = require('../utils/eligibility');
const { calculateDiscount } = require('../utils/discount');

router.post('/best-coupon', (req, res) => {
  try {
    const { user, cart } = req.body;

    if (!user || !user.userId) {
      return res.status(400).json({ error: 'Invalid input. Required: user with userId' });
    }

    if (!cart || !cart.items || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ error: 'Invalid input. Required: cart with items array' });
    }

    const allCoupons = getCoupons();
    const now = new Date();

    const eligibleCoupons = allCoupons.filter(coupon => {
      if (coupon.startDate > now || coupon.endDate < now) return false;

      if (coupon.usageLimitPerUser) {
        const usageCount = getUserCouponUsage(user.userId, coupon.code);
        if (usageCount >= coupon.usageLimitPerUser) return false;
      }

      return checkEligibility(coupon, user, cart);
    });

    const cartValue = calculateCartValue(cart);

    if (eligibleCoupons.length === 0) {
      return res.json({ 
        message: 'No applicable coupons found',
        bestCoupon: null,
        discount: 0,
        cartValue: cartValue,
        finalAmount: cartValue,
        applicableCouponsCount: 0,
        allCoupons: []
      });
    }

    const couponsWithDiscount = eligibleCoupons.map(coupon => ({
      coupon,
      discount: calculateDiscount(coupon, cart),
      savingsPercentage: ((calculateDiscount(coupon, cart) / cartValue) * 100).toFixed(2)
    }));

    couponsWithDiscount.sort((a, b) => {
      if (b.discount !== a.discount) return b.discount - a.discount;
      if (a.coupon.endDate.getTime() !== b.coupon.endDate.getTime()) {
        return a.coupon.endDate.getTime() - b.coupon.endDate.getTime();
      }
      return a.coupon.code.localeCompare(b.coupon.code);
    });

    const best = couponsWithDiscount[0];

    res.json({
      message: 'Best coupon found',
      bestCoupon: {
        code: best.coupon.code,
        description: best.coupon.description,
        discountType: best.coupon.discountType,
        discountValue: best.coupon.discountValue,
        maxDiscountAmount: best.coupon.maxDiscountAmount,
        validUntil: best.coupon.endDate
      },
      discount: best.discount,
      savingsPercentage: best.savingsPercentage + '%',
      cartValue: cartValue,
      finalAmount: cartValue - best.discount,
      youSave: '₹' + best.discount,
      applicableCouponsCount: eligibleCoupons.length,
      allApplicableCoupons: couponsWithDiscount.map(c => ({
        code: c.coupon.code,
        description: c.coupon.description,
        discount: c.discount,
        savings: c.savingsPercentage + '%'
      }))
    });

  } catch (error) {
    console.error('Error in best-coupon:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.post('/apply-coupon', (req, res) => {
  try {
    const { user, cart, couponCode } = req.body;

    if (!user || !user.userId) {
      return res.status(400).json({ error: 'User with userId is required' });
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart with items is required' });
    }

    if (!couponCode) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const allCoupons = getCoupons();
    const coupon = allCoupons.find(c => c.code === couponCode);

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    const now = new Date();

    if (coupon.startDate > now || coupon.endDate < now) {
      return res.status(400).json({ 
        error: 'Coupon is not valid at this time',
        validFrom: coupon.startDate,
        validUntil: coupon.endDate
      });
    }

    if (coupon.usageLimitPerUser) {
      const usageCount = getUserCouponUsage(user.userId, coupon.code);
      if (usageCount >= coupon.usageLimitPerUser) {
        return res.status(400).json({ 
          error: 'You have already used this coupon maximum times',
          usageLimit: coupon.usageLimitPerUser
        });
      }
    }

    if (!checkEligibility(coupon, user, cart)) {
      return res.status(400).json({ 
        error: 'You are not eligible for this coupon',
        hint: 'Check user tier, cart value, or product categories'
      });
    }

    const cartValue = calculateCartValue(cart);
    const discount = calculateDiscount(coupon, cart);

    incrementCouponUsage(user.userId, coupon.code);
    const newUsageCount = getUserCouponUsage(user.userId, coupon.code);

    res.json({
      success: true,
      message: 'Coupon applied successfully!',
      appliedCoupon: {
        code: coupon.code,
        description: coupon.description
      },
      discount: discount,
      cartValue: cartValue,
      finalAmount: cartValue - discount,
      youSaved: '₹' + discount,
      savingsPercentage: ((discount / cartValue) * 100).toFixed(2) + '%',
      usageInfo: {
        timesUsed: newUsageCount,
        remainingUses: coupon.usageLimitPerUser ? coupon.usageLimitPerUser - newUsageCount : 'unlimited'
      }
    });

  } catch (error) {
    console.error('Error in apply-coupon:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

function calculateCartValue(cart) {
  return cart.items.reduce((total, item) => {
    return total + (item.unitPrice * item.quantity);
  }, 0);
}

module.exports = router;