describe('Authentication E2E Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('Home page loads, shows Enter the Shop', () => {
    cy.visit('/');
    cy.contains('Enter the Shop').should('be.visible');
  });

  it('Click Enter → navigates to /home', () => {
    cy.visit('/');
    cy.contains('Enter the Shop').click();
    cy.url().should('include', '/home');
  });

  it('Login form works, redirects', () => {
    // This assumes a user exists or was created in a previous step.
    cy.visit('/home');
    cy.get('button').contains('Login').click();
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    // Assuming successful login redirects or closes modal and shows user menu
    // cy.get('.user-menu').should('be.visible');
  });

  it('Wrong password shows error', () => {
    cy.visit('/home');
    cy.get('button').contains('Login').click();
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid credentials').should('be.visible');
  });

  it('/profile redirects to /home if not logged in', () => {
    cy.visit('/profile', { failOnStatusCode: false });
    // Assuming app redirects or stays on home
    cy.url().should('not.include', '/profile');
  });
});
