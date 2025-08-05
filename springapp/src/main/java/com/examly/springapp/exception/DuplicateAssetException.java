package com.examly.springapp.exception;

public class DuplicateAssetException extends RuntimeException {
    public DuplicateAssetException(String message) {
        super(message);
    }
}
