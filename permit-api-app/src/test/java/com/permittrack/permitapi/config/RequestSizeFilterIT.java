package com.permittrack.permitapi.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.permittrack.permitapi.PermitApiApplication;

/**
 * Integration tests for RequestSizeFilter.
 *
 * Demonstrates:
 * 1. Filter correctly rejects oversized payloads (413)
 * 2. Handles GET-with-body edge cases (400)
 * 3. Accepts valid small/empty requests
 * 4. Context loads with a test-only controller under 'filter-test' profile
 */
@SpringBootTest(classes = PermitApiApplication.class, // Ensure main app context loads
                webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("filter-test") // ✅ custom profile for filter-only tests
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("RequestSizeFilter Integration Tests")
class RequestSizeFilterIT {

        @Autowired
        private MockMvc mockMvc;

        // here
        @Test
        @DisplayName("Verify /permits mapping and print request/response")
        void mappingVerificationTest() throws Exception {
                mockMvc.perform(
                                post("/permits")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content("{}"))
                                .andDo(print()) // ✅ Print full request and response details
                                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Oversized JSON POST returns 413 and proper JSON response")
        void oversizedJsonPost_returns413() throws Exception {
                byte[] bigPayload = new byte[2 * 1024 * 1024 + 1]; // 2MB+1

                mockMvc.perform(
                                post("/permits")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content(bigPayload))
                                .andExpect(status().isPayloadTooLarge())
                                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                                .andExpect(jsonPath("$.message")
                                                .value("JSON request payload exceeds 2 MB limit"));
        }

        @Test
        @DisplayName("Small JSON POST passes filter and returns 200")
        void smallJsonPost_passes() throws Exception {
                byte[] smallPayload = "{}".getBytes();

                mockMvc.perform(
                                post("/permits")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content(smallPayload))
                                .andExpect(status().isOk());
        }

        /**
         * 0-length JSON POST should be accepted by the filter.
         *
         * Why:
         * ----
         * 1. **HTTP Spec Compliance** – Empty POST bodies are valid (RFC 7231).
         * 2. **Real-World Scenarios** – Some APIs or webhooks POST with no payload.
         * 3. **Filter Behavior Validation** – Confirms we do not falsely reject safe
         * requests.
         * 4. **Portfolio Value** – Shows both lower (0 bytes) and upper (2 MB)
         * boundaries are tested.
         */
        @Test
        @DisplayName("0-length JSON POST passes filter and returns 200")
        void zeroLengthJsonPost_passes() throws Exception {
                mockMvc.perform(
                                post("/permits")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content(new byte[0]))
                                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("GET request with body returns 400 due to disallowed request body")
        void getWithBody_returns400() throws Exception {
                byte[] bodyPayload = "{}".getBytes();

                mockMvc.perform(
                                get("/permits")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content(bodyPayload))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message")
                                                .value(Matchers.containsString(
                                                                "Request body not allowed for GET requests")));
        }
}
