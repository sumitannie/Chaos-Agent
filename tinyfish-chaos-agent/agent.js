import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

const TARGET_BACKEND_URL = "http://127.0.0.1:8080/api/agent/trigger-chaos";

app.post('/api/launch', async (req, res) => {
    const targetUrl = req.body.url;
    const requestedConcurrency = req.body.concurrency || 10;
    const attackMode = req.body.mode || 'local';

    let aiGoal = "";
    
    if (targetUrl.includes("the-internet.herokuapp.com")) {
        aiGoal = "Type 'tomsmith' into the username field, 'SuperSecretPassword!' into the password field, and click the login button. Return the username and password used.";
    } else {
        const randomFuzzUser = `chaos_agent_${Math.floor(Math.random() * 99999)}`;
        aiGoal = `You are an automated QA chaos agent. Scan the page for the primary input form. Fill the username or email field with '${randomFuzzUser}' and the password field with 'SystemTest!@#123'. Submit the form. Return the exact credentials used.`;
    }

    console.log(`\n[+] TARGET SECURED: ${targetUrl}`);
    console.log(`[+] ATTACK MODE: ${attackMode.toUpperCase()}`);
    console.log(`[+] THREAD COUNT: ${requestedConcurrency}`);

    if (!process.env.TINYFISH_API_KEY) {
        return res.status(500).json({ error: "TinyFish API Key missing" });
    }

    try {
        // 1. TINYFISH EXTRACTS PAYLOAD
        const tinyfishResponse = await fetch("https://agent.tinyfish.ai/v1/automation/run-sse", {
            method: "POST",
            headers: {
                "X-API-Key": process.env.TINYFISH_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: targetUrl,
                goal: aiGoal,
            }),
        });

        if (!tinyfishResponse.ok) return res.status(500).json({ error: "TinyFish API rejected the request." });

        const reader = tinyfishResponse.body.getReader();
        const decoder = new TextDecoder();
        let extractedAiData = null;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            if (chunk.trim() !== "") {
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const cleanJson = JSON.parse(line.replace('data: ', '').trim());
                            if (cleanJson.type === "COMPLETE" && cleanJson.result) {
                                extractedAiData = cleanJson.result;
                            }
                        } catch (e) {}
                    }
                }
            }
        }

        if (extractedAiData) {
            const finalPayloadTarget = attackMode === 'local' ? "http://127.0.0.1:4000/api/attack-surface" : targetUrl;
            console.log(`[+] Forwarding dynamic payload to Java Chaos Engine -> ${finalPayloadTarget}`);

            const dynamicNetworkTraffic = {
                url: finalPayloadTarget,
                method: "POST",
                rawHeaders: "Authorization: Bearer tinyfish-live-session",
                rawBody: JSON.stringify(extractedAiData),
                requestedConcurrency: requestedConcurrency
            };

            const backendResponse = await axios.post(TARGET_BACKEND_URL, dynamicNetworkTraffic);
            const rawJavaData = backendResponse.data; 

            console.log("[+] Requesting DeepSeek QA Report via Fireworks API...");
            let deepseekReport = rawJavaData; 

            if (process.env.FIREWORKS_API_KEY) {
                try {
                    const aiReportResponse = await axios.post(
                        "https://api.fireworks.ai/inference/v1/chat/completions",
                        {
                            model: "accounts/fireworks/models/deepseek-v3p2",
                            messages: [
                                { 
                                    role: "system", 
                                    content: "You are an elite enterprise DevOps and QA Engineer. You analyze raw load-testing data and return a professional, 2-to-3 sentence diagnostic report. Do not use markdown, just plain text." 
                                },
                                { 
                                    role: "user", 
                                    content: `Analyze this raw Java Virtual Thread stress test output and provide a brief professional diagnostic report for the dashboard: ${rawJavaData}` 
                                }
                            ]
                        },
                        {
                            headers: {
                                "Authorization": `Bearer ${process.env.FIREWORKS_API_KEY}`,
                                "Content-Type": "application/json"
                            }
                        }
                    );
                    deepseekReport = aiReportResponse.data.choices[0].message.content.trim();
                } catch (aiError) {
                    console.error("[-] DeepSeek Analysis Failed.");
                    console.error("[-] Reason:", aiError.response ? aiError.response.data : aiError.message);
                }
            }

            res.json({ 
                status: "success", 
                message: deepseekReport, 
                rawMetrics: rawJavaData,
                aiFindings: extractedAiData 
            });

        } else {
            res.status(500).json({ error: "TinyFish failed to extract data." });
        }
    } catch (error) {
        res.status(500).json({ error: "System Error occurred." });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Dynamic AI Agent Middleman is online on Port ${PORT}`);
});