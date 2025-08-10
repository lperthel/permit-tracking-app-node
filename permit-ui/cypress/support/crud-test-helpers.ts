import { PermitStatus } from '../../src/app/permits/shared/models/permit-status.enums';
import { Permit } from '../../src/app/permits/shared/models/permit.model';
import { dev_env } from '../../src/environments/environment';
import {
  createTestPermit,
  deleteTestPermit,
  goToPermitTablePage,
  verifyPermitInTable,
} from './permit_test_helpers';

// Environment configuration
const UI_SERVER = dev_env.uiUrl;

/**
 * Validates a specific row in the permit table
 * Uses the better verifyPermitInTable function from permit_test_helpers
 */
export function validateRow(
  index: number,
  permitName: string,
  applicantName: string,
  permitType: string,
  status: PermitStatus
) {
  const permit: Partial<Permit> = {
    permitName,
    applicantName,
    permitType,
    status,
  };
  verifyPermitInTable(permit, index);
}

/**
 * Validates that CRUD operations haven't left orphaned test data
 * This should be called in afterEach hooks to ensure test isolation
 */
export function validateCRUDCleanup() {
  cy.visit(UI_SERVER);
  cy.wait(1000);
  goToPermitTablePage('last');
  validateItemOnLastPage();
}

/**
 * Validates the expected item exists on the last page
 * Used for cleanup verification
 */

export function validateItemOnLastPage() {
  validateRow(
    0,
    'Handcrafted Granite Chicken',
    'Lorenzo Mante',
    'Zoning',
    PermitStatus.REJECTED
  );
}

/**
 * Validates the expected item exists on the first page
 * Used for pagination tests
 */
export function validateElementOnFirstPage() {
  validateRow(
    0,
    'First Page Permit',
    'First page permit with detailed information for initial validation testing.',
    'Construction',
    PermitStatus.PENDING
  );
}

/**
 * Deletes a permit via API using the permit ID from a table cell
 * Enhanced to use the existing deleteTestPermit helper
 */
export function deletePermitById(permitName: string) {
  cy.contains('td', permitName)
    .invoke('attr', 'data-id')
    .then((id) => {
      if (id) {
        deleteTestPermit(id as string);
      }
    });
}

/**
 * Creates a permit via API using the existing helper
 * Returns the permit ID for cleanup
 */
export function createPermitViaAPI(permit: Partial<Permit>) {
  return createTestPermit(permit);
}
