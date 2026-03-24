package com.example.chaosagent;

import lombok.Data;

@Data
public class RawNetworkData {
    private String url;
    private String method;
    private String rawHeaders;
    private String rawBody;
    private int requestedConcurrency;
}