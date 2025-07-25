package com.permittrack.permitapi.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.permittrack.permitapi.model.Permit;

@DataJpaTest
@ActiveProfiles("test")
public class PermitRepositoryH2IT {

    @Autowired
    private PermitRepository permitRepository;

    @Test
    void testCreateAndFindPermit() {
        // Arrange
        Permit permit = new Permit();
        permit.setPermitName("Jane Doe");
        permit.setPermitType("Electrical");
        permit.setStatus("SUBMITTED");
        permit.setSubmittedDate(LocalDateTime.now());

        // Act
        Permit saved = permitRepository.save(permit);
        Permit found = permitRepository.findById(saved.getId()).orElseThrow();

        // Assert
        assertThat(found.getPermitName()).isEqualTo("Jane Doe");
        assertThat(found.getPermitType()).isEqualTo("Electrical");
    }
}
