package com.example.chaosagent;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import reactor.core.publisher.Mono;

@Service
public class FireworksService {

    @Value("${fireworks.api.key}")
    private String apiKey;

    @Value("${fireworks.api.url}")
    private String apiUrl;

    @Value("${fireworks.model}")
    private String model;

    private final WebClient webClient = WebClient.builder().build();
    private final Gson gson = new Gson();

    public Mono<TestConfiguration> generateTestConfig(RawNetworkData rawData) {
        String prompt = "Extract the API endpoint, method, headers, and body from this raw data. Return ONLY a valid JSON object matching this schema: { \"endpoint\": \"url\", \"httpMethod\": \"POST/GET\", \"headers\": {\"key\":\"value\"}, \"jsonPayload\": \"stringified json\" }. Raw Data: " + gson.toJson(rawData);

        Map<String, Object> requestBody = Map.of(
            "model", model,
            "messages", List.of(
                Map.of("role", "system", "content", "You are a network traffic analyzer. You must respond ONLY with raw, valid JSON. Do not include any conversational text, explanations, or chain-of-thought reasoning. Do not wrap the output in markdown code blocks or backticks. Start your response immediately with the '{' character and end with '}'."),
                Map.of("role", "user", "content", prompt)
            ),
            "temperature", 0.0
        );

        return webClient.post()
            .uri(apiUrl)
            .header("Authorization", "Bearer " + apiKey)
            .header("Content-Type", "application/json")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(String.class)
            .map(this::parseAiResponse);
    }

    private TestConfiguration parseAiResponse(String aiResponse) {
        JsonObject jsonObject = gson.fromJson(aiResponse, JsonObject.class);
        String content = jsonObject.getAsJsonArray("choices")
            .get(0).getAsJsonObject()
            .getAsJsonObject("message")
            .get("content").getAsString();

        System.out.println("\n=== RAW AI RESPONSE ===");
        System.out.println(content);
        System.out.println("=======================\n");

        int startIndex = content.indexOf('{');
        int endIndex = content.lastIndexOf('}');

        if (startIndex != -1 && endIndex != -1 && endIndex >= startIndex) {
            String cleanJson = content.substring(startIndex, endIndex + 1);
            return gson.fromJson(cleanJson, TestConfiguration.class);
        }

        throw new RuntimeException("Could not find valid JSON format in AI response.");
    }
}