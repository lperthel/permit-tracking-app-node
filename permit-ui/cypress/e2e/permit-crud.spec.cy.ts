import { v4 as uuidv4 } from 'uuid';
import { PERMIT_FORM_SELECTORS } from '../../src/app/assets/constants/permit-form.constants';
import { createThisPermit } from '../../src/app/assets/constants/test-permits';
import { PERMIT_FORM_HEADERS } from '../../src/app/permits/permit-form-model/permit-form-constants';
import { Permit } from '../../src/app/permits/shared/models/permit.model';
import { dev_env } from '../../src/environments/environment';
import {
  createPermitViaAPI,
  deletePermitById,
  validateCRUDCleanup,
  validateItemOnLastPage,
  validateRow,
} from '../support/crud-test-helpers';
import {
  clickNewPermitButton,
  clickSubmitButton,
  fillPermitForm,
} from '../support/cypress-form-actions';
import { getTestSelector, selectors } from '../support/cypress-selectors';
import { goToPermitTablePage } from '../support/permit_test_helpers';
import { PermitStatus } from '../../src/app/permits/shared/models/permit-status.enums';

// Environment configuration
const UI_SERVER = dev_env.uiUrl;

// Test data constants
const DELETE_TEST_PERMIT: Permit = {
  id: uuidv4(),
  permitName: 'New Permit',
  applicantName: 'Delete Me',
  permitType: 'Construction',
  status: PermitStatus.PENDING,
};

const UPDATE_TEST_PERMIT_BEFORE: Permit = {
  id: uuidv4(),
  permitName: 'Update this Permit',
  applicantName:
    'This is a Permit added by a cypress integration Test that needs to be updated',
  permitType: 'Construction',
  status: PermitStatus.PENDING,
};

const UPDATE_TEST_PERMIT_AFTER: Permit = {
  id: uuidv4(),
  permitName: 'Updated Permit',
  applicantName:
    'This is a Permit added by a cypress integration Test that has been updated',
  permitType: 'Renovation',
  status: PermitStatus.APPROVED,
};

describe('Permit CRUD Operations Integration Tests', () => {
  afterEach(() => {
    validateCRUDCleanup();
  });

  describe('Create Permit', () => {
    it('should allow user to create a permit and display it in the table', () => {
      // Navigate to app and open new permit modal
      cy.visit(UI_SERVER);
      clickNewPermitButton();

      // Fill out the permit form
      fillPermitForm(
        createThisPermit.permitName,
        createThisPermit.applicantName,
        createThisPermit.permitType,
        createThisPermit.status
      );

      // Submit the form
      clickSubmitButton();
      cy.wait(50);

      // Navigate to last page to find the newly created permit
      goToPermitTablePage('last');

      // Validate the permit appears in the table
      validateRow(
        0,
        createThisPermit.permitName,
        createThisPermit.applicantName,
        createThisPermit.permitType,
        createThisPermit.status
      );

      // Cleanup: Delete the created permit
      deletePermitById(createThisPermit.permitName);
    });
  });

  describe('Delete Permit', () => {
    it('should allow user to delete a permit from the table', () => {
      // Setup: Create a permit to delete
      createPermitViaAPI(DELETE_TEST_PERMIT);

      // Navigate to app and find the permit
      cy.visit(UI_SERVER);
      cy.wait(50);
      goToPermitTablePage('last');

      // Verify the permit exists before deletion
      validateRow(
        0,
        DELETE_TEST_PERMIT.permitName,
        DELETE_TEST_PERMIT.applicantName,
        DELETE_TEST_PERMIT.permitType,
        DELETE_TEST_PERMIT.status
      );

      // Delete the permit
      cy.get(selectors.permitRowDelete(0))
        .find('button')
        .should('exist')
        .click();

      // Wait for deletion to process
      cy.wait(50);

      // Verify the permit is no longer visible
      validateItemOnLastPage();
    });
  });

  describe('Update Permit', () => {
    it('should allow user to update a permit and display changes in the table', () => {
      // Setup: Create a permit to update
      createPermitViaAPI(UPDATE_TEST_PERMIT_BEFORE);

      // Navigate to app and find the permit
      cy.visit(UI_SERVER);
      cy.wait(1000);
      goToPermitTablePage('last');

      // Verify the original permit data
      validateRow(
        0,
        UPDATE_TEST_PERMIT_BEFORE.permitName,
        UPDATE_TEST_PERMIT_BEFORE.applicantName,
        UPDATE_TEST_PERMIT_BEFORE.permitType,
        UPDATE_TEST_PERMIT_BEFORE.status
      );

      // Open the update modal
      cy.get(selectors.permitRowUpdate(0))
        .find('button')
        .should('exist')
        .click();

      // Verify the update modal opened with correct title
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_TITLE)).should(
        'contain.text',
        PERMIT_FORM_HEADERS.updatePermit
      );

      // Verify the form is pre-populated with existing data
      cy.get(selectors.permitForm.inputPermitName).should(
        'have.value',
        UPDATE_TEST_PERMIT_BEFORE.permitName
      );
      cy.get(selectors.permitForm.inputApplicant).should(
        'have.value',
        UPDATE_TEST_PERMIT_BEFORE.applicantName
      );
      cy.get(selectors.permitForm.inputPermitType).should(
        'have.value',
        UPDATE_TEST_PERMIT_BEFORE.permitType
      );
      cy.get(selectors.permitForm.inputStatus).should(
        'have.value',
        UPDATE_TEST_PERMIT_BEFORE.status
      );

      // Update the form with new data
      fillPermitForm(
        UPDATE_TEST_PERMIT_AFTER.permitName,
        UPDATE_TEST_PERMIT_AFTER.applicantName,
        UPDATE_TEST_PERMIT_AFTER.permitType,
        UPDATE_TEST_PERMIT_AFTER.status
      );

      // Submit the updated form
      clickSubmitButton();
      cy.wait(500);

      // Navigate to last page to verify the update
      goToPermitTablePage('last');

      // Verify the permit was updated with new data
      validateRow(
        0,
        UPDATE_TEST_PERMIT_AFTER.permitName,
        UPDATE_TEST_PERMIT_AFTER.applicantName,
        UPDATE_TEST_PERMIT_AFTER.permitType,
        UPDATE_TEST_PERMIT_AFTER.status
      );

      // Cleanup: Delete the updated permit
      deletePermitById(UPDATE_TEST_PERMIT_AFTER.permitName);
    });
  });
});

// Helper functions are now imported from crud-test-helpers.ts
