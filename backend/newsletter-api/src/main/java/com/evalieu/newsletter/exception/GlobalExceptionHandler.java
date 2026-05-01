package com.evalieu.newsletter.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body(ex.getMessage(), HttpStatus.NOT_FOUND.value()));
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<Map<String, Object>> handleRateLimitExceeded(RateLimitExceededException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .body(body(ex.getMessage(), HttpStatus.TOO_MANY_REQUESTS.value()));
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicate(DuplicateResourceException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body(ex.getMessage(), HttpStatus.CONFLICT.value()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> envelope = baseBody(HttpStatus.BAD_REQUEST.value());
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream().collect(Collectors.toMap(
            FieldError::getField,
            fe -> fe.getDefaultMessage() == null ? "invalid" : fe.getDefaultMessage(),
            (a, b) -> a,
            LinkedHashMap::new
        ));
        envelope.put("error", "Validation failed");
        envelope.put("fieldErrors", fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(envelope);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body(ex.getMessage(), HttpStatus.BAD_REQUEST.value()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(body(ex.getMessage() == null ? "Internal server error" : ex.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR.value()));
    }

    private Map<String, Object> body(String message, int status) {
        Map<String, Object> envelope = baseBody(status);
        envelope.put("error", message);
        return envelope;
    }

    private Map<String, Object> baseBody(int status) {
        Map<String, Object> envelope = new LinkedHashMap<>();
        envelope.put("status", status);
        envelope.put("timestamp", OffsetDateTime.now().toString());
        return envelope;
    }
}
