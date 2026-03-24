# 🧨 ChaosAgent Engine

![Version](https://img.shields.io/badge/version-2.0_DYNAMIC-blue.svg)
![Java](https://img.shields.io/badge/Java-21%2B_(Virtual_Threads)-orange.svg)
![Node.js](https://img.shields.io/badge/Node.js-Middleman_API-green.svg)
![React](https://img.shields.io/badge/React-Vite_UI-cyan.svg)
![AI](https://img.shields.io/badge/AI-TinyFish_&_DeepSeek-purple.svg)

> **Evaluate website server resilience through autonomous high-concurrency stress testing.**

## 📖 Overview
Traditional load testing requires QA engineers to manually extract session tokens, write static testing scripts, and maintain them every time the UI changes. **The ChaosAgent Engine** solves this by introducing a multi-agent AI architecture into the QA pipeline. 

This system dynamically targets any web application, uses a Vision-Language Model to navigate the UI and extract live authentication payloads, seamlessly forwards those credentials to a high-performance Java Spring Boot engine for extreme-concurrency stress testing, and finally generates a professional LLM-based diagnostic report based on the packet drop rate.

---

🏗️ System Architecture
-This project utilizes a modern Microservice Architecture, separating concerns across three distinct environments:

-The Command Center (React/Vite): A dark-mode, responsive UI for deployment configuration, real-time logging, and attack vector management.

-The AI Orchestrator (Node.js/Express): A middleman API that injects dynamic system prompts, manages the TinyFish VLM Server-Sent Events (SSE) stream, and requests post-test diagnostic reports from DeepSeek via the Fireworks API.

-The Chaos Engine (Java Spring Boot): A high-throughput backend utilizing Java 21 Virtual Threads to simulate massive traffic spikes (up to 10,000 concurrent connections) without overwhelming the host OS network queue.

✨ Core Features
-Autonomous Payload Extraction (TinyFish): The Action AI visually scans the target URL, executes login flows, and extracts dynamic Auth Tokens/Cookies on the fly.

-Extreme Concurrency: Utilizes lightweight Java Virtual Threads to generate massive network spikes, bypassing the hardware limitations of traditional Platform Threads.

-Dual-Vector Safety Switch: * Live End-to-End: Caps concurrency at 100 threads for safe public endpoint testing.

-Local Firing Range: Reroutes up to 10,000 threads to a local dummy server to safely measure maximum hardware/network packet drop rates without risking IP bans.

-LLM Root-Cause Analysis (DeepSeek): Automatically calculates server failure rates and generates human-readable diagnostic QA reports.

🚀 Quick Start Guide
Prerequisites
-Node.js (v18+)

-Java JDK (v21+)

-TinyFish API Key & Fireworks API Key

-

1. Start the Java Chaos Engine
Navigate to your Spring Boot directory and boot the application:

Bash
# Starts the Virtual Thread Executor on Port 8080
./mvnw spring-boot:run
2. Start the AI Orchestrator & Local Target
Open two separate terminals in the tinyfish-chaos-agent folder:

Bash
# Terminal 1: Boot the dummy target to absorb local stress tests
node dummy-target.js 

# Terminal 2: Boot the AI Middleman API
```bash
npm install
node agent.js
```
3. Launch the Command Center
Navigate to the chaos-dashboard folder:
```bash
Bash
npm install
npm run dev
Open http://localhost:5173 in your browser. Enter your target URL, set your concurrency via the slider, select your attack vector, and deploy the agent.


## 📂 Project Structure

```bash
chaos-agent/
├── .env                           # Global API Keys (TinyFish, Fireworks)
├── README.md                      # Documentation
│
├── chaos-dashboard/               # 1. The Command Center (Frontend)
│   ├── src/
│   │   ├── App.jsx                # React UI, State Management & Dashboard Logic
│   │   ├── App.css                # Custom Cyber-Themed CSS & Dynamic Styling
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── tinyfish-chaos-agent/          # 2. The AI Orchestrator (Middleman)
│   ├── agent.js                   # Node.js/Express API (Routes TinyFish & DeepSeek)
│   ├── dummy-target.js            # Local Express server for safe stress-testing
│   └── package.json
│
└── spring-boot-chaos-engine/      # 3. The Chaos Engine (Backend)
    ├── src/main/java/.../
    │   ├── ChaosController.java   # REST API receiving AI payloads
    │   └── VirtualThreadRunner.java # High-concurrency load generation logic
    └── pom.xml
```

📊 Example Output (Local Stress Test)
Plaintext
[+] AI Reconnaissance Target: [https://the-internet.herokuapp.com/login](https://the-internet.herokuapp.com/login)
[+] Mode: LOCAL
[+] SAFETY ENGAGED: 🛡️ Java traffic rerouted to Local Server (127.0.0.1:4000)
[+] Waking AI Middleman...
[+] AI Mission Success. Extracted Data: {"status":"success","message":"The login was successful.","credentials":{"username":"tomsmith","password":"SuperSecretPassword!"}}
[+] Fired 7410 concurrent threads via Java Spring Boot at -> [http://127.0.0.1:4000](http://127.0.0.1:4000)
[+] AI Diagnostic Report: The stress test indicates a significant capacity bottleneck, with over 70% of requests (5,158 out of 7,410) being dropped due to server overload. Immediate scaling or optimization of virtual thread configuration is recommended to reduce dropped requests.
[+] Raw System Metrics: Test Successful. Target Server Capacity Reached. Successful Hits: 2252 , Dropped/Overloaded: 5158
