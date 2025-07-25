package com.permittrack.permitapi.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.permittrack.permitapi.model.Permit;
import com.permittrack.permitapi.service.PermitService;

/**
 * REST controller for managing Permit resources.
 * 
 * Exposes endpoints to create, retrieve, update, and delete permits.
 * Communicates with the PermitService layer to perform business logic.
 */
@RestController
@RequestMapping("/permits")
public class PermitController {

    private final PermitService permitService;

    public PermitController(PermitService permitService) {
        this.permitService = permitService;
    }

    @PostMapping
    public ResponseEntity<Permit> createPermit(@RequestBody Permit permit) {
        Permit created = permitService.createPermit(permit);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Permit> getPermit(@PathVariable UUID id) {
        return permitService.getPermit(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<Permit> listPermits() {
        return permitService.listPermits();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Permit> updatePermit(@PathVariable UUID id, @RequestBody Permit permit) {
        return permitService.updatePermit(id, permit)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePermit(@PathVariable UUID id) {
        boolean deleted = permitService.deletePermit(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
