package com.permittrack.permitapi.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.permittrack.permitapi.model.ResourceNotFoundException;
import com.permittrack.permitapi.service.PermitService;
import com.permittrack.permitapi.util.InMemoryLogAppender;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import jakarta.servlet.ServletException;

@WebMvcTest(controllers = PermitController.class) // replace with your controller
@ActiveProfiles("test")
@Import(ExceptionHandlerTest.MockConfig.class) // import the spy bean
@DisplayName("Global Exception Handler Tests")
class ExceptionHandlerTest {

        private InMemoryLogAppender logAppender;
        private Logger serviceLogger;

        @Autowired
        private PermitService permitService; // Mocked service to simulate behavior

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private GlobalExceptionHandler exceptionHandlerSpy;

        @TestConfiguration
        static class MockConfig {
                @Bean
                PermitService permitService() {
                        return Mockito.mock(PermitService.class);
                }

                @Bean
                GlobalExceptionHandler globalExceptionHandler() {
                        return Mockito.spy(new GlobalExceptionHandler());
                }
        }

        /**
         * We attach the InMemoryLogAppender to the package logger
         * ("com.permittrack.permitapi.controller") instead of the specific
         * GlobalExceptionHandler.class logger because:
         *
         * 1. Spring Boot creates CGLIB proxies for @ControllerAdvice classes.
         * - The proxy class has a different logger name
         * (e.g.,
         * com.permittrack.permitapi.controller.GlobalExceptionHandler$$SpringCGLIB$$...),
         * so attaching an appender to the concrete class logger will miss these events.
         *
         * 2. Package-level logging ensures that:
         * - All logs from GlobalExceptionHandler (including proxies) are captured.
         * - Other controllers in the same package can also be monitored if needed.
         *
         * 3. This approach guarantees deterministic log capture in tests:
         * - Proxies, wrapped beans, and subclassed handlers all route logs
         * through the package logger, which our appender observes.
         *
         */
        @BeforeEach
        void setup() {
                // Setup log capture
                serviceLogger = (Logger) LoggerFactory.getLogger("com.permittrack.permitapi.controller");
                logAppender = new InMemoryLogAppender();
                logAppender.start();
                serviceLogger.addAppender(logAppender);
                serviceLogger.setLevel(Level.DEBUG); // Ensure WARN logs are captured
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
                serviceLogger = (Logger) LoggerFactory.getLogger("com.permittrack.permitapi.controller");
                serviceLogger.detachAppender(logAppender);
                logAppender.stop();
        }

        @Nested
        @DisplayName("Validation Handling")
        class ValidationTests {
                @Test
                @DisplayName("Should return 400 and log WARN for invalid request body")
                void shouldReturn400AndLogWarningForValidationErrors() throws Exception {
                        String invalidJson = "{}"; // triggers @Valid failure

                        var result = mockMvc.perform(post("/permits")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(invalidJson))
                                        .andExpect(status().isBadRequest())
                                        .andReturn();

                        Map<String, String> errors = objectMapper.readValue(
                                        result.getResponse().getContentAsString(),
                                        new TypeReference<>() {
                                        });

                        assertThat(errors).containsKeys("permitType");
                        Mockito.verify(exceptionHandlerSpy, Mockito.atLeastOnce())
                                        .handleValidation(Mockito.any(MethodArgumentNotValidException.class));

                        assertThat(logAppender.getLogs().stream()
                                        .anyMatch(log -> log.getLevel() == Level.WARN &&
                                                        log.getFormattedMessage().startsWith("Validation failed")))
                                        .withFailMessage(() -> buildLogDump(
                                                        "Expected a WARN log starting with 'Validation failed'"))
                                        .isTrue();
                }
        }

        @Nested
        @DisplayName("Type Mismatch Handling")
        class TypeMismatchTests {
                @Test
                @DisplayName("Should return 404 and log WARN for invalid UUID")
                void shouldReturn404AndLogWarnForInvalidUUID() throws Exception {
                        mockMvc.perform(get("/permits/not-a-uuid")
                                        .contentType(MediaType.APPLICATION_JSON))
                                        .andExpect(status().isNotFound())
                                        .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                                                        .isEqualTo("Invalid UUID"));

                        Mockito.verify(exceptionHandlerSpy, Mockito.atLeastOnce())
                                        .handleTypeMismatch(Mockito.any(MethodArgumentTypeMismatchException.class));

                        assertThat(logAppender.getLogs().stream()
                                        .anyMatch(log -> log.getLevel() == Level.WARN &&
                                                        log.getFormattedMessage().startsWith("Invalid UUID provided")))
                                        .withFailMessage(() -> buildLogDump(
                                                        "Expected a WARN log starting with 'Invalid UUID provided'"))
                                        .isTrue();
                }

                @Test
                @DisplayName("Should return 400 and log WARN for non-UUID param")
                void shouldReturn400AndLogWarnForNonUUIDParam() throws Exception {
                        mockMvc.perform(get("/permits").param("page", "abc"))
                                        .andExpect(status().isBadRequest())
                                        .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                                                        .contains("Invalid parameter: page"));

                        Mockito.verify(exceptionHandlerSpy, Mockito.atLeastOnce())
                                        .handleTypeMismatch(Mockito.any(MethodArgumentTypeMismatchException.class));

                        assertThat(logAppender.getLogs().stream()
                                        .anyMatch(log -> log.getLevel() == Level.WARN &&
                                                        log.getFormattedMessage().startsWith("Invalid parameter")))
                                        .withFailMessage(() -> buildLogDump(
                                                        "Expected a WARN log starting with 'Invalid parameter'"))
                                        .isTrue();
                }
        }

        @Nested
        @DisplayName("Resource Not Found Handling")
        class NotFoundTests {
                @Test
                @DisplayName("Should return 404 and log WARN for ResourceNotFoundException")
                void shouldReturn404AndLogWarnForResourceNotFound() throws Exception {
                        UUID nonexistentId = UUID.randomUUID();
                        Mockito.when(permitService.getPermit(nonexistentId))
                                        .thenThrow(new ResourceNotFoundException(
                                                        "Permit with ID " + nonexistentId + " not found"));

                        mockMvc.perform(get("/permits/" + nonexistentId)
                                        .contentType(MediaType.APPLICATION_JSON))
                                        .andExpect(status().isNotFound());

                        Mockito.verify(exceptionHandlerSpy, Mockito.atLeastOnce())
                                        .handleNotFound(Mockito.any(ResourceNotFoundException.class));

                        assertThat(logAppender.getLogs().stream()
                                        .anyMatch(log -> log.getLevel() == Level.WARN &&
                                                        log.getFormattedMessage().startsWith("Resource not found")))
                                        .withFailMessage(() -> buildLogDump(
                                                        "Expected a WARN log starting with 'Resource not found'"))
                                        .isTrue();
                }
        }

        @Nested
        @DisplayName("JSON Parsing Handling")
        class JsonParsingTests {
                @Test
                @DisplayName("Should return 400 and log WARN for malformed JSON")
                void shouldReturn400AndLogWarnForMalformedJson() throws Exception {
                        mockMvc.perform(post("/permits")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content("{ invalid json"))
                                        .andExpect(status().isBadRequest());

                        assertThat(logAppender.getLogs().stream()
                                        .anyMatch(log -> log.getLevel() == Level.WARN &&
                                                        log.getFormattedMessage().startsWith("Malformed JSON")))
                                        .withFailMessage(() -> buildLogDump(
                                                        "Expected a WARN log starting with 'Malformed JSON'"))
                                        .isTrue();
                }

                @Test
                @DisplayName("Should return 400 and log WARN for InvalidFormatException")
                void shouldReturn400AndLogWarnForInvalidFormatException() throws Exception {
                        String invalidEnumJson = """
                                            {
                                                "permitName": "Test",
                                                "permitType": "Electrical",
                                                "status": "NOT_A_VALID_STATUS",
                                                "applicantName": "John Doe"
                                            }
                                        """;

                        mockMvc.perform(post("/permits")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(invalidEnumJson))
                                        .andExpect(status().isBadRequest());

                        assertThat(logAppender.getLogs().stream()
                                        .anyMatch(log -> log.getLevel() == Level.WARN &&
                                                        log.getFormattedMessage()
                                                                        .startsWith("JSON parse error: Invalid value")))
                                        .withFailMessage(() -> buildLogDump(
                                                        "Expected a WARN log starting with 'JSON parse error: Invalid value'"))
                                        .isTrue();
                }
        }

        @Nested
        @DisplayName("Servlet Exception Handling")
        class ServletExceptionTests {
                @Test
                @DisplayName("Should log ERROR for payload too large")
                void shouldLogErrorForPayloadTooLarge() {
                        ServletException ex = new ServletException("Request body too large");
                        exceptionHandlerSpy.handleServletException(ex);

                        assertThat(logAppender.getLogs().stream()
                                        .anyMatch(log -> log.getLevel() == Level.ERROR &&
                                                        log.getFormattedMessage().contains("Payload too large")))
                                        .withFailMessage(() -> buildLogDump(
                                                        "Expected an ERROR log containing 'Payload too large'"))
                                        .isTrue();
                }

                @Test
                @DisplayName("Should log WARN for generic servlet error")
                void shouldLogWarnForGenericServletError() {
                        ServletException ex = new ServletException("Some servlet error");
                        exceptionHandlerSpy.handleServletException(ex);

                        assertThat(logAppender.getLogs().stream()
                                        .anyMatch(log -> log.getLevel() == Level.WARN &&
                                                        log.getFormattedMessage().contains("Servlet exception")))
                                        .withFailMessage(() -> buildLogDump(
                                                        "Expected a WARN log containing 'Servlet exception'"))
                                        .isTrue();
                }
        }

        // Utility to dump logs for easier debugging
        private String buildLogDump(String message) {
                String allLogs = logAppender.getLogs().stream()
                                .map(log -> log.getLevel() + " - " + log.getFormattedMessage())
                                .reduce("", (a, b) -> a + "\n" + b);
                return message + "\nCaptured logs:" + allLogs;
        }
}
