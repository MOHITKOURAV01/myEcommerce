Cypress.Commands.add('login', (email, password) => {
  cy.request('POST', `${Cypress.env('apiUrl')}/api/auth/login`, {
    email,
    password,
  }).then((response) => {
    window.localStorage.setItem('user', JSON.stringify(response.body.data.user));
    window.localStorage.setItem('accessToken', response.body.data.accessToken);
  });
});

Cypress.Commands.add('addToCart', (bookSlug) => {
  cy.visit(`/book/${bookSlug}`);
  cy.get('button').contains('Add to Cart').click();
});

Cypress.Commands.add('clearTestData', () => {
    // This would ideally call a test-only endpoint to reset the DB
    // cy.request('POST', `${Cypress.env('apiUrl')}/api/test/reset`);
});
