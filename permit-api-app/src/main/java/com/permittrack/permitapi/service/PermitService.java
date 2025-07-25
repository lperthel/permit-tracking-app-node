package com.permittrack.permitapi.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

    private final PermitRepository permitRepository;

    public PermitService(PermitRepository permitRepository) {
        this.permitRepository = permitRepository;
    }

    /**
     * Creates a new permit based on a validated DTO.
     */
    public PermitResponseDTO createPermit(PermitRequestDTO request) {
        PermitEntity entity = PermitMapper.toEntity(request);
        PermitEntity saved = permitRepository.save(entity);
        return new PermitResponseDTO(saved);
    }

    /**
     * Retrieves a permit by ID and converts it to a response DTO.
     */
    public PermitResponseDTO getPermit(UUID id) {
        PermitEntity existing = permitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permit with ID " + id + " not found"));
        return new PermitResponseDTO(existing);
    }

    /**
     * Lists all permits, converting each to a response DTO.
     */
    public List<PermitResponseDTO> listPermits() {
        return permitRepository.findAll()
                .stream()
                .map(PermitResponseDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Updates an existing permit using a validated DTO.
     */
    public PermitResponseDTO updatePermit(UUID id, PermitRequestDTO request) {
        PermitEntity existing = permitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permit with ID " + id + " not found"));

        PermitMapper.updateEntityFromDto(existing, request);
        PermitEntity saved = permitRepository.save(existing);
        return new PermitResponseDTO(saved);
    }

    /**
     * Deletes a permit by ID.
     */
    public boolean deletePermit(UUID id) {
        if (!permitRepository.existsById(id)) {
            throw new ResourceNotFoundException("Permit with ID " + id + " not found");
        }
        permitRepository.deleteById(id);
        return true;
    }
}
