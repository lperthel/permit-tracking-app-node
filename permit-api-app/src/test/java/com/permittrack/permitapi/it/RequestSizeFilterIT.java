package com.permittrack.permitapi.it;

import com.permittrack.permitapi.config.RequestSizeFilter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for {@link RequestSizeFilter}.
 *
 * <h2>Purpose</h2>
 * - Verifies end-to-end filter behavior when registered in Spring Boot.
 * - Confirms that requests are blocked or allowed according to filter rules.
 * - Ensures consistent JSON error responses for all blocked cases.
 *
 * <h2>Why IT?</h2>
 * - Complements the unit tests by proving the filter is wired correctly in the
 * servlet container.
 * - Uses MockMvc to simulate actual HTTP requests without mocking the filter directly.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test") // Use H2
@TestInstance(TestInstance.Lifecycle.PER_CLASS) // optional, helps with setup reuse
@DisplayName("RequestSizeFilter Integration Tests")
class RequestSizeFilterIT {

  @Autowired
  private MockMvc mockMvc;

  /**
   * ---------------- POST/PUT Validation ----------------
   **/
  @Nested
  @DisplayName("POST/PUT Validation")
  class PostPutIT {

    @Test
    @DisplayName("Small JSON POST passes (200)")
    void smallJsonPost_passes() throws Exception {
      // ✅ Minimal valid JSON to satisfy @Valid PermitRequestDTO
      String validJson = """
            {
              "permitType": "TEMP",
              "permitName": "Test Permit",
              "applicantName": "John Doe",
              "status": "SUBMITTED"
            }
        """;

      mockMvc.perform(post("/permits")
          .contentType(MediaType.APPLICATION_JSON)
          .content(validJson))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("Oversized JSON POST is rejected with 413")
    void oversizedJsonPost_isRejectedWith413() throws Exception {
      byte[] bigBody = new byte[2 * 1024 * 1024 + 1]; // 2MB+1
      mockMvc.perform(post("/permits")
          .contentType(MediaType.APPLICATION_JSON)
          .content(bigBody))
        .andExpect(status().isPayloadTooLarge())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andExpect(content().string(org.hamcrest.Matchers.containsString("exceeds 2 MB limit")));
    }
  }

  /**
   * ---------------- GET/DELETE/HEAD Validation ----------------
   **/
  @Nested
  @DisplayName("GET/DELETE/HEAD Validation")
  class GetDeleteHeadIT {

    @Test
    @DisplayName("GET with body is rejected with 400")
    void getWithBody_isRejectedWith400() throws Exception {
      mockMvc.perform(get("/permits").content("{}"))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("DELETE with body is rejected with 400")
    void deleteWithBody_isRejectedWith400() throws Exception {
      mockMvc.perform(delete("/permits/" + UUID.randomUUID()).content("{}"))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("HEAD request with no body passes (200)")
    void headRequest_passes() throws Exception {
      mockMvc.perform(head("/permits"))
        .andExpect(status().isOk());
    }

    @Test
    @DisplayName("HEAD request with body is rejected with 400")
    void headRequestWithBody_isRejectedWith400() throws Exception {
      mockMvc.perform(head("/permits").content("{}"))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }
  }

  /**
   * ---------------- Disallowed HTTP Methods ----------------
   **/
  @Nested
  @DisplayName("Disallowed Methods")
  class DisallowedMethodsIT {

    @Test
    @DisplayName("PATCH is rejected with 405")
    void patchRequest_isRejectedWith405() throws Exception {
      mockMvc.perform(patch("/permits"))
        .andExpect(status().isMethodNotAllowed())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andExpect(content().string(org.hamcrest.Matchers.containsString("HTTP method not allowed")));
    }

    @Test
    @DisplayName("OPTIONS is rejected with 405")
    void optionsRequest_isRejectedWith405() throws Exception {
      mockMvc.perform(options("/permits"))
        .andExpect(status().isMethodNotAllowed())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }
  }
}
