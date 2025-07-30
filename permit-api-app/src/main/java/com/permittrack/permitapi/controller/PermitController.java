package com.permittrack.permitapi.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.permittrack.permitapi.model.PermitRequestDTO;
import com.permittrack.permitapi.model.PermitResponseDTO;
import com.permittrack.permitapi.service.PermitService;

import jakarta.validation.Valid;

/**
 * REST controller for managing Permit resources.
 * 
 * Exposes endpoints to create, retrieve, update, and delete permits.
 * Communicates with the PermitService layer to perform business logic.
 */
@Profile("!filter-test")
@RestController
@RequestMapping("/permits")
public class PermitController {

    private final PermitService permitService;

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PermitController.class);

    public PermitController(PermitService permitService) {
        this.permitService = permitService;
    }

    @PostMapping
    public ResponseEntity<PermitResponseDTO> createPermit(@Valid @RequestBody PermitRequestDTO permit) {
        log.info(">>> REAL PermitController#createPermit invoked <<<"); // ✅ Debug log

        PermitResponseDTO created = permitService.createPermit(permit);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PermitResponseDTO> getPermit(@PathVariable UUID id) {
        return ResponseEntity.ok(permitService.getPermit(id));
    }

    @GetMapping
    public List<PermitResponseDTO> listPermits(@RequestParam int page) {
        return permitService.listPermits();
    }

    @PutMapping("/{id}")
    public ResponseEntity<PermitResponseDTO> updatePermit(@PathVariable UUID id,
            @Valid @RequestBody PermitRequestDTO permit) {
        PermitResponseDTO updated = permitService.updatePermit(id, permit);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePermit(@PathVariable UUID id) {
        permitService.deletePermit(id);
        return ResponseEntity.noContent().build();
    }
}
