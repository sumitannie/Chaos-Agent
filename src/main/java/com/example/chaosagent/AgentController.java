package com.example.chaosagent;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/agent")
public class AgentController {

    private final FireworksService fireworksService;
    private final LoadTestEngine loadTestEngine;

    public AgentController(FireworksService fireworksService, LoadTestEngine loadTestEngine) {
        this.fireworksService = fireworksService;
        this.loadTestEngine = loadTestEngine;
    }

    @PostMapping("/trigger-chaos")
    public Mono<String> triggerChaos(@RequestBody RawNetworkData rawData) {
        return fireworksService.generateTestConfig(rawData)
            .flatMap(config -> loadTestEngine.executeTest(config, rawData.getRequestedConcurrency()));
    }
}