function checkEligibility(coupon, user, cart) {
  const { eligibility } = coupon;

  if (!eligibility || Object.keys(eligibility).length === 0) {
    return true;
  }

  if (eligibility.allowedUserTiers && eligibility.allowedUserTiers.length > 0) {
    if (!user.userTier || !eligibility.allowedUserTiers.includes(user.userTier)) {
      return false;
    }
  }

  if (eligibility.minLifetimeSpend !== undefined && eligibility.minLifetimeSpend !== null) {
    if (!user.lifetimeSpend || user.lifetimeSpend < eligibility.minLifetimeSpend) {
      return false;
    }
  }

  if (eligibility.minOrdersPlaced !== undefined && eligibility.minOrdersPlaced !== null) {
    if (user.ordersPlaced === undefined || user.ordersPlaced < eligibility.minOrdersPlaced) {
      return false;
    }
  }

  if (eligibility.firstOrderOnly === true) {
    if (user.ordersPlaced === undefined || user.ordersPlaced > 0) {
      return false;
    }
  }

  if (eligibility.allowedCountries && eligibility.allowedCountries.length > 0) {
    if (!user.country || !eligibility.allowedCountries.includes(user.country)) {
      return false;
    }
  }

  const cartValue = calculateCartValue(cart);
  const categories = cart.items.map(item => item.category);
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  if (eligibility.minCartValue !== undefined && eligibility.minCartValue !== null) {
    if (cartValue < eligibility.minCartValue) {
      return false;
    }
  }

  if (eligibility.applicableCategories && eligibility.applicableCategories.length > 0) {
    const hasApplicableCategory = eligibility.applicableCategories.some(cat => 
      categories.includes(cat)
    );
    if (!hasApplicableCategory) {
      return false;
    }
  }

  if (eligibility.excludedCategories && eligibility.excludedCategories.length > 0) {
    const hasExcludedCategory = eligibility.excludedCategories.some(cat => 
      categories.includes(cat)
    );
    if (hasExcludedCategory) {
      return false;
    }
  }

  if (eligibility.minItemsCount !== undefined && eligibility.minItemsCount !== null) {
    if (totalItems < eligibility.minItemsCount) {
      return false;
    }
  }

  return true;
}

function calculateCartValue(cart) {
  if (!cart || !cart.items || cart.items.length === 0) {
    return 0;
  }

  return cart.items.reduce((total, item) => {
    return total + (item.unitPrice * item.quantity);
  }, 0);
}

module.exports = {
  checkEligibility,
  calculateCartValue
};