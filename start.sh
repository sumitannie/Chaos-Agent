#!/bin/bash

# 1. Start Java Chaos Engine in the background
java -jar target/*.jar &

# 2. Start the local dummy target in the background
cd tinyfish-chaos-agent
node dummy-target.js &

# 3. Start the Node.js API & React Server on HF's port
export PORT=7860
node agent.js