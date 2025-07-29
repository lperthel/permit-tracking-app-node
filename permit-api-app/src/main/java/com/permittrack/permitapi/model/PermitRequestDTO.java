package com.permittrack.permitapi.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermitRequestDTO {

    @NotBlank(message = "Permit name is required")
    @Size(max = 100, message = "Permit name must be at most 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9 \\-\\.']+$", message = "Permit name: only letters, numbers, spaces, dashes, apostrophes allowed")
    private String permitName;

    @NotBlank(message = "Applicant name is required")
    @Size(max = 100, message = "Applicant name must be at most 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9 \\-\\.']+$", message = "Applicant name: only letters, numbers, spaces, dashes, apostrophes allowed")
    private String applicantName;

    @NotBlank(message = "Permit type is required")
    @Size(max = 50, message = "Permit type must be at most 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9 \\-\\.']+$", message = "Permit type: only letters, numbers, spaces, dashes, apostrophes allowed")
    private String permitType;

    @Pattern(regexp = "^(SUBMITTED|REVIEW|APPROVED|REJECTED)$", message = "Status must be one of: SUBMITTED, REVIEW, APPROVED, REJECTED")
    private String status;
}
