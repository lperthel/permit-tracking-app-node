package com.permittrack.permitapi.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.permittrack.permitapi.model.PermitEntity;

@DataJpaTest
@ActiveProfiles("test")
public class PermitRepositoryH2IT {

    @Autowired
    private PermitRepository permitRepository;

    @Test
    void testCreateAndFindPermit() {
        // Arrange
        PermitEntity permit = new PermitEntity();
        permit.setApplicantName("Jane Doe");
        permit.setPermitType("Electrical");
        permit.setStatus("SUBMITTED");
        permit.setSubmittedDate(LocalDateTime.now());

        // Act
        PermitEntity saved = permitRepository.save(permit);
        PermitEntity found = permitRepository.findById(saved.getId()).orElseThrow();

        // Assert
        assertThat(found.getApplicantName()).isEqualTo("Jane Doe");
        assertThat(found.getPermitType()).isEqualTo("Electrical");
    }
}
