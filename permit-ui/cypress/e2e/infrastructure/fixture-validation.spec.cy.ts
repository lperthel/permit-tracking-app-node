import {
  PermitFixtureKeys,
  PermitFixtures,
} from '../../fixtures/permits/permit-fixtures';

describe('Fixture Data Validation', () => {
  it('should load valid permit fixtures correctly', () => {
    // Verify fixtures are accessible and have correct structure
    PermitFixtures.loadValidPermits().then((permits) => {
      // Verify all expected permits exist
      expect(permits).to.have.property('createThisPermit');
      expect(permits).to.have.property('deleteTestPermit');
      expect(permits).to.have.property('updateTestPermitBefore');
      expect(permits).to.have.property('updateTestPermitAfter');

      // Verify permit structure
      const createPermit = permits.createThisPermit;
      expect(createPermit).to.have.property('permitName');
      expect(createPermit).to.have.property('applicantName');
      expect(createPermit).to.have.property('permitType');
      expect(createPermit).to.have.property('status');

      // Verify data types
      expect(createPermit.permitName).to.be.a('string');
      expect(createPermit.applicantName).to.be.a('string');
      expect(createPermit.permitType).to.be.a('string');
      expect(createPermit.status).to.be.a('string');
    });
  });

  it('should generate unique IDs for permits', () => {
    // Verify that getValidPermit generates unique IDs
    PermitFixtures.getValidPermit(PermitFixtureKeys.CREATE_THIS_PERMIT).then(
      (permit1) => {
        PermitFixtures.getValidPermit('createThisPermit').then((permit2) => {
          // Same permit data but different IDs
          expect(permit1.id).to.not.equal(permit2.id);
          expect(permit1.permitName).to.equal(permit2.permitName);
        });
      }
    );
  });
});
