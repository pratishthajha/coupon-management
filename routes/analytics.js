const express = require('express');
const router = express.Router();
const { getCoupons } = require('./coupons');

router.get('/analytics/coupons', (req, res) => {
  try {
    const allCoupons = getCoupons();
    const now = new Date();

    const active = allCoupons.filter(c => c.startDate <= now && c.endDate >= now);
    const upcoming = allCoupons.filter(c => c.startDate > now);
    const expired = allCoupons.filter(c => c.endDate < now);

    const flatCoupons = allCoupons.filter(c => c.discountType === 'FLAT');
    const percentCoupons = allCoupons.filter(c => c.discountType === 'PERCENT');

    const totalMaxSavings = allCoupons.reduce((sum, c) => {
      if (c.discountType === 'FLAT') return sum + c.discountValue;
      if (c.maxDiscountAmount) return sum + c.maxDiscountAmount;
      return sum;
    }, 0);

    const tierCoupons = {
      NEW: allCoupons.filter(c => c.eligibility?.allowedUserTiers?.includes('NEW')).length,
      REGULAR: allCoupons.filter(c => c.eligibility?.allowedUserTiers?.includes('REGULAR')).length,
      GOLD: allCoupons.filter(c => c.eligibility?.allowedUserTiers?.includes('GOLD')).length,
      ALL: allCoupons.filter(c => !c.eligibility?.allowedUserTiers || c.eligibility.allowedUserTiers.length === 0).length
    };

    const categoryCoupons = {};
    allCoupons.forEach(c => {
      if (c.eligibility?.applicableCategories) {
        c.eligibility.applicableCategories.forEach(cat => {
          categoryCoupons[cat] = (categoryCoupons[cat] || 0) + 1;
        });
      }
    });

    const mostGenerousCoupon = allCoupons.reduce((best, current) => {
      const currentValue = current.discountType === 'FLAT' 
        ? current.discountValue 
        : current.maxDiscountAmount || 0;
      const bestValue = best.discountType === 'FLAT' 
        ? best.discountValue 
        : best.maxDiscountAmount || 0;
      return currentValue > bestValue ? current : best;
    }, allCoupons[0]);

    res.json({
      summary: {
        totalCoupons: allCoupons.length,
        activeCoupons: active.length,
        upcomingCoupons: upcoming.length,
        expiredCoupons: expired.length
      },
      discountTypes: {
        FLAT: flatCoupons.length,
        PERCENT: percentCoupons.length
      },
      userTierDistribution: tierCoupons,
      categorySpecific: categoryCoupons,
      potentialMaxSavings: '₹' + totalMaxSavings,
      mostGenerousCoupon: {
        code: mostGenerousCoupon.code,
        description: mostGenerousCoupon.description,
        maxDiscount: mostGenerousCoupon.discountType === 'FLAT' 
          ? '₹' + mostGenerousCoupon.discountValue 
          : mostGenerousCoupon.discountValue + '% (capped at ₹' + mostGenerousCoupon.maxDiscountAmount + ')'
      },
      activeCouponsList: active.map(c => ({
        code: c.code,
        description: c.description,
        expiresIn: Math.ceil((c.endDate - now) / (1000 * 60 * 60 * 24)) + ' days'
      }))
    });

  } catch (error) {
    res.status(500).json({ error: 'Error fetching analytics', details: error.message });
  }
});

router.get('/analytics/coupon/:code', (req, res) => {
  try {
    const allCoupons = getCoupons();
    const coupon = allCoupons.find(c => c.code === req.params.code);

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    const now = new Date();
    const daysRemaining = Math.ceil((coupon.endDate - now) / (1000 * 60 * 60 * 24));
    const totalDuration = Math.ceil((coupon.endDate - coupon.startDate) / (1000 * 60 * 60 * 24));
    const daysElapsed = totalDuration - daysRemaining;

    const status = coupon.endDate < now ? 'Expired' 
      : coupon.startDate > now ? 'Upcoming' 
      : 'Active';

    res.json({
      code: coupon.code,
      description: coupon.description,
      status: status,
      discountInfo: {
        type: coupon.discountType,
        value: coupon.discountValue,
        maxCap: coupon.maxDiscountAmount || 'No cap'
      },
      timeline: {
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        daysRemaining: status === 'Active' ? daysRemaining : 0,
        totalDuration: totalDuration + ' days',
        percentageElapsed: ((daysElapsed / totalDuration) * 100).toFixed(1) + '%'
      },
      eligibilityCriteria: coupon.eligibility || 'No restrictions - applies to everyone',
      usageLimit: coupon.usageLimitPerUser || 'Unlimited'
    });

  } catch (error) {
    res.status(500).json({ error: 'Error fetching coupon analytics', details: error.message });
  }
});

module.exports = router;