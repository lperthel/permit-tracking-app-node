package com.permittrack.permitapi.controller;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
// get, post, put, delete, etc.
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.permittrack.permitapi.model.Permit;
import com.permittrack.permitapi.repository.PermitRepository;
import com.permittrack.permitapi.support.PermitJsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test") // Use H2
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

    private Permit createAndPostSamplePermit(String name) throws Exception {
        Permit permit = new Permit();
        permit.setPermitName(name);
        permit.setStatus("PENDING");

        String json = objectMapper.writeValueAsString(permit);
        ResultActions response = mockMvc.perform(post("/permits")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json));
        System.out.println(response.toString());
        response.andExpect(status().isOk());
        response.andReturn().getResponse().getContentAsString();

        return objectMapper.readValue(response.andReturn().getResponse().getContentAsString(), Permit.class);
    }

    @Test
    public void testCreateAndGetPermit() throws Exception {
        Permit created = createAndPostSamplePermit("Test Permit");
        mockMvc.perform(get("/permits/" + created.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath(PermitJsonPath.PERMIT_NAME).value("Test Permit"));
    }

    @Test
    public void testListPermits() throws Exception {
        createAndPostSamplePermit("Permit A");
        createAndPostSamplePermit("Permit B");

        mockMvc.perform(get("/permits"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(2)));
    }

    @Test
    public void testUpdatePermit() throws Exception {
        Permit created = createAndPostSamplePermit("Old Name");
        created.setPermitName("Updated Name");

        mockMvc.perform(put("/permits/" + created.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(created)))
                .andExpect(status().isOk())
                .andExpect(jsonPath(PermitJsonPath.PERMIT_NAME).value("Updated Name"));
    }

    @Test
    public void testDeletePermit() throws Exception {
        Permit created = createAndPostSamplePermit("To Be Deleted");

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

}
