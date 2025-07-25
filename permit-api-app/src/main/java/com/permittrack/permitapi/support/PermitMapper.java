package com.permittrack.permitapi.support;

import java.time.LocalDateTime;

import com.permittrack.permitapi.model.PermitEntity;
import com.permittrack.permitapi.model.PermitRequestDTO;
import com.permittrack.permitapi.model.PermitResponseDTO;

public class PermitMapper {

    /**
     * Converts a validated PermitRequestDTO to a Permit entity.
     * Typically used in service layer.
     */
    public static PermitEntity toEntity(PermitRequestDTO dto) {
        var permit = new PermitEntity();

        permit.setPermitName(dto.getPermitName());
        permit.setApplicantName(dto.getApplicantName());
        permit.setPermitType(dto.getPermitType());
        permit.setSubmittedDate(LocalDateTime.now());
        permit.setStatus("SUBMITTED"); // default status

        return permit;
    }

    public static void updateEntityFromDto(PermitEntity permit, PermitRequestDTO dto) {
        permit.setPermitName(dto.getPermitName());
        permit.setApplicantName(dto.getApplicantName());
        permit.setPermitType(dto.getPermitType());
    }

    /**
     * Converts a Permit entity to a DTO for outbound API responses.
     */
    public static PermitResponseDTO toDto(PermitEntity permit) {
        return new PermitResponseDTO(permit);
    }
}
