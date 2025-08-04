package com.permittrack.permitapi.config;

import java.io.IOException;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * RequestSizeFilter
 *
 * This filter enforces a maximum request body size for JSON (application/json)
 * requests.
 *
 *
 * Behavior:
 * ---------
 * - If Content-Length exceeds 2 MB, the filter returns 413
 * Payload Too Large with a small JSON body.
 * - Otherwise, the request continues normally down the filter
 * chain.
 *
 * Why we need this:
 * -----------------
 * 1. **OWASP Compliance**:
 * - OWASP recommends setting strict limits on request body
 * sizes to prevent
 * Denial-of-Service (DoS) attacks where a client sends an
 * extremely large
 * payload.
 *
 * 2. **Spring Boot Behavior**:
 * - Spring Boot's `spring.servlet.multipart.max-request-size`
 * ONLY applies to
 * multipart/form-data (file uploads).
 * - For normal JSON requests, Spring Boot does NOT enforce
 * any body size limit
 * by default.
 *
 * 3. **Server-Level Limits Aren't Enough**:
 * - Tomcat or Jetty can reject large requests at the
 * connector level,
 * but this results in raw 400/413 responses with no JSON
 * body.
 * - This filter allows the app to return a **clean,
 * OWASP-aligned JSON error** response.
 *
 * * * Why we write the response ourselves:
 * ------------------------------------
 * 1. **Filters Run Before Spring MVC (DispatcherServlet)**:
 * - Filters execute in the servlet container pipeline before the request
 * reaches Spring's DispatcherServlet.
 * - Exceptions thrown here (ServletException or ResponseStatusException) do NOT
 * trigger
 *
 * {@literal @ControllerAdvice} or Spring Boot's global error handling.
 *
 * 2. **Consistent OWASP-Friendly JSON Responses**:
 * - Without writing the response manually, Tomcat/MockMvc
 * will return an empty response or HTML error page.
 * - Writing JSON ourselves ensures the API always responds
 * with predictable, OWASP-aligned JSON.
 *
 * 3. **Gov / Portfolio Best Practice**:
 * - Security-related filters (rate limiting, request size, IP
 * blocking) should return clear,
 * structured responses directly in the filter to prevent
 * leaking internal errors.
 * - This approach mirrors how Spring Security filters send
 * 401/403 responses.
 *
 * 4. **Avoids DispatcherServlet Dependency**:
 * - Since the DispatcherServlet is never invoked for
 * oversized requests,
 * {@literal @ControllerAdvice} will never run.
 * - Writing the response here is the only way to guarantee
 * proper HTTP 413 responses.
 *
 * Notes:
 * ------
 * - The max size is currently set to 2 MB.
 * - Adjust MAX_SIZE based on business requirements.
 */

@Component
public class RequestSizeFilter implements Filter {

    private static final int MAX_SIZE = 2 * 1024 * 1024; // 2 MB
    private static final Logger LOGGER = LoggerFactory.getLogger(RequestSizeFilter.class);
    private static final Set<String> ALLOWED_METHODS = Set.of("GET", "POST", "PUT", "DELETE","HEAD");

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (!handleNonHttpServlet(request, response, chain)) {
            LOGGER.debug("Non-HTTP request skipped RequestSizeFilter.");
            return;
        }

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        if (!handleDisallowedMethods(httpRequest, httpResponse))
            return;
        if (!handleGetDeleteNoBody(httpRequest, httpResponse))
            return;
        if (!handlePostPutHeaderValidation(httpRequest, httpResponse))
            return;
        if (!handleBodyValidation(httpRequest, httpResponse))
            return;
        if(!handleHeadValidation(httpRequest, httpResponse))
          return;

        LOGGER.info("Request passed size validation: method={}, uri={}, contentLength={}",
                httpRequest.getMethod(), httpRequest.getRequestURI(), httpRequest.getContentLength());

        // Pass through if all checks pass
        chain.doFilter(request, response);
    }

    /* -------------------- 1. Reject Non-HTTP -------------------- */
    private boolean handleNonHttpServlet(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (!(request instanceof HttpServletRequest) || !(response instanceof HttpServletResponse)) {
            chain.doFilter(request, response);
            return false; // skip rest of filter logic
        }
        return true;
    }

    /* -------------------- 2. Disallowed Methods -------------------- */
    private boolean handleDisallowedMethods(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String method = req.getMethod();
        if (!ALLOWED_METHODS.contains(method)) {
            logAndReject(req, resp, HttpServletResponse.SC_METHOD_NOT_ALLOWED,
                    "HTTP method not allowed: " + method);
            return false;
        }
        return true;
    }

    /* -------------------- 3. GET/DELETE Block Bodies -------------------- */
    private boolean handleGetDeleteNoBody(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String method = req.getMethod();
        int length = req.getContentLength();
        if ((method.equals("GET") || method.equals("DELETE")) && length > 0) {
            logAndReject(req, resp, HttpServletResponse.SC_BAD_REQUEST,
                    "Request body not allowed for " + method + " requests");
            return false;
        }
        return true;
    }

    /* -------------------- 4. POST/PUT Validate Headers -------------------- */
    private boolean handlePostPutHeaderValidation(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String method = req.getMethod();
        if (!(method.equals("POST") || method.equals("PUT"))) {
            return true; // skip for GET/DELETE
        }

        String contentType = req.getContentType();
        if (contentType == null) {
            logAndReject(req, resp, HttpServletResponse.SC_BAD_REQUEST,
                    "Missing Content-Type header");
            return false;
        }

      if (!"application/json".equalsIgnoreCase(req.getContentType())) {
        LOGGER.warn("Blocked request with unsupported media type: {}", req.getContentType());
        resp.setStatus(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
        resp.setContentType("application/json");
        resp.getWriter().write("{\"error\":\"Unsupported media type\"}");
        return false;
      }

        int length = req.getContentLength();
        if (length < 0) {
            logAndReject(req, resp, HttpServletResponse.SC_BAD_REQUEST,
                    "Missing or unknown Content-Length header");
            return false;
        }

        return true;
    }

    /* -------------------- 5. Validate Bodies -------------------- */
    private boolean handleBodyValidation(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String method = req.getMethod();
        if (!(method.equals("POST") || method.equals("PUT"))) {
            return true; // skip for GET/DELETE
        }

        int length = req.getContentLength();
        if (length <= MAX_SIZE) {
            return true; // valid size
        }

        boolean isJson = req.getContentType() != null && req.getContentType().startsWith("application/json");
        if (isJson) {
            logAndReject(req, resp, HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE,
                    "JSON request payload exceeds 2 MB limit");
        } else {
            logAndReject(req, resp, HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE,
                    "Unsupported media type: only application/json requests are allowed up to 2 MB");
        }
        return false;
    }

    /* -------------------- Helper: Log & Reject -------------------- */
    private void logAndReject(HttpServletRequest req, HttpServletResponse resp,
            int status, String message) throws IOException {
        LOGGER.warn("Blocked request: method={}, uri={}, contentType={}, contentLength={}",
                req.getMethod(), req.getRequestURI(),
                req.getContentType(), req.getContentLength());

        resp.setStatus(status);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().write("{ \"message\": \"" + message + "\" }");
        resp.getWriter().flush();
    }
  /**
   * Validates a HEAD request.
   *
   * <h2>Behavior</h2>
   * - Rejects any HEAD request with a body (HTTP 400)
   * - Allows empty-body HEAD requests to pass through
   * - Logs blocked requests at WARN level for security auditing
   */
  private boolean handleHeadValidation(HttpServletRequest req, HttpServletResponse resp) throws IOException {

    String method = req.getMethod();
    if (!(method.equals("HEAD"))) {
      return true;
    }

    if (req.getContentLength() > 0 || req.getContentLengthLong() > 0) {
      LOGGER.warn("Blocked HEAD request with body: uri={}", req.getRequestURI());
      resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      resp.setContentType("application/json");
      resp.getWriter().write("{\"error\":\"Request body not allowed for HEAD requests\"}");
      return false; // stop filter chain
    }
    return true; // proceed with chain.doFilter()
  }

}
