package com.permittrack.permitapi.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.permittrack.permitapi.service.PermitService;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Import(RequestSizeFilterIT.MockConfig.class) // import the mock configuration
class RequestSizeFilterIT {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private PermitService permitService;

        @TestConfiguration
        static class MockConfig {
                @Bean
                PermitService permitService() {
                        return Mockito.mock(PermitService.class);
                }
        }

        /** ---------------- Small / Valid Requests ---------------- **/
        @Test
        void smallPostRequest_passesThrough() throws Exception {
                mockMvc.perform(post("/permits")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(generateJsonPayload(100)))
                                .andExpect(status().isOk());
        }

        @Test
        void smallGetRequest_passesThrough() throws Exception {
                mockMvc.perform(get("/permits").param("page", "0"))
                                .andExpect(status().isOk());
        }

        @Test
        void smallDeleteRequest_passesThrough() throws Exception {
                UUID permitId = UUID.randomUUID();

                // Mock service to pretend this permit exists
                when(permitService.deletePermit(permitId)).thenReturn(true);

                mockMvc.perform(delete("/permits/{id}", permitId))
                                .andExpect(status().isNoContent());
        }

        /** ---------------- Oversized JSON Requests ---------------- **/

        @Test
        void oversizedPostRequest_isRejectedWith413() throws Exception {
                mockMvc.perform(post("/permits")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(generateJsonPayload(3_000_000)))
                                .andExpect(status().isPayloadTooLarge())
                                .andExpect(jsonPath("$.message")
                                                .value("JSON request payload exceeds 2 MB limit"));
        }

        @Test
        void oversizedPutRequest_isRejectedWith413() throws Exception {
                mockMvc.perform(put("/permits/1234")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(generateJsonPayload(3_000_000)))
                                .andExpect(status().isPayloadTooLarge())
                                .andExpect(jsonPath("$.message")
                                                .value("JSON request payload exceeds 2 MB limit"));
        }

        /** ---------------- Missing / Non-JSON Content-Type ---------------- **/

        @Test
        void missingContentType_isRejectedWith400() throws Exception {
                mockMvc.perform(post("/permits")
                                .content(generateJsonPayload(100)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message")
                                                .value("Missing Content-Type header"));
        }

        @Test
        void nonJsonOversizedRequest_isRejectedWith415() throws Exception {
                mockMvc.perform(post("/permits")
                                .contentType(MediaType.TEXT_PLAIN)
                                .content("X".repeat(3_000_000)))
                                .andExpect(status().isUnsupportedMediaType())
                                .andExpect(jsonPath("$.message")
                                                .value("Unsupported media type: only application/json requests are allowed up to 2 MB"));
        }

        /** ---------------- GET / DELETE Body Not Allowed ---------------- **/

        @Test
        void getWithBody_isRejectedWith400() throws Exception {
                mockMvc.perform(get("/permits")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(generateJsonPayload(100)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message")
                                                .value("Request body not allowed for GET requests"));
        }

        @Test
        void deleteWithBody_isRejectedWith400() throws Exception {
                mockMvc.perform(delete("/permits/123")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(generateJsonPayload(100)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message")
                                                .value("Request body not allowed for DELETE requests"));
        }

        /** ---------------- Disallowed HTTP Methods ---------------- **/

        @Test
        void patchRequest_isRejectedWith405() throws Exception {
                mockMvc.perform(patch("/permits")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(generateJsonPayload(100)))
                                .andExpect(status().isMethodNotAllowed())
                                .andExpect(jsonPath("$.message")
                                                .value("HTTP method not allowed: PATCH"));
        }

        @Test
        void optionsRequest_isRejectedWith405() throws Exception {
                mockMvc.perform(options("/permits"))
                                .andExpect(status().isMethodNotAllowed())
                                .andExpect(jsonPath("$.message")
                                                .value("HTTP method not allowed: OPTIONS"));
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
