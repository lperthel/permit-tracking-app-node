// ============================================================================
// api-actions.ts - All CRUD API operations (create, delete, etc.)
// ============================================================================

import { PermitStatus } from '../../../src/app/permits/shared/models/permit-status.enums';
import { Permit } from '../../../src/app/permits/shared/models/permit.model';
import { dev_env } from '../../../src/environments/environment';
import {
  PermitFixtureKeys,
  PermitFixtures,
} from '../../fixtures/permits/permit-fixtures';

export class ApiActions {
  /**
   * Creates a permit via API for test setup
   * @param permit - Permit data to create
   * @returns Promise resolving to permit ID
   */
  static createPermit(permit: Partial<Permit>): Cypress.Chainable<string> {
    const defaultPermit: Partial<Permit> = {
      permitName: 'Test Permit',
      applicantName: 'Test Applicant',
      permitType: 'Construction',
      status: PermitStatus.PENDING,
      ...permit,
    };

    return cy
      .request({
        method: 'POST',
        url: `${dev_env.apiUrl}/permits`,
        body: defaultPermit,
        headers: { 'Content-Type': 'application/json' },
      })
      .then((response) => {
        expect(response.status).to.eq(201);
        return response.body.id;
      });
  }

  /**
   * Creates a permit using fixture data
   */
  static createPermitFromFixture(
    fixtureName: PermitFixtureKeys
  ): Cypress.Chainable<string> {
    return PermitFixtures.getValidPermit(fixtureName).then((permit) => {
      return this.createPermit(permit);
    });
  }

  /**
   * Updates a permit via API
   * @param permitId - ID of permit to update
   * @param permitData - Updated permit data
   * @returns Promise resolving to updated permit
   */
  static updatePermit(
    permitId: string,
    permitData: Partial<Permit>
  ): Cypress.Chainable<Permit> {
    return cy
      .request({
        method: 'PUT',
        url: `${dev_env.apiUrl}/permits/${permitId}`,
        body: permitData,
        headers: { 'Content-Type': 'application/json' },
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        return response.body;
      });
  }

  /**
   * Updates a permit using fixture data
   */
  static updatePermitFromFixture(
    permitId: string,
    fixtureName: PermitFixtureKeys
  ): Cypress.Chainable<Permit> {
    return PermitFixtures.getValidPermit(fixtureName).then((permit) => {
      return this.updatePermit(permitId, permit);
    });
  }

  /**
   * Gets a permit by ID via API
   * @param permitId - ID of permit to retrieve
   * @returns Promise resolving to permit data
   */
  static getPermit(permitId: string): Cypress.Chainable<Permit> {
    return cy
      .request({
        method: 'GET',
        url: `${dev_env.apiUrl}/permits/${permitId}`,
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        return response.body;
      });
  }

  /**
   * Verifies a permit exists in the database
   * @param permitId - ID of permit to verify
   * @returns Promise resolving to true if permit exists
   */
  static verifyPermitExists(permitId: string): Cypress.Chainable<boolean> {
    return cy
      .request({
        method: 'GET',
        url: `${dev_env.apiUrl}/permits/${permitId}`,
        failOnStatusCode: false,
      })
      .then((response) => {
        return response.status === 200;
      });
  }

  /**
   * Verifies a permit does not exist in the database (returns 404)
   * @param permitId - ID of permit to verify deletion
   * @returns Promise resolving to true if permit is deleted
   */
  static verifyPermitDeleted(permitId: string): Cypress.Chainable<boolean> {
    return cy
      .request({
        method: 'GET',
        url: `${dev_env.apiUrl}/permits/${permitId}`,
        failOnStatusCode: false,
      })
      .then((response) => {
        return response.status === 404;
      });
  }

  /**
   * Deletes a permit by ID for test cleanup
   */
  static deletePermit(permitId: string): Cypress.Chainable<any> {
    return cy.request({
      method: 'DELETE',
      url: `${dev_env.apiUrl}/permits/${permitId}`,
      failOnStatusCode: false,
    });
  }

  /**
   * Performance optimization: Batch create permits
   * Creates multiple permits in parallel for faster test setup
   */
  static batchCreatePermits(fixtures: PermitFixtureKeys[]): Cypress.Chainable<string[]> {
    const permitPromises = fixtures.map(fixture => 
      this.createPermitFromFixture(fixture)
    );
    
    return cy.wrap(Promise.all(permitPromises));
  }

  /**
   * Performance optimization: Batch delete permits
   * Deletes multiple permits in parallel for faster cleanup
   */
  static batchDeletePermits(permitIds: string[]): Cypress.Chainable<void> {
    permitIds.forEach(permitId => {
      if (permitId) {
        this.deletePermit(permitId);
      }
    });
    return cy.wrap(null);
  }
}
