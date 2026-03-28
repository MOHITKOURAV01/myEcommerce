describe('Checkout & Orders E2E Tests', () => {
    beforeEach(() => {
        cy.login('test@example.com', 'password123'); // Custom command in support/commands.js
    });

    it('Full COD flow: login → add book → proceed → address → cod → order → success page', () => {
        cy.visit('/home');
        cy.get('.book-card').first().find('.add-to-cart-btn').click();
        cy.get('.cart-icon').click();
        cy.get('button').contains('Checkout').click();
        
        // Step 1: Address
        cy.get('input[name="fullName"]').type('John Doe');
        cy.get('input[name="phone"]').type('9876543210');
        cy.get('input[name="line1"]').type('123 Green Street');
        cy.get('input[name="city"]').type('Mumbai');
        cy.get('input[name="pincode"]').type('400001');
        cy.get('button').contains('Continue to Payment').click();

        // Step 2: Payment
        cy.contains('Cash on Delivery').click();
        cy.get('button').contains('Review Order').click();

        // Step 3: Review
        cy.get('button').contains('Place Order').click();

        // Success
        cy.url().should('include', '/order-success');
        cy.contains('BSM-').should('be.visible');
    });

    it('Order appears in /orders list', () => {
        cy.visit('/profile');
        cy.get('.tab').contains('Orders').click();
        cy.get('.order-list').should('not.be.empty');
        cy.get('.order-number').first().should('contain', 'BSM-');
    });

    it('Invalid coupon shows error in cart', () => {
        cy.visit('/home');
        cy.get('.book-card').first().find('.add-to-cart-btn').click();
        cy.get('.cart-icon').click();
        cy.get('input[placeholder*="Coupon"]').type('INVALIDCOUPON');
        cy.get('button').contains('Apply').click();
        cy.contains('Invalid coupon').should('be.visible');
    });
});
