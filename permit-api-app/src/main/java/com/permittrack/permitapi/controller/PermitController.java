package com.permittrack.permitapi.controller;

import com.permittrack.permitapi.model.PermitRequestDTO;
import com.permittrack.permitapi.model.PermitResponseDTO;
import com.permittrack.permitapi.service.PermitService;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing Permit resources.
 * <p>
 * Exposes endpoints to create, retrieve, update, and delete permits.
 * Communicates with the PermitService layer to perform business logic.
 */
@Profile("!filter-test")
@RestController
@RequestMapping("/permits")
public class PermitController {

  private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PermitController.class);
  private final PermitService permitService;

  public PermitController(PermitService permitService) {
    this.permitService = permitService;
  }

  /**
   * Handles HEAD requests for /permits.
   *
   * <h2>Behavior</h2>
   * - Returns 200 OK if the endpoint is reachable
   * - No response body (per HTTP spec)
   * - Useful for health checks, monitoring, or lightweight client validation
   */
  @RequestMapping(method = RequestMethod.HEAD)
  public ResponseEntity<Void> headPermits() {
    return ResponseEntity.ok().build();
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
    log.info(">>> REAL PermitController#deletePermit invoked {} <<<", id); // ✅ Debug log

    permitService.deletePermit(id);
    return ResponseEntity.noContent().build();
  }
}
