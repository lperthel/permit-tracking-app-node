// ============================================================================
// permit-workflows.ts - Complete end-to-end workflows
// ============================================================================

import { PermitStatus } from '../../src/app/permits/shared/models/permit-status.enums';
import { Permit } from '../../src/app/permits/shared/models/permit.model';
import {
  PermitFixtureKeys,
  PermitFixtures,
} from '../fixtures/permits/permit-fixtures';
import { selector_shortcuts } from './ui/cypress-selectors';
import { UiActions } from './ui/ui-actions';

export class PermitWorkflows {
  /**
   * Complete permit creation workflow through UI
   */
  static createPermitThroughUI(permit: Partial<Permit>): void {
    UiActions.clickNewPermitButton();

    if (permit.permitName) {
      cy.get(selector_shortcuts.permitForm.inputPermitName)
        .clear()
        .type(permit.permitName);
    }
    if (permit.applicantName) {
      cy.get(selector_shortcuts.permitForm.inputApplicant)
        .clear()
        .type(permit.applicantName);
    }
    if (permit.permitType) {
      cy.get(selector_shortcuts.permitForm.inputPermitType)
        .clear()
        .type(permit.permitType);
    }
    if (permit.status) {
      cy.get(selector_shortcuts.permitForm.inputStatus).select(permit.status);
    }

    UiActions.clickSubmitButton();
  }

  /**
   * Complete permit creation workflow using fixture
   */
  static createPermitFromFixture(fixtureName: PermitFixtureKeys): void {
    PermitFixtures.getPermitFormData(fixtureName).then((permitData) => {
      this.createPermitThroughUI({
        permitName: permitData.permitName,
        applicantName: permitData.applicantName,
        permitType: permitData.permitType,
        status: permitData.status as PermitStatus,
      });
    });
  }

  /**
   * Complete permit update workflow
   */
  static updatePermit(rowIndex: number, updatedData: Partial<Permit>): void {
    cy.get(selector_shortcuts.permitRowUpdate(rowIndex)).click();

    if (updatedData.permitName) {
      cy.get(selector_shortcuts.permitForm.inputPermitName)
        .clear()
        .type(updatedData.permitName);
    }
    if (updatedData.applicantName) {
      cy.get(selector_shortcuts.permitForm.inputApplicant)
        .clear()
        .type(updatedData.applicantName);
    }
    if (updatedData.permitType) {
      cy.get(selector_shortcuts.permitForm.inputPermitType)
        .clear()
        .type(updatedData.permitType);
    }
    if (updatedData.status) {
      cy.get(selector_shortcuts.permitForm.inputStatus).select(
        updatedData.status
      );
    }

    UiActions.clickSubmitButton();
  }

  /**
   * Complete permit deletion workflow
   */
  static deletePermit(rowIndex: number): void {
    cy.get(selector_shortcuts.permitRowDelete(rowIndex)).click();
  }
}
