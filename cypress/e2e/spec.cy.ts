import {
  APP_DESCRIPTION_ENCODED,
  APP_HEADER,
} from '../../src/app/assets/constants/app-description';
import { Product } from '../../src/app/products/product/product.model';
import { ProductForm } from '../../src/app/products/product-form/product-form.model';
import {
  PRODUCT_FORM_CONSTRAINTS,
  PRODUCT_FORM_ERRORS,
} from '../../src/app/products/product-form/product-form-constants';

const paginationPage = {
  first: 'pagination-first',
  prev: 'pagination-prev',
  next: 'pagination-next',
  last: 'pagination-last',
};

const DATA_TESTIDS = {
  inputName: '[data-testid="input-name"]',
  inputDesc: '[data-testid="input-description"]',
  inputPrice: '[data-testid="input-price"]',
  inputQuantity: '[data-testid="input-quantity"]',
};

const ERROR_TESTIDS = {
  errorName: '[data-testid="error-name"]',
  errorDesc: '[data-testid="error-description"]',
  errorPrice: '[data-testid="error-price"]',
  errorQuantity: '[data-testid="error-quantity"]',
};

const apiServer = 'http://localhost:3000';
const uiServer = 'http://localhost:4200/';

const clickButton = (dataTestId: string) => {
  cy.get(`[data-testid="${dataTestId}"]`).click();
};

const validateElementOnFirstPage = () => {
  validateRow(
    0,
    'Practical Concrete Cheese',
    'Curo vomer stillicidium denique cruciamentum conicio suspendo decens. Cubicularis taceo auctor. Exercitationem exercitationem reiciendis ulciscor. Perferendis suppono commodi conturbo calco claudeo quos aliquam.',
    '$434.29',
    '43'
  );
};

const navigateToPaginationPage = (dataTestId: string) => {
  cy.get('mat-paginator[aria-label="Inventory table pagination controls"]')
    .find(`[data-testid="${dataTestId}"]`)
    .click({ force: true });
};

const newProduct: Product = {
  id: '223423',
  name: 'New Product',
  description: 'This is an Product added by a cypress integration Test',
  price: '799.19',
  quantity: 4,
};

const validateRow = (
  index: number,
  name: string,
  description: string,
  price: string,
  quantity: string
) => {
  cy.contains(`[data-testid="inventory-table-name-cell${index}"]`, name).should(
    'exist'
  );
  cy.contains(
    `[data-testid="inventory-table-description-cell${index}"]`,
    description
  ).should('exist');
  cy.contains(
    `[data-testid="inventory-table-price-cell${index}"]`,
    price
  ).should('exist');
  cy.contains(
    `[data-testid="inventory-table-quantity-cell${index}"]`,
    quantity
  ).should('exist');
};
const au = DATA_TESTIDS.inputName;
const newLocal = DATA_TESTIDS.inputName;
describe('CRUD Behavior: Test Adding a new Item', () => {
  beforeEach(() => {
    cy.visit(uiServer);
    clickButton('new-product-button');
  });

  it('Add an item and check that it renders at the end of the table', () => {
    let productId;
    DATA_TESTIDS.inputDesc;
    cy.get(newLocal).type(newProduct.name);
    cy.get(DATA_TESTIDS.inputDesc).type(newProduct.description);
    cy.get(DATA_TESTIDS.inputPrice).type(newProduct.price);
    cy.get(DATA_TESTIDS.inputQuantity).type(`${newProduct.quantity}`);

    clickButton('submit-button');

    navigateToPaginationPage(paginationPage.last);

    validateRow(
      0,
      newProduct.name,
      newProduct.description,
      `\$${newProduct.price}`,
      `${newProduct.quantity}`
    );

    cy.contains('td', newProduct.name)
      .invoke('attr', 'data-id') //invoke tells cypress to call element.getAttribute('data-id')
      .then((id) => {
        console.log(`productId = ${id}`);
        productId = id;
        cy.request('DELETE', `${apiServer}/products/${productId}`).then(
          (res) => {
            expect(res.status).to.eq(200);
          }
        );
      });
  });
});

describe('Product Modal', () => {
  beforeEach(() => {
    cy.visit(uiServer);
    clickButton('new-product-button');
    cy.get('[data-testid="modal-header"]').should('exist'); // ensure modal is open
  });

  it('should render all required elements', () => {
    cy.get('[data-testid="modal-title"]').should(
      'contain.text',
      'Profile update'
    );
    cy.get('[data-testid="modal-close-button"]').should('exist');
    cy.get('[data-testid="product-form"]').should('exist');
    cy.get(DATA_TESTIDS.inputName).should('exist');
    cy.get(DATA_TESTIDS.inputDesc).should('exist');
    cy.get(DATA_TESTIDS.inputPrice).should('exist');
    cy.get(DATA_TESTIDS.inputQuantity).should('exist');
    cy.get('[data-testid="submit-button"]').should('exist');
  });

  it('should show error messages when fields are invalid', () => {
    cy.get('[data-testid="submit-button"]').click();
    cy.get(ERROR_TESTIDS.errorName).should('exist');
    cy.get(ERROR_TESTIDS.errorDesc).should('exist');
    cy.get(ERROR_TESTIDS.errorPrice).should('exist');
    cy.get(ERROR_TESTIDS.errorQuantity).should('exist');
  });
});

describe('New Item Form Validation', () => {
  beforeEach(() => {
    cy.visit(uiServer);
    clickButton('new-product-button');
  });

  describe('Name Field Validation', () => {
    it('should show required error when left empty', () => {
      clickButton('submit-button');
      cy.get(ERROR_TESTIDS.errorName).should(
        'contain',
        PRODUCT_FORM_ERRORS.invalidName
      );
    });

    it('should clear error when a valid name is entered', () => {
      cy.get(DATA_TESTIDS.inputName).type(newProduct.name);
      cy.get(ERROR_TESTIDS.errorName).should('not.exist');
    });

    it('should show error for name longer than 50 characters', () => {
      cy.get(DATA_TESTIDS.inputName).type('a'.repeat(51));
      clickButton('submit-button');
      cy.get(ERROR_TESTIDS.errorName).should(
        'contain',
        PRODUCT_FORM_ERRORS.invalidName
      );
      cy.get(DATA_TESTIDS.inputName).type('{backspace}');
      clickButton('submit-button');
      cy.get(ERROR_TESTIDS.errorName).should('not.exist');
    });
  });

  describe('Description Field Validation', () => {
    it('should show required error when left empty', () => {
      clickButton('submit-button');
      cy.get(ERROR_TESTIDS.errorDesc).should(
        'contain',
        PRODUCT_FORM_ERRORS.invalidDescription
      );
    });

    it('should clear error when a valid name is entered', () => {
      cy.get(DATA_TESTIDS.inputDesc).type(newProduct.description);
      cy.get(ERROR_TESTIDS.errorDesc).should('not.exist');
    });

    it('should show error for a description longer than the defined max length', () => {
      cy.get(DATA_TESTIDS.inputDesc).type(
        'a'.repeat(PRODUCT_FORM_CONSTRAINTS.descMaxLength + 1)
      );
      clickButton('submit-button');
      cy.get(ERROR_TESTIDS.errorDesc).should(
        'contain',
        PRODUCT_FORM_ERRORS.invalidDescription
      );
      cy.get(DATA_TESTIDS.inputDesc).type('{backspace}');
      clickButton('submit-button');
      cy.get(ERROR_TESTIDS.errorDesc).should('not.exist');
    });
  });

  describe('Price Field Validation', () => {
    it('should show required error when left empty', () => {
      clickButton('submit-button');
      cy.get(ERROR_TESTIDS.errorPrice).should(
        'contain',
        PRODUCT_FORM_ERRORS.invalidPrice
      );
    });

    it('should show error when price is not a number', () => {
      cy.get(DATA_TESTIDS.inputPrice).type('abc');
      clickButton('submit-button');
      cy.get(ERROR_TESTIDS.errorPrice).should(
        'contain',
        PRODUCT_FORM_ERRORS.invalidPrice
      );
    });

    it('should accept a valid price', () => {
      cy.get(DATA_TESTIDS.inputPrice).type(newProduct.price);
      clickButton('submit-button');
      cy.get(ERROR_TESTIDS.errorPrice).should('not.exist');
    });
  });
});

describe('New Item Validation: Test form eror validation when creating a new item', () => {
  beforeEach(() => {
    cy.visit(uiServer);
    clickButton('new-product-button');
    //Submit an empty form and validate errors
    cy.get('[data-testid="submit-button"]').click();
    cy.get(ERROR_TESTIDS.errorName).should('exist');
    cy.get(ERROR_TESTIDS.errorDesc).should('exist');
    cy.get(ERROR_TESTIDS.errorPrice).should('exist');
    cy.get(ERROR_TESTIDS.errorQuantity).should('exist');
  });

  it('Correct the name and make sure the error is fixed', () => {
    cy.get(ERROR_TESTIDS.errorName).should('exist');
    cy.get(DATA_TESTIDS.inputName).type('hello');
    cy.get(ERROR_TESTIDS.errorName).should('not.exist');
  });
  it('Correct the name and make sure the error is fixed', () => {
    cy.get(ERROR_TESTIDS.errorName).should('exist');
    cy.get(DATA_TESTIDS.inputName).type('hello');
    cy.get(ERROR_TESTIDS.errorName).should('not.exist');
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

    navigateToPaginationPage(paginationPage.next);
    validateRow(
      0,
      secondPageFirstItem.name,
      secondPageFirstItem.desc,
      secondPageFirstItem.price,
      secondPageFirstItem.quantity
    );
    navigateToPaginationPage(paginationPage.prev);
    validateElementOnFirstPage();
  });
  it('Navigate to the last page and test that the first element on page the row exists', () => {
    cy.visit(uiServer);
    validateElementOnFirstPage();

    navigateToPaginationPage(paginationPage.last);
    validateRow(
      0,
      'Fantastic Ceramic Gloves',
      'Totus contego cupiditas ante catena. Dolorum coniecto labore vulpes ulterius adinventitias sordeo. Suffoco adipisci caries adulatio stella ancilla voro. Quisquam blanditiis agnosco decet ubi tabgo dolore reprehenderit ustilo. Audio viscus laboriosam vorago. Voluptas amaritudo atrocitas excepturi labore pax vulgo modi.',
      '$884.29',
      '8'
    );
    navigateToPaginationPage(paginationPage.first);
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
    ); // based on your page size

    cy.get('[data-testid="inventory-table"] th')
      .should('contain.text', 'Name')
      .and('contain.text', 'Price')
      .and('contain.text', 'Quantity')
      .and('contain.text', 'Update')
      .and('contain.text', 'Delete');
  });
});
