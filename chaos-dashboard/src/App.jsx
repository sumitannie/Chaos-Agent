import { useState } from 'react';
import axios from 'axios';
import { Terminal, ShieldAlert, Activity, Play, Zap, AlertTriangle } from 'lucide-react';
import './App.css';

function App() {
  const [targetUrl, setTargetUrl] = useState("");
  const [concurrency, setConcurrency] = useState(10);
  const [attackMode, setAttackMode] = useState("local");
  const [status, setStatus] = useState("Idle");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const maxConcurrency = attackMode === "live" ? 100 : 10000;

  const handleModeChange = (e) => {
    const newMode = e.target.value;
    setAttackMode(newMode);
    if (newMode === "live" && concurrency > 100) {
      setConcurrency(100);
    }
  };

  const loadDemo = () => {
    setTargetUrl("https://the-internet.herokuapp.com/login");
    setAttackMode("local");
    setConcurrency(5000);
  };

  const launchChaosAgent = async () => {
    if (!targetUrl) return alert("Please provide a Target URL.");
    
    setLoading(true);
    setStatus("Deploying Autonomous Agent...");
    setLogs([
      `[+] AI Reconnaissance Target: ${targetUrl}`, 
      `[+] Mode: ${attackMode.toUpperCase()}`,
      attackMode === 'local' ? `[+] SAFETY ENGAGED: 🛡️ Java traffic rerouted to Local Server (127.0.0.1:4000)` : `[+] WARNING: ⚠️ Live fire engaged against public target.`,
      `[+] Waking AI Middleman...`
    ]);

    try {
      const response = await axios.post('/api/launch', { 
        url: targetUrl,
        concurrency: concurrency,
        mode: attackMode
      });
      
      setStatus("Attack Complete");
      const attackIP = attackMode === 'local' ? 'http://127.0.0.1:4000' : targetUrl;

      setLogs(prev => [
        ...prev, 
        `[+] AI Mission Success. Extracted Data: ${JSON.stringify(response.data.aiFindings)}`,
        `[+] Fired ${concurrency} concurrent threads via Java Spring Boot at -> ${attackIP}`,
        `[+] AI Diagnostic Report: ${response.data.message}`,
        `[+] Raw System Metrics: ${response.data.rawMetrics}`
      ]);
    } catch (error) {
      setStatus("Mission Failed");
      setLogs(prev => [...prev, `[-] Error: ${error.response?.data?.error || error.message}`]);
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="header-brand">
          <ShieldAlert size={32} color="#10b981" />
          <h1>ChaosAgent Engine</h1>
          <span className="badge">v2.0 DYNAMIC</span>
        </div>
        <div className="header-mission">
          Evaluate website server resilience through autonomous high-concurrency stress testing.
        </div>
      </header>

      <main className="main-content">
        <div className="control-panel">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h2><Activity size={20} /> Deployment Parameters</h2>
            <button className="demo-btn" onClick={loadDemo}><Zap size={14}/> Load Demo Preset</button>
          </div>
          
          <div className="input-group">
            <label>Target Web Application URL</label>
            <input 
              type="text" 
              placeholder="https://example.com/login"
              value={targetUrl} 
              onChange={(e) => setTargetUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label>Attack Vector (Safety Switch)</label>
            <select 
              value={attackMode} 
              onChange={handleModeChange} 
              disabled={loading}
              style={{ background: '#0d1117', border: '1px solid #30363d', color: '#c9d1d9', padding: '0.75rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '1rem', outline: 'none' }}
            >
              <option value="local">Local Firing Range (Safe Stress Test - Max 10,000)</option>
              <option value="live">Live End-to-End (Public Target - Max 100)</option>
            </select>
            {attackMode === 'local' && (
              <span style={{ fontSize: '0.85rem', color: '#8b949e', fontStyle: 'italic', marginTop: '-5px' }}>
                ↳ AI extracts payload from public URL. Java engine safely attacks <strong>http://127.0.0.1:4000</strong>.
              </span>
            )}
          </div>

          <div className="input-group">
            <label>Java Virtual Thread Concurrency: {concurrency}</label>
            <input 
              type="range" 
              min="10" max={maxConcurrency} step={attackMode === "live" ? "10" : "100"}
              value={concurrency} 
              onChange={(e) => setConcurrency(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <button 
            className={`launch-btn ${attackMode === 'live' ? 'btn-live' : 'btn-local'} ${loading ? 'loading' : ''}`} 
            onClick={launchChaosAgent}
            disabled={loading}
          >
            {attackMode === 'live' ? <AlertTriangle size={20} /> : <Play size={20} />}
            {loading ? "Agent Active..." : (attackMode === 'live' ? "INITIATE LIVE ATTACK" : "Run Local Stress Test")}
          </button>
        </div>

        <div className="terminal-window">
          <div className="terminal-header">
            <Terminal size={16} />
            <span>System Output - Status: {status}</span>
          </div>
          <div className="terminal-body">
            {logs.length === 0 ? (
              <p className="system-text">Awaiting deployment instructions...</p>
            ) : (
              logs.map((log, index) => (
                <p key={index} className={log.includes('[-]') ? 'error-text' : 'success-text'}>
                  {log}
                </p>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;