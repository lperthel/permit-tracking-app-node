package com.permittrack.permitapi.it;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.permittrack.permitapi.PermitApiApplication;
import com.permittrack.permitapi.service.PermitService;

/**
 * Integration tests for RequestSizeFilter.
 *
 * Demonstrates:
 * 1. Filter correctly rejects oversized payloads (413)
 * 2. Handles GET/DELETE-with-body edge cases (400)
 * 3. Rejects unsupported methods and content types (405/415)
 * 4. Accepts valid small/empty requests (200)
 * 5. Verifies /permits mapping and context loads under 'filter-test' profile
 *
 * Portfolio Value:
 * - Full end-to-end validation of a security-related servlet filter
 * - Uses MockMvc for HTTP-level testing and OWASP-aligned responses
 * - Logs requests/responses with `.andDo(print())` for demo visibility
 */
@SpringBootTest(classes = PermitApiApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("filter-test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("RequestSizeFilter Integration Tests")
class RequestSizeFilterIT {

    private static final String PERMITS_ENDPOINT = "/permits";
    private static final String MESSAGE_OVERSIZED = "JSON request payload exceeds 2 MB limit";
    private static final String MESSAGE_MISSING_CT = "Missing Content-Type header";
    private static final String MESSAGE_UNSUPPORTED = "Unsupported media type: only application/json requests are allowed up to 2 MB";
    private static final String MESSAGE_GET_BODY = "Request body not allowed for GET requests";
    private static final String MESSAGE_DELETE_BODY = "Request body not allowed for DELETE requests";
    private static final String MESSAGE_PATCH_NOT_ALLOWED = "HTTP method not allowed: PATCH";
    private static final String MESSAGE_OPTIONS_NOT_ALLOWED = "HTTP method not allowed: OPTIONS";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PermitService permitService;

    // @TestConfiguration
    // static class MockConfig {
    // @Bean
    // PermitService permitService() {
    // return Mockito.mock(PermitService.class);
    // }
    // }

    @Nested
    @DisplayName("Valid & Small Requests")
    class ValidRequests {

        @Test
        @DisplayName("Verify /permits mapping and log request/response")
        void mappingVerificationTest() throws Exception {
            mockMvc.perform(
                    post(PERMITS_ENDPOINT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Small POST passes filter")
        void smallPostRequest_passesThrough() throws Exception {
            mockMvc.perform(post(PERMITS_ENDPOINT)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(generateJsonPayload(100)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Small GET passes filter")
        void smallGetRequest_passesThrough() throws Exception {
            mockMvc.perform(get(PERMITS_ENDPOINT).param("page", "0"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Small DELETE passes filter")
        void smallDeleteRequest_passesThrough() throws Exception {
            UUID permitId = UUID.randomUUID();

            mockMvc.perform(delete(PERMITS_ENDPOINT + "/{id}", permitId))
                    .andDo(print()) // logs request & response
                    .andExpect(status().isNoContent());

        }

        @Test
        @DisplayName("0-byte POST passes filter")
        void zeroLengthJsonPost_passes() throws Exception {
            mockMvc.perform(
                    post(PERMITS_ENDPOINT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(new byte[0]))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Oversized JSON Requests")
    class OversizedRequests {

        @Test
        @DisplayName("Oversized POST rejected with 413")
        void oversizedPostRequest_isRejectedWith413() throws Exception {
            mockMvc.perform(post(PERMITS_ENDPOINT)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(generateJsonPayload(3_000_000)))
                    .andExpect(status().isPayloadTooLarge())
                    .andExpect(jsonPath("$.message").value(MESSAGE_OVERSIZED));
        }
    }

    @Nested
    @DisplayName("Content-Type Handling")
    class ContentTypeTests {

        @Test
        @DisplayName("Missing Content-Type rejected with 400")
        void missingContentType_isRejectedWith400() throws Exception {
            mockMvc.perform(post(PERMITS_ENDPOINT)
                    .content(generateJsonPayload(100)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value(MESSAGE_MISSING_CT));
        }

        @Test
        @DisplayName("Non-JSON oversized request rejected with 415")
        void nonJsonOversizedRequest_isRejectedWith415() throws Exception {
            mockMvc.perform(post(PERMITS_ENDPOINT)
                    .contentType(MediaType.TEXT_PLAIN)
                    .content("X".repeat(3_000_000)))
                    .andExpect(status().isUnsupportedMediaType())
                    .andExpect(jsonPath("$.message").value(MESSAGE_UNSUPPORTED));
        }
    }

    @Nested
    @DisplayName("GET / DELETE Body Not Allowed")
    class BodyNotAllowedTests {

        @Test
        void getWithBody_isRejectedWith400() throws Exception {
            mockMvc.perform(get(PERMITS_ENDPOINT)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(generateJsonPayload(100)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value(MESSAGE_GET_BODY));
        }

        @Test
        void deleteWithBody_isRejectedWith400() throws Exception {
            mockMvc.perform(delete(PERMITS_ENDPOINT + "/123")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(generateJsonPayload(100)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value(MESSAGE_DELETE_BODY));
        }
    }

    @Nested
    @DisplayName("Disallowed HTTP Methods")
    class DisallowedMethodsTests {

        @Test
        void patchRequest_isRejectedWith405() throws Exception {
            mockMvc.perform(patch(PERMITS_ENDPOINT)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(generateJsonPayload(100)))
                    .andExpect(status().isMethodNotAllowed())
                    .andExpect(jsonPath("$.message").value(MESSAGE_PATCH_NOT_ALLOWED));
        }

        @Test
        void optionsRequest_isRejectedWith405() throws Exception {
            mockMvc.perform(options(PERMITS_ENDPOINT))
                    .andExpect(status().isMethodNotAllowed())
                    .andExpect(jsonPath("$.message").value(MESSAGE_OPTIONS_NOT_ALLOWED));
        }
    }

    /** ---------------- Helper ---------------- **/

    private String generateJsonPayload(int size) {
        return """
                {
                  "permitName": "%s",
                  "applicantName": "Valid Name",
                  "permitType": "Standard",
                  "status": "SUBMITTED"
                }
                """.formatted("A".repeat(size));
    }
}
