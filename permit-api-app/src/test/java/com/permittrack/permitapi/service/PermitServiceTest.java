package com.permittrack.permitapi.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.permittrack.permitapi.model.Permit;
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
        Permit permit = new Permit();
        permit.setPermitName("Jane Doe");

        when(permitRepository.save(any(Permit.class))).thenReturn(permit);

        Permit result = permitService.createPermit(permit);

        assertThat(result.getPermitName()).isEqualTo("Jane Doe");
        verify(permitRepository).save(permit);
    }

    @Test
    void testGetPermit() {
        Permit permit = new Permit();
        permit.setId(id);

        when(permitRepository.findById(id)).thenReturn(Optional.of(permit));

        Optional<Permit> result = permitService.getPermit(id);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(id);
    }

    @Test
    void testListPermits() {
        when(permitRepository.findAll()).thenReturn(List.of(new Permit(), new Permit()));

        List<Permit> permits = permitService.listPermits();

        assertThat(permits).hasSize(2);
    }

    @Test
    void testUpdatePermit() {
        Permit existing = new Permit();
        existing.setId(id);
        existing.setPermitName("Old");

        Permit updated = new Permit();
        updated.setPermitName("New");
        updated.setPermitType("Electrical");
        updated.setStatus("SUBMITTED");

        when(permitRepository.findById(id)).thenReturn(Optional.of(existing));
        when(permitRepository.save(any())).thenReturn(existing);

        Optional<Permit> result = permitService.updatePermit(id, updated);

        assertThat(result).isPresent();
        assertThat(result.get().getPermitName()).isEqualTo("New");

        ArgumentCaptor<Permit> captor = ArgumentCaptor.forClass(Permit.class);
        verify(permitRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo("SUBMITTED");
    }

    @Test
    void testDeletePermit() {
        when(permitRepository.existsById(id)).thenReturn(true);

        boolean deleted = permitService.deletePermit(id);

        assertThat(deleted).isTrue();
        verify(permitRepository).deleteById(id);
    }
}
