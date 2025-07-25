package com.permittrack.permitapi.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.permittrack.permitapi.model.PermitEntity;
import com.permittrack.permitapi.model.PermitRequestDTO;
import com.permittrack.permitapi.model.PermitResponseDTO;
import com.permittrack.permitapi.model.ResourceNotFoundException;
import com.permittrack.permitapi.repository.PermitRepository;

class PermitServiceTest {

    private PermitRepository permitRepository;
    private PermitService permitService;
    private UUID id;

    @BeforeEach
    void setup() {
        permitRepository = mock(PermitRepository.class);
        permitService = new PermitService(permitRepository);
        id = UUID.randomUUID();
    }

    @Test
    void testCreatePermit() {
        PermitRequestDTO request = PermitRequestDTO.builder()
                .permitName("Demo Permit")
                .applicantName("Jane Doe")
                .permitType("Electrical")
                .status("SUBMITTED")
                .build();

        PermitEntity saved = PermitEntity.builder()
                .id(id)
                .permitName("Demo Permit")
                .applicantName("Jane Doe")
                .permitType("Electrical")
                .status("SUBMITTED")
                .submittedDate(LocalDateTime.now())
                .build();

        when(permitRepository.save(any(PermitEntity.class))).thenReturn(saved);

        PermitResponseDTO response = permitService.createPermit(request);

        assertThat(response.getApplicantName()).isEqualTo("Jane Doe");
        assertThat(response.getPermitType()).isEqualTo("Electrical");
    }

    @Test
    void testGetPermit() {
        PermitEntity found = PermitEntity.builder()
                .id(id)
                .permitName("Test")
                .applicantName("Alice")
                .permitType("Fire")
                .status("SUBMITTED")
                .submittedDate(LocalDateTime.now())
                .build();

        when(permitRepository.findById(id)).thenReturn(Optional.of(found));

        PermitResponseDTO response = permitService.getPermit(id);

        assertThat(response.getId()).isEqualTo(id);
        assertThat(response.getApplicantName()).isEqualTo("Alice");
    }

    @Test
    void testListPermits() {
        List<PermitEntity> permits = List.of(
                PermitEntity.builder()
                        .id(UUID.randomUUID())
                        .permitName("One")
                        .applicantName("A")
                        .permitType("Electrical")
                        .status("SUBMITTED")
                        .submittedDate(LocalDateTime.now())
                        .build(),
                PermitEntity.builder()
                        .id(UUID.randomUUID())
                        .permitName("Two")
                        .applicantName("B")
                        .permitType("Plumbing")
                        .status("APPROVED")
                        .submittedDate(LocalDateTime.now())
                        .build());

        when(permitRepository.findAll()).thenReturn(permits);

        List<PermitResponseDTO> result = permitService.listPermits();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getPermitName()).isEqualTo("One");
    }

    @Test
    void testUpdatePermit() {
        PermitRequestDTO update = PermitRequestDTO.builder()
                .permitName("Updated")
                .applicantName("New Name")
                .permitType("Mechanical")
                .status("REVIEW")
                .build();

        PermitEntity existing = PermitEntity.builder()
                .id(id)
                .permitName("Old")
                .applicantName("Old Name")
                .permitType("Electrical")
                .status("SUBMITTED")
                .submittedDate(LocalDateTime.now())
                .build();

        PermitEntity saved = PermitEntity.builder()
                .id(id)
                .permitName("Updated")
                .applicantName("New Name")
                .permitType("Mechanical")
                .status("REVIEW")
                .submittedDate(LocalDateTime.now())
                .build();

        when(permitRepository.findById(id)).thenReturn(Optional.of(existing));
        when(permitRepository.save(any())).thenReturn(saved);

        PermitResponseDTO result = permitService.updatePermit(id, update);

        assertThat(result.getPermitType()).isEqualTo("Mechanical");
        assertThat(result.getStatus()).isEqualTo("REVIEW");
    }

    @Test
    void testDeletePermit() {
        when(permitRepository.existsById(id)).thenReturn(true);

        boolean result = permitService.deletePermit(id);

        assertThat(result).isTrue();
        verify(permitRepository).deleteById(id);
    }

    @Test
    void updateThrows404_whenPermitDoesNotExist() {
        UUID nonexistentId = UUID.randomUUID();
        PermitRequestDTO request = new PermitRequestDTO();

        assertThrows(ResourceNotFoundException.class, () -> {
            permitService.updatePermit(nonexistentId, request);
        });
    }

    @Test
    void getThrows404_whenPermitDoesNotExist() {
        UUID nonexistentId = UUID.randomUUID();

        assertThrows(ResourceNotFoundException.class, () -> {
            permitService.getPermit(nonexistentId);
        });
    }

}
