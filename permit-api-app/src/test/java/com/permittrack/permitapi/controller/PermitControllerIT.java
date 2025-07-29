package com.permittrack.permitapi.controller;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.permittrack.permitapi.model.PermitEntity;
import com.permittrack.permitapi.model.PermitStatus;
import com.permittrack.permitapi.repository.PermitRepository;
import com.permittrack.permitapi.support.PermitJsonPath;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test") // Use H2
@TestInstance(TestInstance.Lifecycle.PER_CLASS) // optional, helps with setup reuse
public class PermitControllerIT {

        /*
         * (MockMvc)
         * ↓
         * Spring MVC DispatcherServlet
         * ↓
         * Controller → Service → Repo → (H2 or Postgres)
         * 
         */
        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private PermitRepository permitRepository;

        @BeforeEach
        void clearDb() {
                permitRepository.deleteAll();
        }

        private PermitEntity createAndPostSamplePermit(String name) throws Exception {
                PermitEntity permit = new PermitEntity();
                permit.setPermitName(name);
                permit.setApplicantName("John Doe");
                permit.setPermitType("Electrical");
                permit.setStatus(PermitStatus.SUBMITTED);

                String json = objectMapper.writeValueAsString(permit);
                ResultActions response = mockMvc.perform(post("/permits")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json));
                response.andExpect(status().isOk());

                var responseraw = response.andReturn().getResponse();
                System.out.println("Response Debug: " + responseraw);
                var responseString = responseraw.getContentAsString();
                System.out.println("Response Contents: " + responseString);

                return objectMapper.readValue(response.andReturn().getResponse().getContentAsString(),
                                PermitEntity.class);
        }

        @Test
        public void testCreateAndGetPermit() throws Exception {
                final String testPermitName = "Test Permit";
                PermitEntity created = createAndPostSamplePermit(testPermitName);
                mockMvc.perform(get("/permits/" + created.getId()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath(PermitJsonPath.PERMIT_NAME).value(testPermitName));
        }

        @Test
        public void testListPermits() throws Exception {
                String testPermitNameA = "Permit A";
                createAndPostSamplePermit(testPermitNameA);
                String testPermitNameB = "Permit B";
                createAndPostSamplePermit(testPermitNameB);

                mockMvc.perform(get("/permits")
                                .param("page", "0")
                                .param("size", "10"))
                                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(2)));
        }

        @Test
        public void testUpdatePermit() throws Exception {
                final String testPermitOldName = "Old Name";
                final String testPermitNewName = "Updated Name";

                PermitEntity created = createAndPostSamplePermit(testPermitOldName);
                created.setPermitName(testPermitNewName);

                mockMvc.perform(put("/permits/" + created.getId())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(created)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath(PermitJsonPath.PERMIT_NAME).value(testPermitNewName));
        }

        @Test
        public void testDeletePermit() throws Exception {
                PermitEntity created = createAndPostSamplePermit("To Be Deleted");

                mockMvc.perform(delete("/permits/" + created.getId()))
                                .andExpect(status().isNoContent());

                mockMvc.perform(get("/permits/" + created.getId()))
                                .andExpect(status().isNotFound());
        }

        @Test
        public void testGetNotFound() throws Exception {
                mockMvc.perform(get("/permits/" + UUID.randomUUID()))
                                .andExpect(status().isNotFound());
        }

        @Test
        void getPermit_returns404_whenPermitMissing() throws Exception {
                UUID missingId = UUID.randomUUID();

                mockMvc.perform(get("/permits/" + missingId))
                                .andExpect(status().isNotFound())
                                .andExpect(content().string(containsString("Permit with ID")));
        }

        @Test
        void invalidStatus_inJson_returnsBadRequestWithCleanError() throws Exception {
                String invalidJson = """
                                {
                                  "permitName": "Demo",
                                  "applicantName": "Valid Name",
                                  "permitType": "Standard",
                                  "status": "UNKNOWN"
                                }
                                """;

                mockMvc.perform(post("/permits")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(invalidJson))
                                .andExpect(status().isBadRequest())
                                // ✅ Generic error message
                                .andExpect(jsonPath("$.error").value("Invalid request"))
                                // ✅ First detail mentions the invalid field
                                .andExpect(jsonPath("$.details[0]").value(
                                                org.hamcrest.Matchers.containsString("status")));
        }

}
