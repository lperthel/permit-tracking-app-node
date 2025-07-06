import {
  APP_DESCRIPTION_ENCODED,
  APP_HEADER,
} from '../../src/app/assets/constants/app-description';

import { Product } from '../../src/app/products/product/product.model';
import { ProductForm } from '../../src/app/products/product-form/product-form.model';
import { PRODUCT_FORM_ERRORS } from '../../src/app/products/product-form/product-form-constants';

enum paginationPage {
  First = 'pagination-first',
  Prev = 'pagination-prev',
  Next = 'pagination-next',
  Last = 'pagination-last',
}

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
    .click();
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

describe('Product Modal', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/');
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
    cy.get('[data-testid="input-name"]').should('exist');
    cy.get('[data-testid="input-description"]').should('exist');
    cy.get('[data-testid="input-price"]').should('exist');
    cy.get('[data-testid="input-quantity"]').should('exist');
    cy.get('[data-testid="submit-button"]').should('exist');
  });

  it('should show error messages when fields are invalid', () => {
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[data-testid="error-name"]').should('exist');
    cy.get('[data-testid="error-description"]').should('exist');
    cy.get('[data-testid="error-price"]').should('exist');
    cy.get('[data-testid="error-quantity"]').should('exist');
  });
});

describe('New Item Form Validation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/');
    clickButton('new-product-button');
  });

  describe('Name Field Validation', () => {
    it('should show required error when left empty', () => {
      clickButton('submit-button');
      cy.get('[data-testid="error-name"]').should(
        'contain',
        PRODUCT_FORM_ERRORS.invalidName
      );
    });

    it('should clear error when a valid name is entered', () => {
      cy.get('[data-testid="input-name"]').type('New Product');
      cy.get('[data-testid="error-name"]').should('not.exist');
    });

    it('should show error for name longer than 50 characters', () => {
      cy.get('[data-testid="input-name"]').type('a'.repeat(51));
      clickButton('submit-button');
      cy.get('[data-testid="error-name"]').should(
        'contain',
        PRODUCT_FORM_ERRORS.invalidName
      );
      cy.get('[data-testid="input-name"]').type('{backspace}');
      clickButton('submit-button');
      cy.get('[data-testid="error-name"]').should('not.exist');
    });
  });

  describe('Price Field Validation', () => {
    it('should show required error when left empty', () => {
      clickButton('submit-button');
      cy.get('[data-testid="error-price"]').should(
        'contain',
        'Price is required'
      );
    });

    it('should show error when price is not a number', () => {
      cy.get('[data-testid="input-price"]').type('abc');
      clickButton('submit-button');
      cy.get('[data-testid="error-price"]').should(
        'contain',
        'Enter a valid number'
      );
    });

    it('should accept a valid price', () => {
      cy.get('[data-testid="input-price"]').type('19.99');
      clickButton('submit-button');
      cy.get('[data-testid="error-price"]').should('not.exist');
    });
  });

  // Repeat for other fields...
});

describe('New Item Validation: Test form eror validation when creating a new item', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/');
    clickButton('new-product-button');
    //Submit an empty form and validate errors
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[data-testid="error-name"]').should('exist');
    cy.get('[data-testid="error-description"]').should('exist');
    cy.get('[data-testid="error-price"]').should('exist');
    cy.get('[data-testid="error-quantity"]').should('exist');
  });

  it('Correct the name and make sure the error is fixed', () => {
    cy.get('[data-testid="error-name"]').should('exist');
    cy.get('[data-testid="input-name"]').type('hello');
    cy.get('[data-testid="error-name"]').should('not.exist');
  });
  it('Correct the name and make sure the error is fixed', () => {
    cy.get('[data-testid="error-name"]').should('exist');
    cy.get('[data-testid="input-name"]').type('hello');
    cy.get('[data-testid="error-name"]').should('not.exist');
  });
});

// cy.get('[data-testid="input-name"]').should('exist');
//   cy.get('[data-testid="input-description"]').should('exist');
//   cy.get('[data-testid="input-price"]').should('exist');
//   cy.get('[data-testid="input-quantity"]').should('exist');
//   cy.get('[data-testid="submit-button"]').should('exist');

describe('CRUD Behavior: Test Adding a new Item', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/');
    clickButton('new-product-button');
  });

  it.skip('Add an item and check that it renders at the end of the table', () => {
    cy.get('[data-testid="input-name"]').type(newProduct.name);
    cy.get('[data-testid="input-description"]').type(newProduct.description);
    cy.get('[data-testid="input-price"]').type(newProduct.price);
    cy.get('[data-testid="input-quantity"]').type(`${newProduct.quantity}`);

    clickButton('submit-button');

    navigateToPaginationPage(paginationPage.Last);

    validateRow(
      0,
      newProduct.name,
      newProduct.description,
      `\$${newProduct.price}`,
      `${newProduct.quantity}`
    );
  });
});

describe.skip('Paginator Behavior: Navigate between pages and validate the expect items render', () => {
  const visitAppAndNavigateToNextPage = (dataTestId: string) => {
    cy.visit('http://localhost:4200/');
    navigateToPaginationPage(dataTestId);
  };

  it('Navigate to page 2 and test that the first element on page the row exists and then navigate back to page one and test that the ', () => {
    cy.visit('http://localhost:4200/');
    visitAppAndNavigateToNextPage(paginationPage.Next);
    validateRow(
      0,
      'Frozen Steel Chips',
      'Suffragium denuo decor. Adhaero concedo vinitor. Corporis perspiciatis basium asper conturbo urbanus dolor. Virga totam commodi voluptas votum. Sollicito cultura causa agnitio celer cernuus. Audacia viriliter ambulo quibusdam decimus curriculum.',
      '$372.69',
      '3'
    );
    navigateToPaginationPage(paginationPage.Prev);
    validateElementOnFirstPage();
  });
  it('Navigate to the last page and test that the first element on page the row exists', () => {
    cy.visit('http://localhost:4200/');
    visitAppAndNavigateToNextPage(paginationPage.Last);
    validateRow(
      0,
      'Fantastic Ceramic Gloves',
      'Totus contego cupiditas ante catena. Dolorum coniecto labore vulpes ulterius adinventitias sordeo. Suffoco adipisci caries adulatio stella ancilla voro. Quisquam blanditiis agnosco decet ubi tabgo dolore reprehenderit ustilo. Audio viscus laboriosam vorago. Voluptas amaritudo atrocitas excepturi labore pax vulgo modi.',
      '$884.29',
      '8'
    );
    navigateToPaginationPage(paginationPage.First);
    validateElementOnFirstPage();
  });
});

describe.skip('Paginator Behavior: Change items per page and validate table content', () => {
  const visitAppAndSetPageSize = (pageSize: number) => {
    cy.visit('http://localhost:4200/');
    cy.get('mat-paginator[aria-label="Inventory table pagination controls"]')
      .find('mat-select')
      .click({ force: true });
    cy.get('mat-option').contains(`${pageSize}`).click({ force: true });
  };

  it('Tests that the first element in the row exists', () => {
    cy.visit('http://localhost:4200/');
    validateElementOnFirstPage();
  });
  it('shows expected content when using default 10 items per page', () => {
    cy.visit('http://localhost:4200/');
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

describe.skip('Test landing page rendering and header', () => {
  it('Visits the initial landing page and test that the header and description render', () => {
    cy.visit('http://localhost:4200/');
    cy.contains(APP_HEADER.trim()).should('exist');
    cy.contains(APP_DESCRIPTION_ENCODED.replace(/\s+/g, ' ').trim()).should(
      'exist'
    );
  });
});

describe.skip('Test mat table columns and features', () => {
  it('tests that mat table components, elements, associated features (pagination, etc.), etc. renders on the page.', () => {
    cy.visit('http://localhost:4200/');
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
    cy.visit('http://localhost:4200/');
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
