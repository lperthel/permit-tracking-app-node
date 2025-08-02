package com.permittrack.permitapi.controller;

import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Profile("filter-test")
@RestController
@RequestMapping("/permits")
public class TestPermitController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(TestPermitController.class);

    @PostMapping(consumes = MediaType.ALL_VALUE)
    public ResponseEntity<String> createPermit(@RequestBody(required = false) byte[] body) {
        log.info(">>> TestPermitController#createPermit invoked, body length={} <<<",
                body != null ? body.length : 0);
        return ResponseEntity.ok("{\"status\":\"ok\"}");
    }

    @GetMapping
    public ResponseEntity<String> listPermits() {
        log.info(">>> TestPermitController#listPermits invoked <<<");
        return ResponseEntity.ok("[]");
    }

    // @DeleteMapping("/{id}")
    // public ResponseEntity<Void> deletePermit(@PathVariable UUID id) {
    // return ResponseEntity.noContent().build();
    // }

}
