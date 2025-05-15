describe('Application Homepage', () => {
  it('should load the homepage and display a welcome message or key element', () => {
    cy.visit('/');
    // Adjust the selector and text based on your actual homepage content
    // For example, if you have an H1 with the app name:
    // cy.get('h1').contains('SonoSphere');

    // Or check for a more generic element that should be present:
    cy.get('body').should('be.visible');

    // Example for checking if the main layout header is present
    // Assuming your header has a specific data-cy attribute or a unique class/tag
    // cy.get('[data-cy="app-header"]').should('be.visible');

    // For now, a very basic check:
    cy.title().should('include', 'SonoSphere'); // Assuming page title is set
  });

  it('should navigate to the collection page if a link exists', () => {
    cy.visit('/');
    // Example: cy.get('a[href="/collection"]').click();
    // cy.url().should('include', '/collection');
    // cy.get('h1').contains('My Collection'); // Adjust based on actual collection page content
    cy.log('Placeholder test for navigation to collection page.')
  })
}); 