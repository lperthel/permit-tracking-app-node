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
                .status("SUBMITTED")
                .build();

        Set<ConstraintViolation<PermitRequestDTO>> violations = validator.validate(dto);
        assertThat(violations).isEmpty();
    }

    @Test
    void missingRequiredFields_failsValidation() {
        PermitRequestDTO dto = new PermitRequestDTO(); // all fields null

        Set<ConstraintViolation<PermitRequestDTO>> violations = validator.validate(dto);

        assertThat(violations).extracting("propertyPath").extracting(Object::toString)
                .containsExactlyInAnyOrder("permitName", "applicantName", "permitType");
    }

    @Test
    void overlongFields_triggerSizeErrors() {
        String longString = "a".repeat(101);
        PermitRequestDTO dto = PermitRequestDTO.builder()
                .permitName(longString)
                .applicantName(longString)
                .permitType("ValidType")
                .status("SUBMITTED")
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
                .status("SUBMITTED")
                .build();

        Set<ConstraintViolation<PermitRequestDTO>> violations = validator.validate(dto);

        assertThat(violations)
                .anySatisfy(v -> assertThat(v.getMessage()).contains("only letters, numbers, spaces, dashes"));
    }

    @Test
    void invalidStatus_failsValidation() {
        PermitRequestDTO dto = PermitRequestDTO.builder()
                .permitName("Demo")
                .applicantName("Valid Name")
                .permitType("Standard")
                .status("UNKNOWN")
                .build();

        Set<ConstraintViolation<PermitRequestDTO>> violations = validator.validate(dto);

        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("status"));
    }

    @Test
    void nullStatus_isAllowed() {
        PermitRequestDTO dto = PermitRequestDTO.builder()
                .permitName("Test")
                .applicantName("Name")
                .permitType("Electrical")
                .status(null)
                .build();

        Set<ConstraintViolation<PermitRequestDTO>> violations = validator.validate(dto);

        assertThat(violations).isEmpty(); // status is optional
    }
}
