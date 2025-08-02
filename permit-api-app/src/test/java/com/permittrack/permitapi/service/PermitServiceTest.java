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

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

import com.permittrack.permitapi.controller.GlobalExceptionHandler;
import com.permittrack.permitapi.model.PermitEntity;
import com.permittrack.permitapi.model.PermitRequestDTO;
import com.permittrack.permitapi.model.PermitResponseDTO;
import com.permittrack.permitapi.model.PermitStatus;
import com.permittrack.permitapi.model.ResourceNotFoundException;
import com.permittrack.permitapi.repository.PermitRepository;
import com.permittrack.permitapi.util.InMemoryLogAppender;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;

class PermitServiceTest {

        private PermitRepository permitRepository;
        private PermitService permitService;
        private UUID id;

        private InMemoryLogAppender logAppender;
        private Logger serviceLogger;

        @BeforeEach
        void setup() {
                permitRepository = mock(PermitRepository.class);
                permitService = new PermitService(permitRepository);
                id = UUID.randomUUID();
                // Setup log capture
                serviceLogger = (Logger) LoggerFactory.getLogger(PermitService.class);
                logAppender = new InMemoryLogAppender();
                logAppender.start();
                serviceLogger.addAppender(logAppender);
                serviceLogger.setLevel(Level.DEBUG); // Ensure DEBUG logs are captured
        }

        /**
         * After each test, we detach and stop the InMemoryLogAppender to:
         * 
         * 1. Prevent cross-test pollution:
         * - If we leave the appender attached, logs from subsequent tests may mix
         * with previous logs, causing false positives.
         *
         * 2. Avoid memory leaks:
         * - Logback keeps references to appenders. Stopping and detaching ensures
         * the appender and its collected logs can be garbage-collected.
         * 
         */
        @AfterEach
        void tearDownLogAppender() {
                Logger logger = (Logger) LoggerFactory.getLogger(GlobalExceptionHandler.class);
                logger.detachAppender(logAppender);
                logAppender.stop();
        }

        @Test
        void testCreatePermit() {
                PermitRequestDTO request = PermitRequestDTO.builder()
                                .permitName("Demo Permit")
                                .applicantName("Jane Doe")
                                .permitType("Electrical")
                                .status(PermitStatus.SUBMITTED)
                                .build();

                PermitEntity saved = PermitEntity.builder()
                                .id(id)
                                .permitName("Demo Permit")
                                .applicantName("Jane Doe")
                                .permitType("Electrical")
                                .status(PermitStatus.SUBMITTED)
                                .submittedDate(LocalDateTime.of(2025, 1, 1, 12, 0)) // fixed date for predictable log
                                .build();

                when(permitRepository.save(any(PermitEntity.class))).thenReturn(saved);

                PermitResponseDTO response = permitService.createPermit(request);

                assertThat(response.getApplicantName()).isEqualTo("Jane Doe");
                assertThat(response.getPermitType()).isEqualTo("Electrical");

                String logs = logAppender.getLogs().stream()
                                .map(event -> event.getFormattedMessage())
                                .reduce("", (a, b) -> a + "\n" + b);

                assertThat(logs).contains(
                                "Creating new permit request: name=Demo Permit, type=Electrical, status=SUBMITTED, applicant=Jane Doe");
                assertThat(logs).contains("Permit successfully created: id=" + id);
                assertThat(logs).contains("Demo Permit");
                assertThat(logs).contains("Electrical");
                assertThat(logs).contains("SUBMITTED");
                assertThat(logs).contains("Jane Doe");
                assertThat(logs).contains("2025-01-01T12:00");

        }

        @Test
        void testGetPermit() {
                PermitEntity found = PermitEntity.builder()
                                .id(id)
                                .permitName("Test Permit")
                                .applicantName("Alice Smith")
                                .permitType("Fire")
                                .status(PermitStatus.SUBMITTED)
                                .submittedDate(LocalDateTime.of(2025, 1, 2, 10, 30))
                                .build();

                when(permitRepository.findById(id)).thenReturn(Optional.of(found));

                PermitResponseDTO response = permitService.getPermit(id);

                assertThat(response.getId()).isEqualTo(id);
                assertThat(response.getApplicantName()).isEqualTo("Alice Smith");

                // Assert: Check log contents
                String logs = logAppender.getLogs().stream()
                                .map(event -> event.getFormattedMessage())
                                .reduce("", (a, b) -> a + "\n" + b);

                // First log: retrieval attempt
                assertThat(logs).contains("Retrieving permit with ID " + id);

                // Second log: full permit details
                assertThat(logs).contains("Permit retrieved: id=" + id);
                assertThat(logs).contains("name=Test Permit");
                assertThat(logs).contains("type=Fire");
                assertThat(logs).contains("status=SUBMITTED");
                assertThat(logs).contains("applicant=Alice Smith");
                assertThat(logs).contains("submittedDate=2025-01-02T10:30");
        }

        @Test
        void testListPermits_logsInfo() {
                // Arrange: Create 2 permits
                List<PermitEntity> permits = List.of(
                                PermitEntity.builder()
                                                .id(UUID.randomUUID())
                                                .permitName("Permit One")
                                                .applicantName("Applicant A")
                                                .permitType("Electrical")
                                                .status(PermitStatus.SUBMITTED)
                                                .submittedDate(LocalDateTime.of(2025, 1, 4, 10, 0))
                                                .build(),
                                PermitEntity.builder()
                                                .id(UUID.randomUUID())
                                                .permitName("Permit Two")
                                                .applicantName("Applicant B")
                                                .permitType("Plumbing")
                                                .status(PermitStatus.APPROVED)
                                                .submittedDate(LocalDateTime.of(2025, 1, 5, 14, 30))
                                                .build());

                when(permitRepository.findAll()).thenReturn(permits);

                // Act
                List<PermitResponseDTO> result = permitService.listPermits();

                // Assert: Check returned DTOs
                assertThat(result).hasSize(2);
                assertThat(result.get(0).getPermitName()).isEqualTo("Permit One");
                assertThat(result.get(1).getPermitType()).isEqualTo("Plumbing");

                // Assert: Check logs
                String logs = logAppender.getLogs().stream()
                                .map(event -> event.getFormattedMessage())
                                .reduce("", (a, b) -> a + "\n" + b);

                // 1. Initial listing log
                assertThat(logs).contains("Listing all permits");

                // 2. Count log
                assertThat(logs).contains("Retrieved 2 permits");
        }

        @Test
        void testUpdatePermit_logsFullDetails() {
                // Arrange: Prepare the update DTO
                PermitRequestDTO update = PermitRequestDTO.builder()
                                .permitName("Updated Permit")
                                .applicantName("New Name")
                                .permitType("Mechanical")
                                .status(PermitStatus.REVIEW)
                                .build();

                // Existing entity (what the repo returns before update)
                PermitEntity existing = PermitEntity.builder()
                                .id(id)
                                .permitName("Old Permit")
                                .applicantName("Old Name")
                                .permitType("Electrical")
                                .status(PermitStatus.SUBMITTED)
                                .submittedDate(LocalDateTime.of(2025, 1, 3, 9, 0))
                                .build();

                // Saved entity (what the repo returns after update)
                PermitEntity saved = PermitEntity.builder()
                                .id(id)
                                .permitName("Updated Permit")
                                .applicantName("New Name")
                                .permitType("Mechanical")
                                .status(PermitStatus.REVIEW)
                                .submittedDate(LocalDateTime.of(2025, 1, 3, 9, 0)) // same date for simplicity
                                .build();

                when(permitRepository.findById(id)).thenReturn(Optional.of(existing));
                when(permitRepository.save(any(PermitEntity.class))).thenReturn(saved);

                // Act
                PermitResponseDTO result = permitService.updatePermit(id, update);

                // Assert: DTO values are correct
                assertThat(result.getPermitType()).isEqualTo("Mechanical");
                assertThat(result.getStatus()).isEqualTo(PermitStatus.REVIEW);

                // Assert: Logs contain both update attempt and success
                String logs = logAppender.getLogs().stream()
                                .map(event -> event.getFormattedMessage())
                                .reduce("", (a, b) -> a + "\n" + b);

                // 1. Update attempt log
                assertThat(logs).contains("Updating permit " + id
                                + " with new values: name=Updated Permit, type=Mechanical, status=REVIEW, applicant=New Name");

                // 2. Successful update log
                assertThat(logs).contains("Permit successfully updated: id=" + id);
                assertThat(logs).contains("name=Updated Permit");
                assertThat(logs).contains("type=Mechanical");
                assertThat(logs).contains("status=REVIEW");
                assertThat(logs).contains("applicant=New Name");
                assertThat(logs).contains("submittedDate=2025-01-03T09:00");
        }

        @Test
        void testDeletePermit_logsFullDetails() {
                // --- Case 1: Successful delete ---
                when(permitRepository.existsById(id)).thenReturn(true);

                boolean result = permitService.deletePermit(id);

                // Assert: Service behavior
                assertThat(result).isTrue();
                verify(permitRepository).deleteById(id);

                // Assert: Logs
                String logs = logAppender.getLogs().stream()
                                .map(event -> event.getFormattedMessage())
                                .reduce("", (a, b) -> a + "\n" + b);

                // 1. Attempt log
                assertThat(logs).contains("Attempting to delete permit with ID " + id);

                // 2. Success log
                assertThat(logs).contains("Permit with ID " + id + " successfully deleted");
        }

        @Test
        void updateThrows404_whenPermitDoesNotExist_logsWarn() {
                UUID nonexistentId = UUID.randomUUID();
                PermitRequestDTO request = PermitRequestDTO.builder()
                                .permitName("Ghost Permit")
                                .applicantName("Nobody")
                                .permitType("Phantom")
                                .status(PermitStatus.REVIEW)
                                .build();

                // Act & Assert: Expect exception
                assertThrows(ResourceNotFoundException.class, () -> {
                        permitService.updatePermit(nonexistentId, request);
                });

                // Assert: Check log content
                String logs = logAppender.getLogs().stream()
                                .map(event -> event.getFormattedMessage())
                                .reduce("", (a, b) -> a + "\n" + b);

                // 1. Attempt log
                assertThat(logs).contains(
                                "Updating permit " + nonexistentId +
                                                " with new values: name=Ghost Permit, type=Phantom, status=REVIEW, applicant=Nobody");

        }

        @Test
        void getThrows404_whenGetPermitDoesNotExist() {
                UUID nonexistentId = UUID.randomUUID();

                // Act & Assert: Expect ResourceNotFoundException
                assertThrows(ResourceNotFoundException.class, () -> {
                        permitService.getPermit(nonexistentId);
                });

                // Capture logs
                String logs = logAppender.getLogs().stream()
                                .map(event -> event.getFormattedMessage())
                                .reduce("", (a, b) -> a + "\n" + b);

                // 1. Attempt log
                assertThat(logs).contains("Retrieving permit with ID " + nonexistentId);
        }

        @Test
        void getThrows404_whenDeletePermitDoesNotExist() {

                when(permitRepository.existsById(id)).thenReturn(false);

                assertThrows(ResourceNotFoundException.class, () -> permitService.deletePermit(id));

        }

}
