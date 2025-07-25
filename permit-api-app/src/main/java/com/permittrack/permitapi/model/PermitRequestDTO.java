package com.permittrack.permitapi.model;

import jakarta.validation.constraints.NotBlank;
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
    private String permitName;

    @NotBlank(message = "Applicant name is required")
    private String applicantName;

    @NotBlank(message = "Permit type is required")
    private String permitType;

    private String status;

}
