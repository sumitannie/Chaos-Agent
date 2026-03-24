package com.example.chaosagent;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
public class LoadTestEngine {

    private final WebClient webClient = WebClient.builder().build();

    public Mono<String> executeTest(TestConfiguration config, int concurrency) {
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger errorCount = new AtomicInteger(0);

        return Flux.range(1, concurrency)
            .parallel()
            .runOn(Schedulers.boundedElastic())
            .flatMap(i -> sendRequest(config)
                .doOnSuccess(res -> successCount.incrementAndGet())
                .doOnError(err -> errorCount.incrementAndGet())
                .onErrorResume(e -> Mono.empty()))
            .sequential()
            .then(Mono.defer(() -> Mono.just(
                String.format("Test Successful. Target Server Capacity Reached. Successful Hits: %d , Dropped/Overloaded: %d", successCount.get(), errorCount.get())
            )));
    }

    private Mono<String> sendRequest(TestConfiguration config) {
        WebClient.RequestBodySpec requestSpec = webClient
            .method(org.springframework.http.HttpMethod.valueOf(config.getHttpMethod()))
            .uri(config.getEndpoint());

        if (config.getHeaders() != null) {
            config.getHeaders().forEach(requestSpec::header);
        }

        if (config.getJsonPayload() != null && !config.getJsonPayload().isEmpty()) {
            requestSpec.bodyValue(config.getJsonPayload());
        }

        return requestSpec.retrieve()
            .bodyToMono(String.class)
            .timeout(Duration.ofSeconds(5));
    }
}