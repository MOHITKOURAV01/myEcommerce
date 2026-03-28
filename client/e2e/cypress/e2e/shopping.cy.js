describe('Shopping & Discovery E2E Tests', () => {
  it('Home page shows featured books section', () => {
    cy.visit('/home');
    cy.contains('Featured Books').should('be.visible');
    cy.get('.book-card').should('have.length.at.least', 1);
  });

  it('Search returns results and shows dropdown', () => {
    cy.visit('/home');
    cy.get('input[placeholder*="Search"]').type('Atomic');
    cy.get('.search-results').should('be.visible');
    cy.contains('Atomic Habits').should('be.visible');
  });

  it('Category filter on Discover works', () => {
    cy.visit('/discover');
    cy.contains('Self-Help').click();
    cy.get('.book-card').each(($el) => {
      cy.wrap($el).contains('Self-Help'); // Assuming the badge or category name is visible
    });
  });

  it('Book detail page loads with price and buttons', () => {
    cy.visit('/home');
    cy.get('.book-card').first().click();
    cy.get('.book-price').should('be.visible');
    cy.get('button').contains('Add to Cart').should('be.enabled');
  });

  it('Add to Cart shows count badge in navbar', () => {
    cy.visit('/home');
    cy.get('.book-card').first().find('.add-to-cart-btn').click();
    cy.get('.cart-badge').should('contain', '1');
  });

  it('Cart drawer opens on cart icon click', () => {
    cy.visit('/home');
    cy.get('.cart-icon').click();
    cy.get('.cart-drawer').should('be.visible');
  });
});
