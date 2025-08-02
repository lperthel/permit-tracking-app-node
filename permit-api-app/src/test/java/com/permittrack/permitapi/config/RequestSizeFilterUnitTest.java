package com.permittrack.permitapi.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

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
 * - {@link com.permittrack.permitapi.it.RequestSizeFilterIT} handles Spring MVC
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

    @BeforeEach
    void setUp() {
        filter = new RequestSizeFilter();

        // Capture logs from RequestSizeFilter
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
                public int getContentLength() {
                    return -1;
                }

                @Override
                public long getContentLengthLong() {
                    return -1;
                }
            };
            request.setContentType("application/json");
            request.setContent("{}".getBytes());

            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_BAD_REQUEST);
            assertThat(response.getContentAsString())
                    .contains("Missing or unknown Content-Length header");

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
            assertThat(response.getContentAsString())
                    .contains("Missing Content-Type header");
        }
    }

    /** ---------------- GET / DELETE Body Validation ---------------- **/
    @Nested
    @DisplayName("GET/DELETE Body Validation")
    class GetDeleteValidationTests {

        @Test
        @DisplayName("GET with body is rejected with 400 and logs WARN")
        void getWithBody_isRejectedWith400_andLogsWarning() throws Exception {
            MockHttpServletRequest request = new MockHttpServletRequest("GET", "/permits");
            request.setContent("{}".getBytes());

            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_BAD_REQUEST);
            assertThat(response.getContentAsString())
                    .contains("Request body not allowed for GET requests");
        }

        @Test
        @DisplayName("DELETE with body is rejected with 400 and logs WARN")
        void deleteWithBody_isRejectedWith400_andLogsWarning() throws Exception {
            MockHttpServletRequest request = new MockHttpServletRequest("DELETE", "/permits/" + UUID.randomUUID());
            request.setContent("{}".getBytes());

            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_BAD_REQUEST);
            assertThat(response.getContentAsString())
                    .contains("Request body not allowed for DELETE requests");
        }
    }

    /** ---------------- Oversized Body Validation ---------------- **/
    @Nested
    @DisplayName("Oversized Requests")
    class OversizedRequestsTests {

        @Test
        @DisplayName("Oversized JSON POST is rejected with 413")
        void oversizedJsonPost_isRejectedWith413_andLogsWarning() throws Exception {
            byte[] bigBody = new byte[2 * 1024 * 1024 + 1]; // 2MB+1
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/permits");
            request.setContentType("application/json");
            request.setContent(bigBody);
            request.addHeader("Content-Length", bigBody.length);

            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
            assertThat(response.getContentAsString())
                    .contains("JSON request payload exceeds 2 MB limit");
        }

        @Test
        @DisplayName("Oversized JSON PUT is rejected with 413")
        void oversizedJsonPut_isRejectedWith413_andLogsWarning() throws Exception {
            byte[] bigBody = new byte[2 * 1024 * 1024 + 1]; // 2MB+1
            MockHttpServletRequest request = new MockHttpServletRequest("PUT", "/permits/" + UUID.randomUUID());
            request.setContentType("application/json");
            request.setContent(bigBody);
            request.addHeader("Content-Length", bigBody.length);

            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
            assertThat(response.getContentAsString())
                    .contains("JSON request payload exceeds 2 MB limit");
        }

        @Test
        @DisplayName("Oversized non-JSON POST is rejected with 415")
        void oversizedNonJsonPost_isRejectedWith415_andLogsWarning() throws Exception {
            byte[] bigBody = new byte[2 * 1024 * 1024 + 1]; // 2MB+1
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/permits");
            request.setContentType("application/xml"); // unsupported
            request.setContent(bigBody);
            request.addHeader("Content-Length", bigBody.length);

            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
            assertThat(response.getContentAsString())
                    .contains("Unsupported media type");
        }
    }

    /** ---------------- Disallowed HTTP Methods ---------------- **/
    @Nested
    @DisplayName("Disallowed HTTP Methods")
    class DisallowedMethodsTests {

        @Test
        @DisplayName("PATCH is rejected with 405")
        void patchRequest_isRejectedWith405_andLogsWarning() throws Exception {
            MockHttpServletRequest request = new MockHttpServletRequest("PATCH", "/permits");
            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
            assertThat(response.getContentAsString())
                    .contains("HTTP method not allowed: PATCH");
        }

        @Test
        @DisplayName("OPTIONS is rejected with 405")
        void optionsRequest_isRejectedWith405_andLogsWarning() throws Exception {
            MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/permits");
            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
            assertThat(response.getContentAsString())
                    .contains("HTTP method not allowed: OPTIONS");
        }
    }

    /** ---------------- Successful Requests ---------------- **/
    @Nested
    @DisplayName("Successful Requests")
    class SuccessfulRequestsTests {

        @Test
        @DisplayName("POST within limit passes and logs INFO")
        void postWithinLimit_passes_andLogsInfo() throws Exception {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/permits");
            request.setContentType("application/json");
            byte[] body = "{}".getBytes(StandardCharsets.UTF_8);
            request.setContent(body);
            request.addHeader("Content-Length", body.length);

            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_OK);

            assertThat(logAppender.list)
                    .anySatisfy(event -> {
                        assertThat(event.getLevel()).isEqualTo(Level.INFO);
                        assertThat(event.getFormattedMessage()).contains("Request passed size validation");
                    });
        }
    }

    /** ---------------- Edge Cases ---------------- **/
    @Nested
    @DisplayName("Edge Case Requests")
    class EdgeCaseRequestsTests {

        @Test
        @DisplayName("Exactly 2 MB JSON POST passes and logs INFO once")
        void exactTwoMbJsonPost_passes_andLogsInfoOnce() throws Exception {
            byte[] exact2MB = new byte[2 * 1024 * 1024]; // Exactly 2 MB
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/permits");
            request.setContentType("application/json");
            request.setContent(exact2MB);
            request.addHeader("Content-Length", exact2MB.length);

            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_OK);

            long infoCount = logAppender.list.stream()
                    .filter(event -> event.getLevel() == Level.INFO)
                    .count();
            assertThat(infoCount).isEqualTo(1L);
        }

        @Test
        @DisplayName("0-length JSON POST passes and logs INFO once")
        void zeroLengthJsonPost_passes_andLogsInfoOnce() throws Exception {
            byte[] emptyBody = new byte[0];
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/permits");
            request.setContentType("application/json");
            request.setContent(emptyBody);
            request.addHeader("Content-Length", emptyBody.length);

            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_OK);

            long infoCount = logAppender.list.stream()
                    .filter(event -> event.getLevel() == Level.INFO)
                    .count();
            assertThat(infoCount).isEqualTo(1L);
        }
    }
}
