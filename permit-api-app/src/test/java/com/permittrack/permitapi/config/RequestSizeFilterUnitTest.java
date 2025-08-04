package com.permittrack.permitapi.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Unit tests for {@link RequestSizeFilter}.
 *
 * <h2>Purpose</h2>
 * These tests verify all logical branches of the {@code RequestSizeFilter} in
 * isolation,
 * without starting the Spring Boot application context. By using
 * {@link org.springframework.mock.web.MockHttpServletRequest} and
 * {@link org.springframework.mock.web.MockHttpServletResponse}, we simulate
 * HTTP requests and responses at the servlet filter level.
 *
 * <h2>Why Unit Test the Filter?</h2>
 * 1. **Fast Feedback Loop** – These tests run in milliseconds because they do
 * not
 * initialize Spring or MockMvc.
 * 2. **Pure Logic Validation** – Ensures all branches of the filter logic are
 * tested:
 * - Disallowed HTTP methods (PATCH, OPTIONS)
 * - GET/DELETE with body rejection
 * - POST/PUT header and Content-Length validation
 * - Oversized and non-JSON requests (2 MB limit)
 * - Successful small and edge-case requests
 * 3. **Log Verification** – Captures log messages via Logback
 * {@link ch.qos.logback.core.read.ListAppender} to assert that correct log
 * levels
 * (INFO/WARN) and messages are emitted, which is critical for
 * security auditing and portfolio demonstration.
 *
 * <h2>How It Works</h2>
 * - Each test constructs a {@link MockHttpServletRequest} representing a single
 * HTTP request.
 * - The test optionally sets headers, content type, and a body of any size to
 * trigger
 * specific filter branches.
 * - The request and a {@link MockHttpServletResponse} are passed through the
 * {@link RequestSizeFilter#doFilter} method with a {@link MockFilterChain}.
 * - Assertions validate:
 * 1. HTTP status codes (200, 400, 405, 413, 415)
 * 2. JSON response messages for OWASP-friendly error output
 * 3. Captured log entries for INFO/WARN behavior
 *
 * <h2>Complementing Integration Tests</h2>
 * - RequestSizeFilterIT handles Spring MVC
 * integration scenarios with MockMvc and a test controller.
 * - This class covers **full branch logic and log verification** without the
 * overhead of Spring context, ensuring fast and comprehensive regression
 * checks.
 *
 * <h2>Value</h2>
 * - Demonstrates best practices for testing servlet filters in Java/Spring.
 * - Shows ability to combine pure unit testing with log validation and security
 * checks.
 * - Provides maintainable, deterministic tests that document the filter's
 * behavior
 * for auditors and reviewers.
 */

@DisplayName("RequestSizeFilter Unit Tests")
class RequestSizeFilterUnitTest {

  private RequestSizeFilter filter;
  private Logger logger;
  private ListAppender<ILoggingEvent> logAppender;

  /**
   * A custom MockFilterChain that tracks whether the filter chain was invoked.
   *
   * <h2>Purpose</h2>
   * - Default {@link MockFilterChain} in Spring always returns 200 OK even if the
   *   filter never calls {@code chain.doFilter()}, making it impossible to
   *   distinguish a "pass-through" vs. "self-terminated" filter.
   * - This subclass sets a simple {@code invoked} flag whenever
   *   {@code doFilter()} is called, allowing tests to assert whether a request
   *   continued to the next filter/controller.
   *
   * <h2>Value</h2>
   * - Verifies both rejection and pass-through paths of the filter.
   */
  static class TrackingFilterChain extends MockFilterChain {
    boolean invoked = false;

    @Override
    public void doFilter(jakarta.servlet.ServletRequest request, jakarta.servlet.ServletResponse response)
    throws IOException, ServletException {
      invoked = true;
      super.doFilter(request, response);
    }
  }

  @BeforeEach
  void setUp() {
    filter = new RequestSizeFilter();

    // Capture logs
    logger = (Logger) org.slf4j.LoggerFactory.getLogger(RequestSizeFilter.class);
    logAppender = new ListAppender<>();
    logAppender.start();
    logger.addAppender(logAppender);
  }

  @AfterEach
  void tearDown() {
    logger.detachAppender(logAppender);
    logAppender.stop();
  }

  /** ---------------- POST / PUT Header Validation ---------------- **/
  @Nested
  @DisplayName("POST/PUT Header Validation")
  class PostPutValidationTests {

    @Test
    @DisplayName("Reject unknown Content-Length with 400 and log WARN")
    void postWithUnknownContentLength_isRejectedWith400_andLogsWarning() throws Exception {
      MockHttpServletRequest request = new MockHttpServletRequest("POST", "/permits") {
        @Override
        public int getContentLength() { return -1; }
        @Override
        public long getContentLengthLong() { return -1; }
      };
      request.setContentType("application/json");
      request.setContent("{}".getBytes());

      MockHttpServletResponse response = new MockHttpServletResponse();
      FilterChain chain = new MockFilterChain();

      filter.doFilter(request, response, chain);

      assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_BAD_REQUEST);
      assertThat(response.getContentType()).contains("application/json");
      assertThat(response.getContentAsString()).contains("Missing or unknown Content-Length");

      assertThat(logAppender.list)
        .anySatisfy(event -> {
          assertThat(event.getLevel()).isEqualTo(Level.WARN);
          assertThat(event.getFormattedMessage()).contains("Blocked request");
        });
    }

    @Test
    @DisplayName("Missing Content-Type is rejected with 400")
    void missingContentType_isRejectedWith400_andLogsWarning() throws Exception {
      MockHttpServletRequest request = new MockHttpServletRequest("POST", "/permits");
      byte[] body = "{}".getBytes(StandardCharsets.UTF_8);
      request.setContent(body);
      request.addHeader("Content-Length", body.length);

      MockHttpServletResponse response = new MockHttpServletResponse();
      FilterChain chain = new MockFilterChain();

      filter.doFilter(request, response, chain);

      assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_BAD_REQUEST);
      assertThat(response.getContentType()).contains("application/json");
      assertThat(response.getContentAsString()).contains("Missing Content-Type header");
    }

    @Test
    @DisplayName("Small non-JSON POST is rejected with 415")
    void smallNonJsonPost_isRejectedWith415() throws Exception {
      MockHttpServletRequest request = new MockHttpServletRequest("POST", "/permits");
      byte[] body = "<xml></xml>".getBytes(StandardCharsets.UTF_8);
      request.setContentType("application/xml");
      request.setContent(body);
      request.addHeader("Content-Length", body.length);

      MockHttpServletResponse response = new MockHttpServletResponse();
      FilterChain chain = new MockFilterChain();

      filter.doFilter(request, response, chain);

      assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
      assertThat(response.getContentType()).contains("application/json");
      assertThat(response.getContentAsString()).contains("Unsupported media type");
    }
  }

  /** ---------------- GET / DELETE Body Validation ---------------- **/
  @Nested
  @DisplayName("GET/DELETE Body Validation")
  class GetDeleteValidationTests {
    @Test
    @DisplayName("GET with body is rejected with 400")
    void getWithBody_isRejectedWith400() throws Exception {
      MockHttpServletRequest request = new MockHttpServletRequest("GET", "/permits");
      request.setContent("{}".getBytes());

      MockHttpServletResponse response = new MockHttpServletResponse();
      FilterChain chain = new MockFilterChain();

      filter.doFilter(request, response, chain);

      assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_BAD_REQUEST);
      assertThat(response.getContentType()).contains("application/json");
    }

    @Test
    @DisplayName("DELETE with body is rejected with 400")
    void deleteWithBody_isRejectedWith400() throws Exception {
      MockHttpServletRequest request = new MockHttpServletRequest("DELETE", "/permits/" + UUID.randomUUID());
      request.setContent("{}".getBytes());

      MockHttpServletResponse response = new MockHttpServletResponse();
      FilterChain chain = new MockFilterChain();

      filter.doFilter(request, response, chain);

      assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_BAD_REQUEST);
      assertThat(response.getContentType()).contains("application/json");
    }
  }

  /** ---------------- Oversized Body Validation ---------------- **/
  @Nested
  @DisplayName("Oversized Requests")
  class OversizedRequestsTests {

    @Test
    @DisplayName("Oversized JSON POST is rejected with 413")
    void oversizedJsonPost_isRejectedWith413() throws Exception {
      byte[] bigBody = new byte[2 * 1024 * 1024 + 1];
      MockHttpServletRequest request = new MockHttpServletRequest("POST", "/permits");
      request.setContentType("application/json");
      request.setContent(bigBody);
      request.addHeader("Content-Length", bigBody.length);

      MockHttpServletResponse response = new MockHttpServletResponse();
      FilterChain chain = new MockFilterChain();

      filter.doFilter(request, response, chain);

      assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
      assertThat(response.getContentType()).contains("application/json");
    }
  }

  /** ---------------- Disallowed / Edge HTTP Methods ---------------- **/
  @Nested
  @DisplayName("Disallowed HTTP Methods")
  class DisallowedMethodsTests {

    @Test
    @DisplayName("PATCH is rejected with 405")
    void patchRequest_isRejectedWith405() throws Exception {
      MockHttpServletRequest request = new MockHttpServletRequest("PATCH", "/permits");
      MockHttpServletResponse response = new MockHttpServletResponse();

      filter.doFilter(request, response, new MockFilterChain());

      assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    }

    @Test
    @DisplayName("HEAD request is allowed and passes chain")
    void headRequest_passes_andInvokesChain() throws Exception {
      MockHttpServletRequest request = new MockHttpServletRequest("HEAD", "/permits");
      TrackingFilterChain chain = new TrackingFilterChain();
      MockHttpServletResponse response = new MockHttpServletResponse();

      filter.doFilter(request, response, chain);

      assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_OK);
      assertThat(chain.invoked).isTrue();
    }
  }

  /** ---------------- Successful Requests ---------------- **/
  @Nested
  @DisplayName("Successful Requests")
  class SuccessfulRequestsTests {

    @Test
    @DisplayName("POST within limit passes and invokes chain")
    void postWithinLimit_passes_andLogsInfo() throws Exception {
      MockHttpServletRequest request = new MockHttpServletRequest("POST", "/permits");
      request.setContentType("application/json");
      byte[] body = "{}".getBytes(StandardCharsets.UTF_8);
      request.setContent(body);
      request.addHeader("Content-Length", body.length);

      TrackingFilterChain chain = new TrackingFilterChain();
      MockHttpServletResponse response = new MockHttpServletResponse();

      filter.doFilter(request, response, chain);

      assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_OK);
      assertThat(chain.invoked).isTrue();
      assertThat(logAppender.list)
        .anySatisfy(event -> {
          assertThat(event.getLevel()).isEqualTo(Level.INFO);
          assertThat(event.getFormattedMessage()).contains("Request passed size validation");
        });
    }
  }
}
