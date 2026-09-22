// cypress/e2e/ui/homepage.cy.js
// UI tests demonstrating qa-shadow-report annotations

describe('[billing] Homepage UI Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the homepage title [C1001][smoke]', () => {
    cy.get('h1').should('contain', 'Kitchen Sink');
  });

  it('should navigate to Querying section [C1002][regression]', () => {
    cy.contains('a', 'Querying').click({ force: true });
    cy.url().should('include', '/commands/querying');
    cy.get('h1').should('contain', 'Querying');
  });

  it('should have working navigation links [C1003][smoke]', () => {
    cy.get('nav, .navbar, header').should('be.visible');
    cy.contains('Commands').should('be.visible');
  });
});

describe('[platform] Responsive Design Tests', () => {
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 1280, height: 720, name: 'desktop' },
  ];

  viewports.forEach((viewport) => {
    it(`should render correctly on ${viewport.name} [C1004][usability]`, () => {
      cy.viewport(viewport.width, viewport.height);
      cy.visit('/');
      cy.get('h1').should('be.visible');
    });
  });
});
