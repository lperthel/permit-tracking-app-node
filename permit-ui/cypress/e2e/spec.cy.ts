import { v4 as uuidv4 } from 'uuid';
import {
  APP_DESCRIPTION_ENCODED,
  APP_HEADER,
} from '../../src/app/assets/constants/app-description';
import {
  createThisPermit,
  updatePermit,
} from '../../src/app/assets/constants/test-permits';

import { PAGINATION } from '../../src/app/assets/constants/pagination.constants';
import {
  PERMIT_FORM_CONSTRAINTS,
  PERMIT_FORM_ERRORS,
  PERMIT_FORM_HEADERS,
} from '../../src/app/permits/permit-form-model/permit-form-constants';
import { Permit } from '../../src/app/permits/shared/models/permit.model';
import {
  clearProductForm,
  clickModalCloseButton,
  clickNewProductButton,
  clickSubmitButton,
  fillPermitForm,
  navigateToPaginationPage,
} from './util/form-actions';
import { selectors } from './util/selectors';

const dbServer = 'http://localhost:3000';
const uiServer = 'http://localhost:4200/';
const submitButtonSelector = '[data-testid="submit-button"]';

const createThisProduct: Permit = createThisPermit;

const updatedPermit: Permit = updatePermit;

const deleteThisPermit: Permit = {
  id: uuidv4(),
  permitName: 'New Permit',
  applicantName: 'Delete Me',
  permitType: '749.19',
  status: 2,
};

const updateThisProductPreChange: Permit = {
  id: uuidv4(),
  permitName: 'Update this Product',
  applicantName:
    'This is an Product added by a cypress integration Test that needs to be updated',
  permitType: '749.19',
  status: 2,
};

const updateThisProductPostChange: Permit = {
  id: uuidv4(),
  permitName: 'Updated Product',
  applicantName:
    'This is an Product added by a cypress integration Test that has been updated',
  permitType: '749.20',
  status: 3,
};

describe('CRUD Behavior', () => {
  afterEach(() => {
    validateCRUDCleanup();
  });
  it('app should allow a user to create a product and app should display the product in the table', () => {
    cy.visit(uiServer);
    clickNewProductButton();
    fillPermitForm(
      createThisProduct.permitName,
      createThisProduct.applicantName,
      createThisProduct.permitType,
      `${createThisProduct.status}`
    );
    clickSubmitButton();
    cy.wait(50);
    navigateToPaginationPage(PAGINATION.PAGINATION_SELECTORS.LAST);

    validateRow(
      0,
      createThisProduct.permitName,
      createThisProduct.applicantName,
      `\$${createThisProduct.permitType}`,
      `${createThisProduct.status}`
    );

    cy.contains('td', createThisProduct.permitName)
      .invoke('attr', 'data-id') //invoke tells cypress to call element.getAttribute('data-id')
      .then((id) => {
        cy.request('DELETE', `${dbServer}/products/${id}`).then((res) => {
          expect(res.status).to.eq(200);
        });
      });
  });

  it('App should allow a user to delete a product', () => {
    cy.request(
      'POST',
      `${dbServer}/products/`,
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

  it('app should allow a user to update a product and app should display the product in the table', () => {
    cy.request(
      'POST',
      `${dbServer}/products/`,
      JSON.stringify(updateThisProductPreChange)
    ).then((res) => {
      expect(res.status).to.eq(201);
    });
    cy.visit(uiServer);

    cy.wait(1000);
    navigateToPaginationPage(PAGINATION.PAGINATION_SELECTORS.LAST);

    validateRow(
      0,
      updateThisProductPreChange.permitName,
      updateThisProductPreChange.applicantName,
      `\$${updateThisProductPreChange.permitType}`,
      `${updateThisProductPreChange.status}`
    );

    console.log('finding update buttn.');
    cy.get(selectors.permitRowUpdate(0)).find('button').should('exist').click();
    cy.get('[data-testid="modal-title"]').should(
      'contain.text',
      PERMIT_FORM_HEADERS.updatePermit
    );
    cy.get(selectors.permitForm.inputPermitName).should(
      'have.value',
      updateThisProductPreChange.permitName
    );
    cy.get(selectors.permitForm.inputApplicant).should(
      'have.value',
      updateThisProductPreChange.applicantName
    );
    cy.get(selectors.permitForm.inputPermitType).should(
      'have.value',
      updateThisProductPreChange.permitType
    );
    cy.get(selectors.permitForm.inputStatus).should(
      'have.value',
      `${updateThisProductPreChange.status}`
    );

    fillPermitForm(
      updateThisProductPostChange.permitName,
      updateThisProductPostChange.applicantName,
      updateThisProductPostChange.permitType,
      `${updateThisProductPostChange.status}`
    );

    clickSubmitButton();
    cy.wait(500);
    navigateToPaginationPage(PAGINATION.PAGINATION_SELECTORS.LAST);

    validateRow(
      0,
      updateThisProductPostChange.permitName,
      updateThisProductPostChange.applicantName,
      `\$${updateThisProductPostChange.permitType}`,
      `${updateThisProductPostChange.status}`
    );

    cy.contains('td', updateThisProductPostChange.permitName)
      .invoke('attr', 'data-id') //invoke tells cypress to call element.getAttribute('data-id')
      .then((productId) => {
        cy.request('DELETE', `${dbServer}/products/${productId}`).then(
          (res) => {
            expect(res.status).to.eq(200);
          }
        );
      });
  });
});
describe('New Product Modal', () => {
  beforeEach(() => {
    cy.visit(uiServer);
    clickNewProductButton();
    cy.get('[data-testid="modal-header"]').should('exist'); // ensure modal is open
  });

  it('should render all required elements', () => {
    cy.get('[data-testid="modal-title"]').should(
      'contain.text',
      PERMIT_FORM_HEADERS.newPermit
    );
    cy.get('[data-testid="modal-close-button"]').should('exist');
    cy.get('[data-testid="product-form"]').should('exist');
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

describe('Update Product Modal', () => {
  beforeEach(() => {
    cy.visit(uiServer);
    cy.wait(500);
  });

  it('should render all required elements', () => {
    cy.get(selectors.permitRowUpdate(0)).find('button').should('exist').click();
    cy.get('[data-testid="modal-header"]').should('exist');
    cy.get('[data-testid="modal-title"]').should(
      'contain.text',
      PERMIT_FORM_HEADERS.updatePermit
    );
    cy.get('[data-testid="modal-close-button"]').should('exist');
    cy.get('[data-testid="product-form"]').should('exist');
    cy.get(selectors.permitForm.inputPermitName).should('exist');
    cy.get(selectors.permitForm.inputApplicant).should('exist');
    cy.get(selectors.permitForm.inputPermitType).should('exist');
    cy.get(selectors.permitForm.inputStatus).should('exist');
    cy.get(submitButtonSelector).should('exist');
  });

  it('should show error messages when fields are invalid', () => {
    cy.get(selectors.permitRowUpdate(0)).find('button').should('exist').click();
    clearProductForm();
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

describe('New Item Form Validation', () => {
  beforeEach(() => {
    cy.visit(uiServer);
    clickNewProductButton();
  });

  describe('Name Field Validation', () => {
    it('should show required error when left empty', () => {
      clickSubmitButton();
      cy.get(selectors.permitForm.errorPermitName).should(
        'contain',
        PERMIT_FORM_ERRORS.invalidName
      );
    });

    it('should clear error when a valid name is entered', () => {
      cy.get(selectors.permitForm.inputPermitName).type(
        createThisProduct.permitName
      );
      cy.get(selectors.permitForm.errorPermitName).should('not.exist');
    });

    it('should show error for name longer than 50 characters', () => {
      cy.get(selectors.permitForm.inputPermitName)
        .invoke('val', 'a'.repeat(PERMIT_FORM_CONSTRAINTS.nameMaxLength + 1))
        .trigger('input');
      clickSubmitButton();
      cy.get(selectors.permitForm.errorPermitName).should(
        'contain',
        PERMIT_FORM_ERRORS.invalidName
      );
      cy.get(selectors.permitForm.inputPermitName).type('{backspace}');
      clickSubmitButton();
      cy.get(selectors.permitForm.errorPermitName).should('not.exist');
    });
  });

  describe('Description Field Validation', () => {
    it('should show required error when left empty', () => {
      clickSubmitButton();
      cy.get(selectors.permitForm.errorApplicantName).should(
        'contain',
        PERMIT_FORM_ERRORS.invalidDescription
      );
    });

    it('should clear error when a valid name is entered', () => {
      cy.get(selectors.permitForm.inputApplicant).type(
        createThisProduct.applicantName
      );
      cy.get(selectors.permitForm.errorApplicantName).should('not.exist');
    });

    it('should show error for a description longer than the defined max length', () => {
      cy.get(selectors.permitForm.inputApplicant)
        .invoke('val', 'a'.repeat(PERMIT_FORM_CONSTRAINTS.descMaxLength + 1))
        .trigger('input');
      clickSubmitButton();
      cy.get(selectors.permitForm.errorApplicantName).should(
        'contain',
        PERMIT_FORM_ERRORS.invalidDescription
      );
      cy.get(selectors.permitForm.inputApplicant).type('{backspace}');
      clickSubmitButton();
      cy.get(selectors.permitForm.errorApplicantName).should('not.exist');
    });
  });

  describe('Price Field Validation', () => {
    it('should show required error when left empty', () => {
      clickSubmitButton();
      cy.get(selectors.permitForm.errorPermitType).should(
        'contain',
        PERMIT_FORM_ERRORS.invalidPrice
      );
    });

    it('should show error when price is not a number', () => {
      cy.get(selectors.permitForm.inputPermitType).type('abc');
      clickSubmitButton();
      cy.get(selectors.permitForm.errorPermitType).should(
        'contain',
        PERMIT_FORM_ERRORS.invalidPrice
      );
    });

    it('should accept a valid price', () => {
      cy.get(selectors.permitForm.inputPermitType).type(
        createThisProduct.permitType
      );
      clickSubmitButton();
      cy.get(selectors.permitForm.errorPermitType).should('not.exist');
    });
  });
});

describe('New Item Validation: Test form eror validation when creating a new item', () => {
  beforeEach(() => {
    cy.visit(uiServer);
    clickNewProductButton();
    cy.get(submitButtonSelector).click();
    cy.get(selectors.permitForm.errorPermitName).should('exist');
    cy.get(selectors.permitForm.errorApplicantName).should('exist');
    cy.get(selectors.permitForm.errorPermitType).should('exist');
    cy.get(selectors.permitForm.errorPermitStatus).should('exist');
  });

  it('Correct the name and make sure the error is fixed', () => {
    cy.get(selectors.permitForm.errorPermitName).should('exist');
    cy.get(selectors.permitForm.inputPermitName).type('hello');
    cy.get(selectors.permitForm.errorPermitName).should('not.exist');
  });
  it('Correct the name and make sure the error is fixed', () => {
    cy.get(selectors.permitForm.errorPermitName).should('exist');
    cy.get(selectors.permitForm.inputPermitName).type('hello');
    cy.get(selectors.permitForm.errorPermitName).should('not.exist');
  });
});

describe('Paginator Behavior: Navigate between pages and validate the expect items render', () => {
  it('Navigate to page 2 and test that the first element on page the row exists and then navigate back to page one and test that the ', () => {
    const secondPageFirstItem = {
      name: 'Frozen Steel Chips',
      desc: 'Suffragium denuo decor. Adhaero concedo vinitor. Corporis perspiciatis basium asper conturbo urbanus dolor. Virga totam commodi voluptas votum. Sollicito cultura causa agnitio celer cernuus. Audacia viriliter ambulo quibusdam decimus curriculum.',
      price: '$372.69',
      quantity: '3',
    };

    cy.visit(uiServer);
    validateElementOnFirstPage();

    navigateToPaginationPage(PAGINATION.PAGINATION_SELECTORS.NEXT);
    validateRow(
      0,
      secondPageFirstItem.name,
      secondPageFirstItem.desc,
      secondPageFirstItem.price,
      secondPageFirstItem.quantity
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
    cy.get('mat-paginator[aria-label="Inventory table pagination controls"]')
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
      'Fantastic Concrete Sausages',
      'Illo suasoria verecundia nobis candidus. Tergiversatio averto tracto delego tergum capio concedo viriliter. Terebro sto bardus deludo tolero spero absconditus alias. Vinco deprecator centum contra bene.',
      '$421.70',
      '46'
    );
  });

  it('shows expected content with 4 items per page', () => {
    visitAppAndSetPageSize(4);
    validateRow(
      3,
      'Frozen Granite Table',
      'Magni timor cruentus suus arto. Uredo vorago ager cursus bardus defendo infit. Clibanus vestigium modi. Tardus talis administratio suggero tumultus asperiores. Cito cohibeo sono amoveo sono valens subito decerno debitis. Maxime ago nostrum tot conduco vestigium tandem natus tantillus.',
      '$80.00',
      '91'
    );
  });

  it('shows expected content with 2 items per page', () => {
    visitAppAndSetPageSize(2);
    validateRow(
      1,
      'Generic Gold Table',
      'Quia ancilla comes cuppedia usitas casso denuncio. Earum placeat animi trepide pax impedit conicio cognomen cur stabilis. Dolore sortitus occaecati quibusdam spero turbo agnosco tenax careo autem. Allatus vae quis supra acceptus paens iusto. Argumentum sub comis stultus. Creta vespillo turba contabesco adimpleo cogo cubicularis.',
      '$705.29',
      '77'
    );
  });

  it('shows expected content with 6 items per page', () => {
    visitAppAndSetPageSize(6);
    validateRow(
      5,
      'Elegant Marble Ball',
      'Tenus natus ambulo subseco solvo admiratio textor earum cursim tertius. Denique attonbitus commemoro tutis audentia cur. Capillus veritatis versus aliqua delectus desipio combibo adiuvo carbo allatus. Timor vehemens adimpleo cogito. Fugit quidem abscido deorsum voveo corrupti alo deinde vix congregatio.',
      '$799.19',
      '45'
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

describe('Test mat table columns and features', () => {
  it('tests that mat table components, elements, associated features (pagination, etc.), etc. renders on the page.', () => {
    cy.visit(uiServer);
    cy.get('[data-testid="inventory-table"]').should('exist');
    cy.get('[data-testid="inventory-table-name-header"]').should('exist');
    cy.get('[data-testid="inventory-table-description-header"]').should(
      'exist'
    );
    cy.get('[data-testid="inventory-table-price-header"]').should('exist');
    cy.get('[data-testid="inventory-table-quantity-header"]').should('exist');
    cy.get('[data-testid="inventory-table-update-header"]').should('exist');
    cy.get('[data-testid="inventory-table-delete-header"]').should('exist');
  });

  it('test the table column structure', () => {
    cy.visit(uiServer);
    cy.get('[data-testid="inventory-table"] th[mat-header-cell]').should(
      'have.length',
      6
    );

    cy.get('[data-testid="inventory-table"] th')
      .should('contain.text', 'Name')
      .and('contain.text', 'Price')
      .and('contain.text', 'Quantity')
      .and('contain.text', 'Update')
      .and('contain.text', 'Delete');
  });
});
function validateRow(
  index: number,
  name: string,
  description: string,
  price: string,
  quantity: string
) {
  console.log('validating row');
  cy.contains(selectors.permitRowName(index), name).should('exist');
  cy.contains(selectors.permitRowApplicantName(index), description).should(
    'exist'
  );
  cy.contains(selectors.permitRowPermitType(index), price).should('exist');
  cy.contains(selectors.productRowStatus(index), quantity).should('exist');
  console.log('done validating row');
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
    'Fantastic Ceramic Gloves',
    'Totus contego cupiditas ante catena. Dolorum coniecto labore vulpes ulterius adinventitias sordeo. Suffoco adipisci caries adulatio stella ancilla voro. Quisquam blanditiis agnosco decet ubi tabgo dolore reprehenderit ustilo. Audio viscus laboriosam vorago. Voluptas amaritudo atrocitas excepturi labore pax vulgo modi.',
    '$884.29',
    '8'
  );
}

function validateElementOnFirstPage() {
  validateRow(
    0,
    'Practical Concrete Cheese',
    'Curo vomer stillicidium denique cruciamentum conicio suspendo decens. Cubicularis taceo auctor. Exercitationem exercitationem reiciendis ulciscor. Perferendis suppono commodi conturbo calco claudeo quos aliquam.',
    '$434.29',
    '43'
  );
}

function validateNewItemExists() {
  validateRow(
    0,
    createThisProduct.permitName,
    createThisProduct.applicantName,
    `\$${createThisProduct.permitType}`,
    `${createThisProduct.status}`
  );
}

function validateDeleteMeItemExists() {
  validateRow(
    0,
    deleteThisPermit.permitName,
    deleteThisPermit.applicantName,
    `\$${deleteThisPermit.permitType}`,
    `${deleteThisPermit.status}`
  );
}
