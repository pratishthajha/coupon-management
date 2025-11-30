class Coupon {
  constructor(data) {
    this.code = data.code;
    this.description = data.description;
    this.discountType = data.discountType;
    this.discountValue = data.discountValue;
    this.maxDiscountAmount = data.maxDiscountAmount || null;
    this.startDate = new Date(data.startDate);
    this.endDate = new Date(data.endDate);
    this.usageLimitPerUser = data.usageLimitPerUser || null;
    this.eligibility = data.eligibility || {};
    this.createdAt = new Date();
  }

  validate() {
    if (!this.code || !this.description || !this.discountType || !this.discountValue) {
      throw new Error('Missing required fields: code, description, discountType, discountValue');
    }

    if (!['FLAT', 'PERCENT'].includes(this.discountType)) {
      throw new Error('discountType must be FLAT or PERCENT');
    }

    if (this.discountValue <= 0) {
      throw new Error('discountValue must be positive');
    }

    if (this.discountType === 'PERCENT' && this.discountValue > 100) {
      throw new Error('Percent discount cannot exceed 100%');
    }

    if (this.startDate >= this.endDate) {
      throw new Error('startDate must be before endDate');
    }

    if (isNaN(this.startDate.getTime()) || isNaN(this.endDate.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD or ISO 8601 format');
    }

    return true;
  }
}

module.exports = Coupon;