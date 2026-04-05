const { calcCartTotals } = require('../../controllers/cartController');

describe('Cart Unit Tests', () => {

    it('calcCartTotals: correct subtotal', () => {
        const items = [
            { price: 100, quantity: 2 },
            { price: 50, quantity: 1 }
        ];
        const totals = calcCartTotals(items);
        expect(totals.subtotal).toBe(250);
    });

    it('free shipping when subtotal >= 500', () => {
        const items = [{ price: 500, quantity: 1 }];
        const totals = calcCartTotals(items);
        expect(totals.shipping).toBe(0);
    });

    it('₹49 shipping when subtotal < 500', () => {
        const items = [{ price: 499, quantity: 1 }];
        const totals = calcCartTotals(items);
        expect(totals.shipping).toBe(49);
    });

    it('tax = 18% of (subtotal - discount)', () => {
        const items = [{ price: 1000, quantity: 1 }];
        const totals = calcCartTotals(items);
        // subtotal: 1000, discount: 0
        expect(totals.tax).toBe(180);
    });

    it('percent coupon applies correctly', () => {
        const items = [{ price: 1000, quantity: 1 }];
        const coupon = { minOrderValue: 500, type: 'percent', value: 10 };
        const totals = calcCartTotals(items, coupon);
        expect(totals.couponDiscount).toBe(100);
        // Tax matches correctly
        expect(totals.tax).toBe(Math.round((1000 - 100) * 0.18));
    });

    it('fixed coupon applies correctly', () => {
        const items = [{ price: 1000, quantity: 1 }];
        const coupon = { minOrderValue: 500, type: 'fixed', value: 150 };
        const totals = calcCartTotals(items, coupon);
        expect(totals.couponDiscount).toBe(150);
    });

    it('coupon capped at maxDiscount', () => {
        const items = [{ price: 2000, quantity: 1 }];
        const coupon = { minOrderValue: 500, type: 'percent', value: 50, maxDiscount: 300 };
        // 50% of 2000 is 1000, but cap is 300
        const totals = calcCartTotals(items, coupon);
        expect(totals.couponDiscount).toBe(300);
    });

    it('coupon discount not > subtotal', () => {
        const items = [{ price: 100, quantity: 1 }];
        const coupon = { minOrderValue: 0, type: 'fixed', value: 500 };
        const totals = calcCartTotals(items, coupon);
        expect(totals.couponDiscount).toBe(100);
    });

});

