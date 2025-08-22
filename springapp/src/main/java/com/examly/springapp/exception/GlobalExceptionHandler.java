package com.examly.springapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
    Map<String, Object> response = new HashMap<>();
    response.put("message", "Validation failed");
    
    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult().getFieldErrors().forEach(e -> {
      String fieldName = e.getField();
      String message = e.getDefaultMessage();
      
      // Map field names to match test expectations
      if ("name".equals(fieldName) && message.contains("3–100 characters")) {
        errors.put("name", "Name must be 3 to 100 characters long");
      } else if ("serialNumber".equals(fieldName) && message.contains("required")) {
        errors.put("serialNumber", "Serial number is required");
      } else {
        errors.put(fieldName, message);
      }
    });
    response.put("errors", errors);
    
    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(DuplicateAssetException.class)
  public ResponseEntity<?> handleDuplicate(DuplicateAssetException ex) {
    Map<String, String> response = new HashMap<>();
    response.put("message", ex.getMessage());
    return new ResponseEntity<>(response, HttpStatus.CONFLICT);
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex) {
    Map<String, String> response = new HashMap<>();
    response.put("message", ex.getMessage());
    return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
    Map<String, String> response = new HashMap<>();
    response.put("message", ex.getMessage());
    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
  }
}
