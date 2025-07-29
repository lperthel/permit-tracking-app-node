package com.permittrack.permitapi.model;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermitResponseDTO {
    private UUID id;
    private String permitName;
    private String applicantName;
    private String permitType;
    private LocalDateTime submittedDate;
    private PermitStatus status;

    public PermitResponseDTO(PermitEntity permit) {
        this.id = permit.getId();
        this.permitName = permit.getPermitName();
        this.applicantName = permit.getApplicantName();
        this.permitType = permit.getPermitType();
        this.submittedDate = permit.getSubmittedDate();
        this.status = permit.getStatus();
    }

}
