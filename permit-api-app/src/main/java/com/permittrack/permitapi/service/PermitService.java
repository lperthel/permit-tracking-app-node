package com.permittrack.permitapi.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.permittrack.permitapi.model.PermitEntity;
import com.permittrack.permitapi.model.PermitRequestDTO;
import com.permittrack.permitapi.model.PermitResponseDTO;
import com.permittrack.permitapi.model.ResourceNotFoundException;
import com.permittrack.permitapi.repository.PermitRepository;
import com.permittrack.permitapi.support.PermitMapper;

/**
 * Service layer for handling business logic related to Permits.
 *
 * Uses DTOs to enforce input/output boundaries and prevent over-posting
 * attacks.
 * All mapping logic is delegated to the PermitMapper to keep domain logic
 * clean.
 */
@Service
public class PermitService {

    private static final Logger log = LoggerFactory.getLogger(PermitService.class);

    private final PermitRepository permitRepository;

    public PermitService(PermitRepository permitRepository) {
        this.permitRepository = permitRepository;
    }

    /**
     * Creates a new permit based on a validated DTO.
     */
    public PermitResponseDTO createPermit(PermitRequestDTO request) {
        log.info(
                "Creating new permit request: name={}, type={}, status={}, applicant={}",
                request.getPermitName(),
                request.getPermitType(),
                request.getStatus(),
                request.getApplicantName());

        PermitEntity entity = PermitMapper.toEntity(request);
        PermitEntity saved = permitRepository.save(entity);

        log.info(
                "Permit successfully created: id={}, name={}, type={}, status={}, applicant={}, submittedDate={}",
                saved.getId(),
                saved.getPermitName(),
                saved.getPermitType(),
                saved.getStatus(),
                saved.getApplicantName(),
                saved.getSubmittedDate());
        return new PermitResponseDTO(saved);
    }

    /**
     * Retrieves a permit by ID and converts it to a response DTO.
     */
    public PermitResponseDTO getPermit(UUID id) {
        log.info("Retrieving permit with ID {}", id);

        PermitEntity existing = permitRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Permit with ID {} not found", id);
                    return new ResourceNotFoundException("Permit with ID " + id + " not found");
                });

        log.info(
                "Permit retrieved: id={}, name={}, type={}, status={}, applicant={}, submittedDate={}",
                existing.getId(),
                existing.getPermitName(),
                existing.getPermitType(),
                existing.getStatus(),
                existing.getApplicantName(),
                existing.getSubmittedDate());
        return new PermitResponseDTO(existing);
    }

    /**
     * Lists all permits, converting each to a response DTO.
     */
    public List<PermitResponseDTO> listPermits() {
        log.info("Listing all permits");

        List<PermitResponseDTO> permits = permitRepository.findAll()
                .stream()
                .map(PermitResponseDTO::new)
                .collect(Collectors.toList());

        log.info("Retrieved {} permits", permits.size());
        return permits;
    }

    /**
     * Updates an existing permit using a validated DTO.
     */
    public PermitResponseDTO updatePermit(UUID id, PermitRequestDTO request) {
        log.info(
                "Updating permit {} with new values: name={}, type={}, status={}, applicant={}",
                id,
                request.getPermitName(),
                request.getPermitType(),
                request.getStatus(),
                request.getApplicantName());
        PermitEntity existing = permitRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Cannot update: permit with ID {} not found", id);
                    return new ResourceNotFoundException("Permit with ID " + id + " not found");
                });

        PermitMapper.updateEntityFromDto(existing, request);
        PermitEntity saved = permitRepository.save(existing);

        log.info(
                "Permit successfully updated: id={}, name={}, type={}, status={}, applicant={}, submittedDate={}",
                saved.getId(),
                saved.getPermitName(),
                saved.getPermitType(),
                saved.getStatus(),
                saved.getApplicantName(),
                saved.getSubmittedDate());
        return new PermitResponseDTO(saved);
    }

    /**
     * Deletes a permit by ID.
     */
    public boolean deletePermit(UUID id) {
        log.info("Attempting to delete permit with ID {}", id);

        if (!permitRepository.existsById(id)) {
            log.warn("Cannot delete: permit with ID {} not found", id);
            throw new ResourceNotFoundException("Permit with ID " + id + " not found");
        }

        permitRepository.deleteById(id);
        log.info("Permit with ID {} successfully deleted", id);
        return true;
    }
}
