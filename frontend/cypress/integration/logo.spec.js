describe('Logo Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays logo correctly on desktop', () => {
    cy.viewport(1920, 1080);
    cy.get('.app-logo').should('be.visible');
    cy.get('.app-name').should('be.visible');
  });

  it('displays logo correctly on tablet', () => {
    cy.viewport(768, 1024);
    cy.get('.app-logo').should('be.visible');
    cy.get('.app-name').should('be.visible');
  });

  it('displays logo correctly on mobile', () => {
    cy.viewport(375, 667);
    cy.get('.app-logo').should('be.visible');
    cy.get('.app-name').should('not.be.visible');
  });

  it('logo has correct dimensions', () => {
    cy.get('.app-logo').should(($logo) => {
      const rect = $logo[0].getBoundingClientRect();
      expect(rect.height).to.be.closeTo(40, 1);
    });
  });

  it('logo scales on hover', () => {
    cy.get('.app-logo')
      .trigger('mouseover')
      .should('have.css', 'transform', 'matrix(1.05, 0, 0, 1.05, 0, 0)');
  });
}); 