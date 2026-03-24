package com.example.chaosagent;

import java.util.Map;

import lombok.Data;

@Data
public class TestConfiguration {
    private String endpoint;
    private String httpMethod;
    private Map<String, String> headers;
    private String jsonPayload;
}