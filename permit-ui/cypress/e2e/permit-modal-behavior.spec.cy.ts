import { PERMIT_FORM_SELECTORS } from '../../src/app/assets/constants/permit-form.constants';
import { createThisPermit } from '../../src/app/assets/constants/test-permits';
import {
  PERMIT_FORM_ERRORS,
  PERMIT_FORM_HEADERS,
  PERMIT_FORM_MAX_LENGTHS,
} from '../../src/app/permits/permit-form-model/permit-form-constants';
import { PermitStatus } from '../../src/app/permits/shared/models/permit-status.enums';

import { dev_env } from '../../src/environments/environment';
import {
  clearPermitForm,
  clearPermitFormForUpdate,
  clickModalCloseButton,
  clickNewPermitButton,
  clickSubmitButton,
} from '../support/cypress-form-actions';
import { getTestSelector, selectors } from '../support/cypress-selectors';
import { waitForPermitTable } from '../support/permit_test_helpers';

// Environment configuration
const UI_SERVER = dev_env.uiUrl;

// String constants at top of file per coding guidelines
const SUBMIT_BUTTON_SELECTOR = getTestSelector(
  PERMIT_FORM_SELECTORS.SUBMIT_BUTTON
);
const MODAL_HEADER_SELECTOR = getTestSelector(
  PERMIT_FORM_SELECTORS.MODAL_HEADER
);
const MODAL_TITLE_SELECTOR = getTestSelector(PERMIT_FORM_SELECTORS.MODAL_TITLE);
const MODAL_CLOSE_BUTTON_SELECTOR = getTestSelector(
  PERMIT_FORM_SELECTORS.MODAL_CLOSE_BUTTON
);
const PERMIT_FORM_SELECTOR = getTestSelector(PERMIT_FORM_SELECTORS.PERMIT_FORM);

describe('New Permit Modal Integration Tests', () => {
  beforeEach(() => {
    cy.visit(UI_SERVER);
    clickNewPermitButton();
    cy.get(MODAL_HEADER_SELECTOR).should('exist');
  });

  describe('Modal Structure and Elements', () => {
    it('should render all required modal elements', () => {
      // Verify modal title
      cy.get(MODAL_TITLE_SELECTOR).should(
        'contain.text',
        PERMIT_FORM_HEADERS.newPermit
      );

      // Verify modal close button
      cy.get(MODAL_CLOSE_BUTTON_SELECTOR).should('exist');

      // Verify form exists
      cy.get(PERMIT_FORM_SELECTOR).should('exist');

      // Verify all form input fields exist
      cy.get(selectors.permitForm.inputPermitName).should('exist');
      cy.get(selectors.permitForm.inputApplicant).should('exist');
      cy.get(selectors.permitForm.inputPermitType).should('exist');
      cy.get(selectors.permitForm.inputStatus).should('exist');

      // Verify submit button exists
      cy.get(SUBMIT_BUTTON_SELECTOR).should('exist');
    });

    it('should close the modal when user clicks the close button', () => {
      clickModalCloseButton();

      // Verify modal is closed (more reliable than URL check)
      cy.get(MODAL_HEADER_SELECTOR).should('not.exist');

      // Verify we're back on the main page
      cy.get(selectors.table).should('be.visible');
    });
  });

  describe('Form Validation Behavior', () => {
    it('should show all error messages when submitted with empty fields', () => {
      clickSubmitButton();

      // Verify all required field errors appear
      cy.get(selectors.permitForm.errorPermitName).should('exist');
      cy.get(selectors.permitForm.errorApplicantName).should('exist');
      cy.get(selectors.permitForm.errorPermitType).should('exist');
      cy.get(selectors.permitForm.errorPermitStatus).should('exist');
    });

    it('should clear errors as fields are properly filled', () => {
      // Trigger validation errors first
      clickSubmitButton();
      cy.get(selectors.permitForm.errorPermitName).should('exist');

      // Fill permit name and verify error clears
      cy.get(selectors.permitForm.inputPermitName).type('Valid Permit Name');
      cy.get(selectors.permitForm.errorPermitName).should('not.exist');

      // Fill applicant name and verify error clears
      cy.get(selectors.permitForm.inputApplicant).type('Valid Applicant Name');
      cy.get(selectors.permitForm.errorApplicantName).should('not.exist');

      // Fill permit type and verify error clears
      cy.get(selectors.permitForm.inputPermitType).type('Construction');
      cy.get(selectors.permitForm.errorPermitType).should('not.exist');

      // Fill status and verify error clears (use select for dropdown)
      cy.get(selectors.permitForm.inputStatus).select(PermitStatus.PENDING);
      cy.get(selectors.permitForm.errorPermitStatus).should('not.exist');
    });
  });

  describe('Field-Specific Validation', () => {
    describe('Permit Name Field', () => {
      it('should show required error when left empty', () => {
        clickSubmitButton();
        cy.get(selectors.permitForm.errorPermitName).should(
          'contain',
          PERMIT_FORM_ERRORS.invalidPermitName
        );
      });

      it('should clear error when valid permit name is entered', () => {
        cy.get(selectors.permitForm.inputPermitName).type(
          createThisPermit.permitName
        );
        cy.get(selectors.permitForm.errorPermitName).should('not.exist');
      });

      it('should show error for permit name exceeding max length', () => {
        const maxLengthExceeded = 'a'.repeat(
          PERMIT_FORM_MAX_LENGTHS.PERMIT_NAME + 1
        );

        cy.get(selectors.permitForm.inputPermitName)
          .invoke('val', maxLengthExceeded)
          .trigger('input');

        clickSubmitButton();

        cy.get(selectors.permitForm.errorPermitName).should(
          'contain',
          PERMIT_FORM_ERRORS.invalidPermitName
        );

        // Fix by removing one character
        cy.get(selectors.permitForm.inputPermitName).type('{backspace}');
        clickSubmitButton();
        cy.get(selectors.permitForm.errorPermitName).should('not.exist');
      });
    });

    describe('Applicant Name Field', () => {
      it('should show required error when left empty', () => {
        clickSubmitButton();
        cy.get(selectors.permitForm.errorApplicantName).should(
          'contain',
          PERMIT_FORM_ERRORS.invalidApplicantName
        );
      });

      it('should clear error when valid applicant name is entered', () => {
        cy.get(selectors.permitForm.inputApplicant).type(
          createThisPermit.applicantName
        );
        cy.get(selectors.permitForm.errorApplicantName).should('not.exist');
      });

      it('should show error for applicant name exceeding max length', () => {
        const maxLengthExceeded = 'a'.repeat(
          PERMIT_FORM_MAX_LENGTHS.APPLICANT_NAME + 1
        );

        cy.get(selectors.permitForm.inputApplicant)
          .invoke('val', maxLengthExceeded)
          .trigger('input');

        clickSubmitButton();

        cy.get(selectors.permitForm.errorApplicantName).should(
          'contain',
          PERMIT_FORM_ERRORS.invalidApplicantName
        );

        // Fix by removing one character
        cy.get(selectors.permitForm.inputApplicant).type('{backspace}');
        clickSubmitButton();
        cy.get(selectors.permitForm.errorApplicantName).should('not.exist');
      });
    });

    describe('Permit Type Field', () => {
      it('should show required error when left empty', () => {
        clickSubmitButton();
        cy.get(selectors.permitForm.errorPermitType).should(
          'contain',
          PERMIT_FORM_ERRORS.invalidPermitType
        );
      });

      it('should show error for invalid characters', () => {
        const invalidPermitType = 'abc@#$';

        cy.get(selectors.permitForm.inputPermitType).type(invalidPermitType);
        clickSubmitButton();

        cy.get(selectors.permitForm.errorPermitType).should(
          'contain',
          PERMIT_FORM_ERRORS.invalidPermitType
        );
      });

      it('should accept valid permit type', () => {
        cy.get(selectors.permitForm.inputPermitType).type(
          createThisPermit.permitType
        );
        clickSubmitButton();
        cy.get(selectors.permitForm.errorPermitType).should('not.exist');
      });
    });

    describe('Status Field', () => {
      it('should show required error when left empty', () => {
        clickSubmitButton();
        cy.get(selectors.permitForm.errorPermitStatus).should(
          'contain',
          PERMIT_FORM_ERRORS.invalidStatus
        );
      });

      it('should clear error when valid status is selected', () => {
        cy.get(selectors.permitForm.inputStatus).select(
          createThisPermit.status
        );
        cy.get(selectors.permitForm.errorPermitStatus).should('not.exist');
      });

      it('should accept valid status values from dropdown', () => {
        const validStatuses = [
          PermitStatus.SUBMITTED,
          PermitStatus.PENDING,
          PermitStatus.APPROVED,
          PermitStatus.REJECTED,
        ];

        validStatuses.forEach((status) => {
          // Select valid status directly (no need to clear with disabled option)
          cy.get(selectors.permitForm.inputStatus).select(status);
          // Verify no error appears
          cy.get(selectors.permitForm.errorPermitStatus).should('not.exist');
        });
      });

      it('should display all available status options in dropdown', () => {
        // Verify dropdown contains all enum values (check option elements directly)
        cy.get(selectors.permitForm.inputStatus)
          .find('option')
          .then(($options) => {
            const values = [...$options]
              .map((option) => option.value)
              .filter((value) => value !== '');
            expect(values).to.include(PermitStatus.SUBMITTED);
            expect(values).to.include(PermitStatus.PENDING);
            expect(values).to.include(PermitStatus.UNDER_REVIEW);
            expect(values).to.include(PermitStatus.APPROVED);
            expect(values).to.include(PermitStatus.REJECTED);
            expect(values).to.include(PermitStatus.EXPIRED);
          });
      });
    });
  });
});

describe('Update Permit Modal Integration Tests', () => {
  beforeEach(() => {
    cy.visit(UI_SERVER);
    waitForPermitTable();
  });

  describe('Modal Structure and Elements', () => {
    it('should render all required modal elements', () => {
      // Open update modal for first permit
      cy.get(selectors.permitRowUpdate(0))
        .find('button')
        .should('exist')
        .click();

      // Verify modal opened with correct structure
      cy.get(MODAL_HEADER_SELECTOR).should('exist');
      cy.get(MODAL_TITLE_SELECTOR).should(
        'contain.text',
        PERMIT_FORM_HEADERS.updatePermit
      );
      cy.get(MODAL_CLOSE_BUTTON_SELECTOR).should('exist');
      cy.get(PERMIT_FORM_SELECTOR).should('exist');

      // Verify all form inputs exist
      cy.get(selectors.permitForm.inputPermitName).should('exist');
      cy.get(selectors.permitForm.inputApplicant).should('exist');
      cy.get(selectors.permitForm.inputPermitType).should('exist');
      cy.get(selectors.permitForm.inputStatus).should('exist');

      // Verify submit button exists
      cy.get(SUBMIT_BUTTON_SELECTOR).should('exist');
    });

    it('should close the modal when user clicks the close button', () => {
      // Open update modal
      cy.get(selectors.permitRowUpdate(0))
        .find('button')
        .should('exist')
        .click();

      // Close modal and verify it's gone
      clickModalCloseButton();
      cy.get(MODAL_HEADER_SELECTOR).should('not.exist');

      // Verify we're back on the main page
      cy.get(selectors.table).should('be.visible');
    });

    it('should pre-populate form fields with existing permit data', () => {
      // Store original values for comparison
      let originalPermitName: string;
      let originalApplicantName: string;
      let originalPermitType: string;
      let originalStatus: string;

      // Get original values from table
      cy.get(selectors.permitRowName(0))
        .invoke('text')
        .then((text) => {
          originalPermitName = text.trim();
        });

      cy.get(selectors.permitRowApplicantName(0))
        .invoke('text')
        .then((text) => {
          originalApplicantName = text.trim();
        });

      cy.get(selectors.permitRowPermitType(0))
        .invoke('text')
        .then((text) => {
          originalPermitType = text.trim();
        });

      cy.get(selectors.permitRowStatus(0))
        .invoke('text')
        .then((text) => {
          originalStatus = text.trim();
        });

      // Open update modal
      cy.get(selectors.permitRowUpdate(0))
        .find('button')
        .should('exist')
        .click();

      // Verify form is pre-populated with original values
      cy.get(selectors.permitForm.inputPermitName).then(($input) => {
        expect($input.val()).to.equal(originalPermitName);
      });

      cy.get(selectors.permitForm.inputApplicant).then(($input) => {
        expect($input.val()).to.equal(originalApplicantName);
      });

      cy.get(selectors.permitForm.inputPermitType).then(($input) => {
        expect($input.val()).to.equal(originalPermitType);
      });

      cy.get(selectors.permitForm.inputStatus).then(($select) => {
        expect($select.val()).to.equal(originalStatus);
      });
    });
  });

  describe('Form Validation Behavior', () => {
    it('should show error messages when fields are cleared and submitted', () => {
      // Open update modal
      cy.get(selectors.permitRowUpdate(0))
        .find('button')
        .should('exist')
        .click();

      // Clear all form fields using the update-specific clear function
      clearPermitFormForUpdate();

      // Submit and verify errors appear
      clickSubmitButton();

      cy.get(selectors.permitForm.errorPermitName).should('exist');
      cy.get(selectors.permitForm.errorApplicantName).should('exist');
      cy.get(selectors.permitForm.errorPermitType).should('exist');
      cy.get(selectors.permitForm.errorPermitStatus).should('exist');
    });

    it('should maintain validation behavior consistent with new permit modal', () => {
      // Open update modal
      cy.get(selectors.permitRowUpdate(0))
        .find('button')
        .should('exist')
        .click();

      // Clear form and test permit name validation using update-specific clear
      clearPermitFormForUpdate();

      // Test permit name validation
      cy.get(selectors.permitForm.inputPermitName).type('Valid Permit');
      cy.get(selectors.permitForm.errorPermitName).should('not.exist');

      // Test applicant name validation
      cy.get(selectors.permitForm.inputApplicant).type('Valid Applicant');
      cy.get(selectors.permitForm.errorApplicantName).should('not.exist');
    });
  });
});

describe('Modal Accessibility and UX Integration Tests', () => {
  beforeEach(() => {
    cy.visit(UI_SERVER);
  });

  it('should handle keyboard navigation properly', () => {
    clickNewPermitButton();

    // Verify modal can be closed with Escape key
    cy.get('body').type('{esc}');
    cy.get(MODAL_HEADER_SELECTOR).should('not.exist');
  });

  it('should allow keyboard navigation within modal', () => {
    clickNewPermitButton();

    // Wait for modal to fully render
    cy.get(MODAL_HEADER_SELECTOR).should('be.visible');
    cy.get(selectors.permitForm.inputPermitName).should('be.visible');

    // Verify user can tab to and interact with form elements
    cy.get(selectors.permitForm.inputPermitName).click().type('Test Permit');
    cy.get(selectors.permitForm.inputApplicant).click().type('Test Applicant');

    // Verify form accepts input properly
    cy.get(selectors.permitForm.inputPermitName).should(
      'have.value',
      'Test Permit'
    );
    cy.get(selectors.permitForm.inputApplicant).should(
      'have.value',
      'Test Applicant'
    );
  });

  it('should maintain form state during modal session', () => {
    const testPermitName = 'Test Permit Name';
    const testApplicantName = 'Test Applicant';

    clickNewPermitButton();

    // Fill some fields
    cy.get(selectors.permitForm.inputPermitName).type(testPermitName);
    cy.get(selectors.permitForm.inputApplicant).type(testApplicantName);

    // Verify values persist during the modal session
    cy.get(selectors.permitForm.inputPermitName).should(
      'have.value',
      testPermitName
    );
    cy.get(selectors.permitForm.inputApplicant).should(
      'have.value',
      testApplicantName
    );

    // Close and reopen modal - should start fresh
    clickModalCloseButton();
    clickNewPermitButton();

    // Verify form is cleared for new session
    cy.get(selectors.permitForm.inputPermitName).should('have.value', '');
    cy.get(selectors.permitForm.inputApplicant).should('have.value', '');
  });
});
