package com.permittrack.permitapi.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;

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

@DisplayName("RequestSizeFilter Tests")
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

            // Assert HTTP behavior
            assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_BAD_REQUEST);
            assertThat(response.getContentAsString())
                    .contains("Missing or unknown Content-Length header");

            // Assert logs
            assertThat(logAppender.list)
                    .anySatisfy(event -> {
                        assertThat(event.getLevel()).isEqualTo(Level.WARN);
                        assertThat(event.getFormattedMessage()).contains("Blocked request");
                    });
        }
    }

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

            assertThat(logAppender.list)
                    .anySatisfy(event -> {
                        assertThat(event.getLevel()).isEqualTo(Level.WARN);
                        assertThat(event.getFormattedMessage()).contains("Blocked request");
                    });
        }
    }

    @Nested
    @DisplayName("Oversized Body Validation")
    class OversizedRequestsTests {

        @Test
        @DisplayName("Oversized JSON POST is rejected with 413 and logs WARN")
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
                    .contains("JSON request payload exceeds 2 MB limit"); // Normalized space

            assertThat(logAppender.list)
                    .anySatisfy(event -> {
                        assertThat(event.getLevel()).isEqualTo(Level.WARN);
                        assertThat(event.getFormattedMessage()).contains("Blocked request");
                    });
        }

        @Test
        @DisplayName("Oversized non-JSON POST is rejected with 415 and logs WARN")
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
                    .contains("Unsupported media type"); // Partial match now

            assertThat(logAppender.list)
                    .anySatisfy(event -> {
                        assertThat(event.getLevel()).isEqualTo(Level.WARN);
                        assertThat(event.getFormattedMessage()).contains("Blocked request");
                    });
        }
    }

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

            // Assert HTTP behavior
            assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_OK);

            // Assert logging: exactly 1 INFO log
            long infoCount = logAppender.list.stream()
                    .filter(event -> event.getLevel() == Level.INFO)
                    .count();
            assertThat(infoCount).isEqualTo(1L);

            assertThat(logAppender.list)
                    .anySatisfy(event -> {
                        assertThat(event.getLevel()).isEqualTo(Level.INFO);
                        assertThat(event.getFormattedMessage()).contains("Request passed size validation");
                    });
        }

        /**
         * 0-length JSON POST should be accepted.
         *
         * Why:
         * ----
         * 1. **HTTP Spec Compliance** – POST requests with empty bodies are valid per
         * RFC 7231.
         * 2. **Real-World Scenarios** – Some APIs or webhooks use POST as a trigger
         * with no payload.
         * 3. **Filter Behavior Validation** – Confirms RequestSizeFilter does not
         * falsely reject safe requests.
         * 
         */
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

            // Assert HTTP behavior
            assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_OK);

            // Assert logging: exactly 1 INFO log
            long infoCount = logAppender.list.stream()
                    .filter(event -> event.getLevel() == Level.INFO)
                    .count();
            assertThat(infoCount).isEqualTo(1L);

            assertThat(logAppender.list)
                    .anySatisfy(event -> {
                        assertThat(event.getLevel()).isEqualTo(Level.INFO);
                        assertThat(event.getFormattedMessage()).contains("Request passed size validation");
                    });
        }

    }

}
