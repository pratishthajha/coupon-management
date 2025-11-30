const demoUser = {
  email: 'hire-me@anshumat.org',
  password: 'HireMe@2025!',
  userId: 'demo-user-001',
  userTier: 'GOLD',
  country: 'IN',
  lifetimeSpend: 15000,
  ordersPlaced: 10
};

const userCouponUsage = {};

function getUserCouponUsage(userId, couponCode) {
  const key = `${userId}_${couponCode}`;
  return userCouponUsage[key] || 0;
}

function incrementCouponUsage(userId, couponCode) {
  const key = `${userId}_${couponCode}`;
  userCouponUsage[key] = (userCouponUsage[key] || 0) + 1;
  return userCouponUsage[key];
}

function resetUsageData() {
  Object.keys(userCouponUsage).forEach(key => delete userCouponUsage[key]);
}

module.exports = {
  demoUser,
  getUserCouponUsage,
  incrementCouponUsage,
  resetUsageData
};