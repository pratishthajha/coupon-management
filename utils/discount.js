const { calculateCartValue } = require('./eligibility');

function calculateDiscount(coupon, cart) {
  const cartValue = calculateCartValue(cart);
  let discount = 0;

  if (coupon.discountType === 'FLAT') {
    discount = coupon.discountValue;
  } 
  else if (coupon.discountType === 'PERCENT') {
    discount = (cartValue * coupon.discountValue) / 100;

    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  }

  return Math.min(discount, cartValue);
}

module.exports = {
  calculateDiscount
};
