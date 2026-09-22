// cypress/e2e/ui/navigation.cy.js
// Additional UI tests with team and category annotations

describe('[platform] Navigation Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to Actions page [C1010][smoke]', () => {
    cy.contains('a', 'Actions').click({ force: true });
    cy.url().should('include', '/commands/actions');
  });

  it('should have navigation menu [C1011][sanity]', () => {
    cy.get('nav, .navbar, header').should('exist');
  });
});

describe('[unicorns] User Experience Tests', () => {
  it('should load page within acceptable time [TC-2001][performance]', () => {
    const startTime = Date.now();
    cy.visit('/');
    const loadTime = Date.now() - startTime;
    expect(loadTime).to.be.lessThan(5000);
  });

  it('should have accessible heading structure [C1012][accessibility]', () => {
    cy.visit('/');
    cy.get('h1').should('have.length.greaterThan', 0);
  });
});
