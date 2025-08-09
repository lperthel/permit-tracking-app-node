import { v4 as uuidv4 } from 'uuid';
import {
  APP_DESCRIPTION_ENCODED,
  APP_HEADER,
} from '../../src/app/assets/constants/app-description';
import { createThisPermit } from '../../src/app/assets/constants/test-permits';

import { PAGINATION } from '../../src/app/assets/constants/pagination.constants';
import {
  PERMIT_FORM_SELECTORS,
  getTestSelector,
} from '../../src/app/assets/constants/permit-form.constants';
import { TEST_IDS } from '../../src/app/assets/constants/test-ids.constants';
import {
  PERMIT_FORM_ERRORS,
  PERMIT_FORM_HEADERS,
  PERMIT_FORM_MAX_LENGTHS,
} from '../../src/app/permits/permit-form-model/permit-form-constants';
import { Permit } from '../../src/app/permits/shared/models/permit.model';
import {
  clearPermitForm,
  clickModalCloseButton,
  clickNewPermitButton,
  clickSubmitButton,
  fillPermitForm,
  navigateToPaginationPage,
} from './util/cypress-form-actions';
import { selectors } from './util/cypress-selectors';

const dbServer = 'http://localhost:3000';
const uiServer = 'http://localhost:4200/';
const submitButtonSelector = getTestSelector(
  PERMIT_FORM_SELECTORS.SUBMIT_BUTTON
);

const deleteThisPermit: Permit = {
  id: uuidv4(),
  permitName: 'New Permit',
  applicantName: 'Delete Me',
  permitType: 'Construction',
  status: 'PENDING',
};

const updateThisPermitPreChange: Permit = {
  id: uuidv4(),
  permitName: 'Update this Permit',
  applicantName:
    'This is a Permit added by a cypress integration Test that needs to be updated',
  permitType: 'Construction',
  status: 'PENDING',
};

const updateThisPermitPostChange: Permit = {
  id: uuidv4(),
  permitName: 'Updated Permit',
  applicantName:
    'This is a Permit added by a cypress integration Test that has been updated',
  permitType: 'Renovation',
  status: 'APPROVED',
};

describe('CRUD Behavior', () => {
  afterEach(() => {
    validateCRUDCleanup();
  });

  it('app should allow a user to create a permit and app should display the permit in the table', () => {
    cy.visit(uiServer);
    clickNewPermitButton();
    fillPermitForm(
      createThisPermit.permitName,
      createThisPermit.applicantName,
      createThisPermit.permitType,
      createThisPermit.status
    );
    clickSubmitButton();
    cy.wait(50);
    navigateToPaginationPage(PAGINATION.PAGINATION_SELECTORS.LAST);

    validateRow(
      0,
      createThisPermit.permitName,
      createThisPermit.applicantName,
      createThisPermit.permitType,
      createThisPermit.status
    );

    cy.contains('td', createThisPermit.permitName)
      .invoke('attr', 'data-id')
      .then((id) => {
        cy.request('DELETE', `${dbServer}/permits/${id}`).then((res) => {
          expect(res.status).to.eq(200);
        });
      });
  });

  it('App should allow a user to delete a permit', () => {
    cy.request(
      'POST',
      `${dbServer}/permits/`,
      JSON.stringify(deleteThisPermit)
    ).then((res) => {
      expect(res.status).to.eq(201);
    });

    cy.visit(uiServer);
    cy.wait(50);
    navigateToPaginationPage(PAGINATION.PAGINATION_SELECTORS.LAST);

    validateDeleteMeItemExists();

    cy.get(selectors.permitRowDelete(0)).find('button').should('exist').click();

    cy.wait(50);
    validateItemOnLastPage();
  });

  it('app should allow a user to update a permit and app should display the permit in the table', () => {
    cy.request(
      'POST',
      `${dbServer}/permits/`,
      JSON.stringify(updateThisPermitPreChange)
    ).then((res) => {
      expect(res.status).to.eq(201);
    });
    cy.visit(uiServer);

    cy.wait(1000);
    navigateToPaginationPage(PAGINATION.PAGINATION_SELECTORS.LAST);

    validateRow(
      0,
      updateThisPermitPreChange.permitName,
      updateThisPermitPreChange.applicantName,
      updateThisPermitPreChange.permitType,
      updateThisPermitPreChange.status
    );

    cy.get(selectors.permitRowUpdate(0)).find('button').should('exist').click();
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_TITLE)).should(
      'contain.text',
      PERMIT_FORM_HEADERS.updatePermit
    );
    cy.get(selectors.permitForm.inputPermitName).should(
      'have.value',
      updateThisPermitPreChange.permitName
    );
    cy.get(selectors.permitForm.inputApplicant).should(
      'have.value',
      updateThisPermitPreChange.applicantName
    );
    cy.get(selectors.permitForm.inputPermitType).should(
      'have.value',
      updateThisPermitPreChange.permitType
    );
    cy.get(selectors.permitForm.inputStatus).should(
      'have.value',
      updateThisPermitPreChange.status
    );

    fillPermitForm(
      updateThisPermitPostChange.permitName,
      updateThisPermitPostChange.applicantName,
      updateThisPermitPostChange.permitType,
      updateThisPermitPostChange.status
    );

    clickSubmitButton();
    cy.wait(500);
    navigateToPaginationPage(PAGINATION.PAGINATION_SELECTORS.LAST);

    validateRow(
      0,
      updateThisPermitPostChange.permitName,
      updateThisPermitPostChange.applicantName,
      updateThisPermitPostChange.permitType,
      updateThisPermitPostChange.status
    );

    cy.contains('td', updateThisPermitPostChange.permitName)
      .invoke('attr', 'data-id')
      .then((permitId) => {
        cy.request('DELETE', `${dbServer}/permits/${permitId}`).then((res) => {
          expect(res.status).to.eq(200);
        });
      });
  });
});

describe('New Permit Modal', () => {
  beforeEach(() => {
    cy.visit(uiServer);
    clickNewPermitButton();
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should('exist');
  });

  it('should render all required elements', () => {
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_TITLE)).should(
      'contain.text',
      PERMIT_FORM_HEADERS.newPermit
    );
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_CLOSE_BUTTON)).should(
      'exist'
    );
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.PERMIT_FORM)).should('exist');
    cy.get(selectors.permitForm.inputPermitName).should('exist');
    cy.get(selectors.permitForm.inputApplicant).should('exist');
    cy.get(selectors.permitForm.inputPermitType).should('exist');
    cy.get(selectors.permitForm.inputStatus).should('exist');
    cy.get(submitButtonSelector).should('exist');
  });

  it('should show error messages when fields are invalid', () => {
    clickSubmitButton();
    cy.get(selectors.permitForm.errorPermitName).should('exist');
    cy.get(selectors.permitForm.errorApplicantName).should('exist');
    cy.get(selectors.permitForm.errorPermitType).should('exist');
    cy.get(selectors.permitForm.errorPermitStatus).should('exist');
  });

  it('should close the modal when user presses the "x" button', () => {
    clickModalCloseButton();
    cy.url().should('eq', uiServer);
  });
});

describe('Update Permit Modal', () => {
  beforeEach(() => {
    cy.visit(uiServer);
    cy.wait(500);
  });

  it('should render all required elements', () => {
    cy.get(selectors.permitRowUpdate(0)).find('button').should('exist').click();
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should('exist');
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_TITLE)).should(
      'contain.text',
      PERMIT_FORM_HEADERS.updatePermit
    );
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_CLOSE_BUTTON)).should(
      'exist'
    );
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.PERMIT_FORM)).should('exist');
    cy.get(selectors.permitForm.inputPermitName).should('exist');
    cy.get(selectors.permitForm.inputApplicant).should('exist');
    cy.get(selectors.permitForm.inputPermitType).should('exist');
    cy.get(selectors.permitForm.inputStatus).should('exist');
    cy.get(submitButtonSelector).should('exist');
  });

  it('should show error messages when fields are invalid', () => {
    cy.get(selectors.permitRowUpdate(0)).find('button').should('exist').click();
    clearPermitForm();
    clickSubmitButton();
    cy.get(selectors.permitForm.errorPermitName).should('exist');
    cy.get(selectors.permitForm.errorApplicantName).should('exist');
    cy.get(selectors.permitForm.errorPermitType).should('exist');
    cy.get(selectors.permitForm.errorPermitStatus).should('exist');
  });

  it('should close the modal when user presses the "x" button', () => {
    cy.get(selectors.permitRowUpdate(0)).find('button').should('exist').click();
    clickModalCloseButton();
    cy.url().should('eq', uiServer);
  });
});

describe('New Permit Form Validation', () => {
  beforeEach(() => {
    cy.visit(uiServer);
    clickNewPermitButton();
  });

  describe('Permit Name Field Validation', () => {
    it('should show required error when left empty', () => {
      clickSubmitButton();
      cy.get(selectors.permitForm.errorPermitName).should(
        'contain',
        PERMIT_FORM_ERRORS.invalidPermitName
      );
    });

    it('should clear error when a valid permit name is entered', () => {
      cy.get(selectors.permitForm.inputPermitName).type(
        createThisPermit.permitName
      );
      cy.get(selectors.permitForm.errorPermitName).should('not.exist');
    });

    it('should show error for permit name longer than 100 characters', () => {
      cy.get(selectors.permitForm.inputPermitName)
        .invoke('val', 'a'.repeat(PERMIT_FORM_MAX_LENGTHS.PERMIT_NAME + 1))
        .trigger('input');
      clickSubmitButton();
      cy.get(selectors.permitForm.errorPermitName).should(
        'contain',
        PERMIT_FORM_ERRORS.invalidPermitName
      );
      cy.get(selectors.permitForm.inputPermitName).type('{backspace}');
      clickSubmitButton();
      cy.get(selectors.permitForm.errorPermitName).should('not.exist');
    });
  });

  describe('Applicant Name Field Validation', () => {
    it('should show required error when left empty', () => {
      clickSubmitButton();
      cy.get(selectors.permitForm.errorApplicantName).should(
        'contain',
        PERMIT_FORM_ERRORS.invalidApplicantName
      );
    });

    it('should clear error when a valid applicant name is entered', () => {
      cy.get(selectors.permitForm.inputApplicant).type(
        createThisPermit.applicantName
      );
      cy.get(selectors.permitForm.errorApplicantName).should('not.exist');
    });

    it('should show error for applicant name longer than the defined max length', () => {
      cy.get(selectors.permitForm.inputApplicant)
        .invoke('val', 'a'.repeat(PERMIT_FORM_MAX_LENGTHS.APPLICANT_NAME + 1))
        .trigger('input');
      clickSubmitButton();
      cy.get(selectors.permitForm.errorApplicantName).should(
        'contain',
        PERMIT_FORM_ERRORS.invalidApplicantName
      );
      cy.get(selectors.permitForm.inputApplicant).type('{backspace}');
      clickSubmitButton();
      cy.get(selectors.permitForm.errorApplicantName).should('not.exist');
    });
  });

  describe('Permit Type Field Validation', () => {
    it('should show required error when left empty', () => {
      clickSubmitButton();
      cy.get(selectors.permitForm.errorPermitType).should(
        'contain',
        PERMIT_FORM_ERRORS.invalidPermitType
      );
    });

    it('should show error when permit type contains invalid characters', () => {
      cy.get(selectors.permitForm.inputPermitType).type('abc@#$');
      clickSubmitButton();
      cy.get(selectors.permitForm.errorPermitType).should(
        'contain',
        PERMIT_FORM_ERRORS.invalidPermitType
      );
    });

    it('should accept a valid permit type', () => {
      cy.get(selectors.permitForm.inputPermitType).type(
        createThisPermit.permitType
      );
      clickSubmitButton();
      cy.get(selectors.permitForm.errorPermitType).should('not.exist');
    });
  });
});

describe('New Permit Validation: Test form error validation when creating a new permit', () => {
  beforeEach(() => {
    cy.visit(uiServer);
    clickNewPermitButton();
    cy.get(submitButtonSelector).click();
    cy.get(selectors.permitForm.errorPermitName).should('exist');
    cy.get(selectors.permitForm.errorApplicantName).should('exist');
    cy.get(selectors.permitForm.errorPermitType).should('exist');
    cy.get(selectors.permitForm.errorPermitStatus).should('exist');
  });

  it('Correct the permit name and make sure the error is fixed', () => {
    cy.get(selectors.permitForm.errorPermitName).should('exist');
    cy.get(selectors.permitForm.inputPermitName).type('Valid Permit Name');
    cy.get(selectors.permitForm.errorPermitName).should('not.exist');
  });

  it('Correct the applicant name and make sure the error is fixed', () => {
    cy.get(selectors.permitForm.errorApplicantName).should('exist');
    cy.get(selectors.permitForm.inputApplicant).type('Valid Applicant Name');
    cy.get(selectors.permitForm.errorApplicantName).should('not.exist');
  });
});

describe('Paginator Behavior: Navigate between pages and validate the expect items render', () => {
  it('Navigate to page 2 and test that the first element on page the row exists and then navigate back to page one and test that the ', () => {
    const secondPageFirstItem = {
      permitName: 'Second Page Permit',
      applicantName:
        'Second page applicant with detailed description for testing pagination functionality.',
      permitType: 'Construction',
      status: 'PENDING',
    };

    cy.visit(uiServer);
    validateElementOnFirstPage();

    navigateToPaginationPage(PAGINATION.PAGINATION_SELECTORS.NEXT);
    validateRow(
      0,
      secondPageFirstItem.permitName,
      secondPageFirstItem.applicantName,
      secondPageFirstItem.permitType,
      secondPageFirstItem.status
    );
    navigateToPaginationPage(PAGINATION.PAGINATION_SELECTORS.PREV);
    validateElementOnFirstPage();
  });

  it('Navigate to the last page and test that the first element on page the row exists', () => {
    cy.visit(uiServer);
    validateElementOnFirstPage();

    navigateToPaginationPage(PAGINATION.PAGINATION_SELECTORS.LAST);
    validateItemOnLastPage();
    navigateToPaginationPage(PAGINATION.PAGINATION_SELECTORS.FIRST);
    validateElementOnFirstPage();
  });
});

describe('Paginator Behavior: Change items per page and validate table content', () => {
  const visitAppAndSetPageSize = (pageSize: number) => {
    cy.visit(uiServer);
    cy.get('mat-paginator[aria-label="Permit table pagination controls"]')
      .find('mat-select')
      .click({ force: true });
    cy.get('mat-option').contains(`${pageSize}`).click({ force: true });
  };

  it('Tests that the first element in the row exists', () => {
    cy.visit(uiServer);
    validateElementOnFirstPage();
  });

  it('shows expected content when using default 10 items per page', () => {
    cy.visit(uiServer);
    validateRow(
      9,
      'Sample Construction Permit',
      'Detailed construction permit for testing pagination with longer description text.',
      'Construction',
      'APPROVED'
    );
  });

  it('shows expected content with 4 items per page', () => {
    visitAppAndSetPageSize(4);
    validateRow(
      3,
      'Renovation Permit',
      'Home renovation permit with detailed specifications for testing pagination behavior.',
      'Renovation',
      'PENDING'
    );
  });

  it('shows expected content with 2 items per page', () => {
    visitAppAndSetPageSize(2);
    validateRow(
      1,
      'Electrical Permit',
      'Electrical work permit with comprehensive details for pagination testing functionality.',
      'Electrical',
      'APPROVED'
    );
  });

  it('shows expected content with 6 items per page', () => {
    visitAppAndSetPageSize(6);
    validateRow(
      5,
      'Plumbing Permit',
      'Plumbing permit with detailed specifications and requirements for comprehensive testing.',
      'Plumbing',
      'PENDING'
    );
  });
});

describe('Test landing page rendering and header', () => {
  it('Visits the initial landing page and test that the header and description render', () => {
    cy.visit(uiServer);
    cy.contains(APP_HEADER.trim()).should('exist');
    cy.contains(APP_DESCRIPTION_ENCODED.replace(/\s+/g, ' ').trim()).should(
      'exist'
    );
  });
});

describe('Test permit table columns and features', () => {
  it('tests that permit table components, elements, associated features (pagination, etc.), etc. renders on the page.', () => {
    cy.visit(uiServer);
    cy.get(getTestSelector(TEST_IDS.PERMITS_TABLE)).should('exist');
    cy.get(getTestSelector(TEST_IDS.PERMIT_NAME_HEADER)).should('exist');
    cy.get(getTestSelector(TEST_IDS.APPLICANT_NAME_HEADER)).should('exist');
    cy.get(getTestSelector(TEST_IDS.PERMIT_TYPE_HEADER)).should('exist');
    cy.get(getTestSelector(TEST_IDS.STATUS_HEADER)).should('exist');
    cy.get(getTestSelector(TEST_IDS.UPDATE_HEADER)).should('exist');
    cy.get(getTestSelector(TEST_IDS.DELETE_HEADER)).should('exist');
  });

  it('test the table column structure', () => {
    cy.visit(uiServer);
    cy.get(
      `${getTestSelector(TEST_IDS.PERMITS_TABLE)} th[mat-header-cell]`
    ).should('have.length', 6);

    cy.get(`${getTestSelector(TEST_IDS.PERMITS_TABLE)} th`)
      .should('contain.text', 'Permit Name')
      .and('contain.text', 'Applicant Name')
      .and('contain.text', 'Permit Type')
      .and('contain.text', 'Status')
      .and('contain.text', 'Update')
      .and('contain.text', 'Delete');
  });
});

function validateRow(
  index: number,
  permitName: string,
  applicantName: string,
  permitType: string,
  status: string
) {
  cy.contains(selectors.permitRowName(index), permitName).should('exist');
  cy.contains(selectors.permitRowApplicantName(index), applicantName).should(
    'exist'
  );
  cy.contains(selectors.permitRowPermitType(index), permitType).should('exist');
  cy.contains(selectors.permitRowStatus(index), status).should('exist');
}

function validateCRUDCleanup() {
  cy.visit(uiServer);
  cy.wait(1000);
  navigateToPaginationPage(PAGINATION.PAGINATION_SELECTORS.LAST);
  validateItemOnLastPage();
}

function validateItemOnLastPage() {
  validateRow(
    0,
    'Final Test Permit',
    'Last page permit with comprehensive details for cleanup validation testing.',
    'Construction',
    'APPROVED'
  );
}

function validateElementOnFirstPage() {
  validateRow(
    0,
    'First Page Permit',
    'First page permit with detailed information for initial validation testing.',
    'Construction',
    'PENDING'
  );
}

function validateNewItemExists() {
  validateRow(
    0,
    createThisPermit.permitName,
    createThisPermit.applicantName,
    createThisPermit.permitType,
    createThisPermit.status
  );
}

function validateDeleteMeItemExists() {
  validateRow(
    0,
    deleteThisPermit.permitName,
    deleteThisPermit.applicantName,
    deleteThisPermit.permitType,
    deleteThisPermit.status
  );
}
