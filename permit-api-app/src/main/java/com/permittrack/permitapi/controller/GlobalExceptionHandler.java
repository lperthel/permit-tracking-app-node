package com.permittrack.permitapi.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.permittrack.permitapi.model.ResourceNotFoundException;

import jakarta.servlet.ServletException;

/**
 * GlobalExceptionHandler is a centralized error handling component for the
 * application.
 * 
 * It uses Spring's @ControllerAdvice to intercept and handle specific
 * exceptions
 * thrown by controllers across the application. This promotes consistent and
 * centralized
 * error response formatting, especially for input validation and type mismatch
 * scenarios.
 *
 * This class is part of the backend architecture for the permit tracking app,
 * designed for a FISMA-conscious environment where structured and meaningful
 * error
 * reporting improves frontend validation and API usability.
 */

@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles validation errors that occur when @Valid fails in a controller
     * method.
     * 
     * It extracts field-specific error messages and returns them in a map keyed by
     * field name.
     * 
     * This format is particularly frontend-friendly for displaying per-field
     * validation errors.
     *
     * Example:
     * {
     * "startDate": "must not be null",
     * "permitType": "is required"
     * }
     *
     * @param ex the MethodArgumentNotValidException thrown when validation fails
     * @return a 400 Bad Request response with field-specific validation error
     *         messages
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    /**
     * Handles cases where method arguments (such as path variables or query
     * parameters)
     * are of the wrong type—e.g., an invalid UUID is passed when a UUID is
     * expected.
     *
     * For simplicity and security, the response does not echo back the bad input.
     *
     * @param ex the MethodArgumentTypeMismatchException thrown when a type mismatch
     *           occurs
     * @return a 404 Not Found response with a simple error message
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<String> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        if (ex.getRequiredType() == UUID.class) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Invalid UUID");
        }
        return ResponseEntity.badRequest().body("Invalid parameter: " + ex.getName());

    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    /**
     * Handles JSON parsing errors that occur when the request body cannot be
     * deserialized.
     * 
     * This is particularly useful for catching issues like invalid enum values or
     * malformed JSON.
     *
     * It returns a 400 Bad Request with a generic error message and details about
     * the invalid value.
     *
     * @param ex      the HttpMessageNotReadableException thrown when JSON parsing
     *                fails
     * @param request the current web request
     * @return a 400 Bad Request response with a structured error message
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, WebRequest request) {

        // Response body as a simple map (will be converted to JSON)
        Map<String, Object> body = new HashMap<>();
        body.put("error", "Invalid request");
        // ✅ Generic error title for OWASP:
        // Do not leak framework or stack details in production responses

        // Check if the underlying cause is an InvalidFormatException
        // This usually happens if Jackson cannot deserialize a value
        // e.g., an invalid enum string like "UNKNOWN" → PermitStatus
        if (ex.getCause() instanceof InvalidFormatException ife) {
            body.put("details", new String[] {
                    // Build a concise message identifying the invalid value and field
                    // OWASP: Identify the field and value, but do not expose internal class names
                    "Invalid value: " + ife.getValue() +
                            " for field: " + ife.getPath().get(0).getFieldName()
            });
        } else {
            // Fallback for other JSON parsing errors
            // (malformed JSON, wrong types, missing quotes, etc.)
            body.put("details", new String[] {
                    "Malformed JSON or unsupported value"
            });
        }

        // Return a clean 400 Bad Request with the JSON body
        // ✅ Keeps response consistent for all deserialization failures
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ServletException.class)
    public ResponseEntity<Object> handleServletException(ServletException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "Invalid request");

        // OWASP-friendly response
        if (ex.getMessage().contains("Request body too large")) {
            body.put("details", new String[] { "Request payload exceeds 2 MB limit" });
            return new ResponseEntity<>(body, HttpStatus.PAYLOAD_TOO_LARGE); // 413
        }

        body.put("details", new String[] { ex.getMessage() });
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

}
