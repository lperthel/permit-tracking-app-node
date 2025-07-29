package com.permittrack.permitapi.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.permittrack.permitapi.service.PermitService;

@WebMvcTest(controllers = PermitController.class) // replace with your controller
@ActiveProfiles("test")
@Import(ExceptionHandlerTest.MockConfig.class) // import the spy bean
class ExceptionHandlerTest {

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

    @Test
    void handleValidation_shouldReturnFieldErrors() throws Exception {
        // Payload that violates @Valid annotations (e.g., missing required fields)
        String invalidJson = "{}";

        var result = mockMvc.perform(post("/permits") // endpoint using @Valid
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andReturn();

        String response = result.getResponse().getContentAsString();
        Map<String, String> errors = objectMapper.readValue(response, new TypeReference<Map<String, String>>() {
        });

        assertThat(errors).containsKeys("permitType"); // Example field
        assertThat(errors.get("permitType")).isNotBlank();
    }

    @Test
    void handleTypeMismatch_shouldReturn404ForInvalidUUID() throws Exception {
        mockMvc.perform(get("/permits/not-a-uuid")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .isEqualTo("Invalid UUID"));
        Mockito.verify(exceptionHandlerSpy, Mockito.atLeastOnce())
                .handleTypeMismatch(Mockito.any(MethodArgumentTypeMismatchException.class));

    }

    @Test
    void handleTypeMismatch_shouldReturn400ForNonUUIDParam() throws Exception {
        mockMvc.perform(get("/permits").param("page", "abc"))
                .andExpect(status().isBadRequest())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .contains("Invalid parameter: page"));

        // Verify handler invoked
        Mockito.verify(exceptionHandlerSpy, Mockito.atLeastOnce())
                .handleTypeMismatch(Mockito.any(MethodArgumentTypeMismatchException.class));
    }

}
