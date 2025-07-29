package com.permittrack.permitapi.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletResponse;

class RequestSizeFilterUnitTest {

    @Test
    void postWithUnknownContentLength_isRejectedWith400() throws Exception {
        // Arrange
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/permits") {
            @Override
            public int getContentLength() {
                return -1; // simulate unknown
            }

            @Override
            public long getContentLengthLong() {
                return -1; // simulate unknown
            }
        };
        request.setContentType("application/json");
        request.setContent("{}".getBytes());

        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = new MockFilterChain();

        // Act
        new RequestSizeFilter().doFilter(request, response, chain);

        // Assert
        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_BAD_REQUEST);
        assertThat(response.getContentAsString())
                .contains("Missing or unknown Content-Length header");
    }

}
