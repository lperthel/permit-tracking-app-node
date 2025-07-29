package com.permittrack.permitapi.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

public class PermitRequestDTOTest {

        private Validator validator;

        @BeforeEach
        void setUp() {
                ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
                validator = factory.getValidator();
        }

        @Test
        void validDTO_passesValidation() {
                PermitRequestDTO dto = PermitRequestDTO.builder()
                                .permitName("a".repeat(100))
                                .applicantName("a".repeat(
                                                100))
                                .permitType("a".repeat(
                                                50))
                                .status(PermitStatus.SUBMITTED)
                                .build();

                Set<ConstraintViolation<PermitRequestDTO>> violations = validator.validate(dto);
                assertThat(violations).isEmpty();
        }

        @Test
        void missingRequiredFields_failsValidation() {
                PermitRequestDTO dto = new PermitRequestDTO(); // all fields null

                Set<ConstraintViolation<PermitRequestDTO>> violations = validator.validate(dto);

                assertThat(violations).extracting("propertyPath").extracting(Object::toString)
                                .containsExactlyInAnyOrder("permitName", "applicantName", "permitType", "status");
        }

        @Test
        void overlongFields_triggerSizeErrors() {
                String longString = "a".repeat(101);
                PermitRequestDTO dto = PermitRequestDTO.builder()
                                .permitName(longString)
                                .applicantName(longString)
                                .permitType("ValidType")
                                .status(PermitStatus.SUBMITTED)
                                .build();

                Set<ConstraintViolation<PermitRequestDTO>> violations = validator.validate(dto);
                assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("permitName"));
                assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("applicantName"));
        }

        @Test
        void invalidCharacters_triggerPatternViolation() {
                PermitRequestDTO dto = PermitRequestDTO.builder()
                                .permitName("<script>")
                                .applicantName("Jane$Doe")
                                .permitType("123!!")
                                .status(PermitStatus.SUBMITTED)
                                .build();

                Set<ConstraintViolation<PermitRequestDTO>> violations = validator.validate(dto);

                assertThat(violations)
                                .anySatisfy(v -> assertThat(v.getMessage())
                                                .contains("only letters, numbers, spaces, dashes"));
        }

        @Test
        void nullStatus_isRejected() {
                PermitRequestDTO dto = new PermitRequestDTO();
                dto.setPermitName("Test");
                dto.setApplicantName("John Doe");
                dto.setPermitType("Standard");
                dto.setStatus(null); // status is now required

                Set<ConstraintViolation<PermitRequestDTO>> violations = validator.validate(dto);

                // ✅ Expect a single violation for "status"
                assertThat(violations)
                                .extracting(ConstraintViolation::getPropertyPath)
                                .map(Object::toString)
                                .contains("status");
        }

}
