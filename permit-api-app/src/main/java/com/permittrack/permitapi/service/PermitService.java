package com.permittrack.permitapi.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.permittrack.permitapi.model.Permit;
import com.permittrack.permitapi.repository.PermitRepository;

/**
 * Service layer for handling business logic related to Permits.
 * 
 * Provides methods for creating, retrieving, updating, and deleting permits.
 * Acts as a bridge between the controller layer and the data access layer.
 */
@Service
public class PermitService {

    private final PermitRepository permitRepository;

    public PermitService(PermitRepository permitRepository) {
        this.permitRepository = permitRepository;
    }

    public Permit createPermit(Permit permit) {
        return permitRepository.save(permit);
    }

    public Optional<Permit> getPermit(UUID id) {
        return permitRepository.findById(id);
    }

    public List<Permit> listPermits() {
        return permitRepository.findAll();
    }

    public Optional<Permit> updatePermit(UUID id, Permit updatedPermit) {
        return permitRepository.findById(id).map(existing -> {
            // Update fields here; modify based on your Permit fields
            existing.setPermitType(updatedPermit.getPermitType());
            existing.setStatus(updatedPermit.getStatus());
            existing.setPermitName(updatedPermit.getPermitName());
            return permitRepository.save(existing);
        });
    }

    public boolean deletePermit(UUID id) {
        if (permitRepository.existsById(id)) {
            permitRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }
}
