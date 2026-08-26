import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { ShieldAlert, Play, RefreshCw } from 'lucide-react';

export default function App() {
  const [code, setCode] = useState('// Paste your code here in any programming language...\n');
  const [language, setLanguage] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Dynamic backend URL for production (Vercel/Render) or fallback to local port 5000
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const handleAnalyze = async () => {
    if (!code.trim()) {
      alert('Please enter some code to analyze!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/analyze`, {
        code,
        language
      });
      setResult(response.data.data || response.data);
    } catch (err) {
      console.error(err);
      alert('Error analyzing code! Please ensure the backend server is active.');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldAlert color="#38bdf8" /> AI Security Code Reviewer
      </h2>
      
      {/* Controls Bar */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)} 
          style={{ padding: '8px 12px', borderRadius: '4px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155', outline: 'none' }}
        >
          <option value="auto">✨ Auto Detect Language</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="java">Java</option>
          <option value="csharp">C#</option>
          <option value="php">PHP</option>
          <option value="html">HTML / CSS</option>
          <option value="sql">SQL</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
        </select>
        
        <button 
          onClick={handleAnalyze} 
          disabled={loading} 
          style={{ 
            padding: '8px 16px', 
            cursor: loading ? 'not-allowed' : 'pointer', 
            backgroundColor: '#38bdf8', 
            color: '#000',
            fontWeight: 'bold',
            border: 'none', 
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {loading ? <RefreshCw className="spin" size={16} /> : <Play size={16} />}
          {loading ? 'Scanning Code...' : 'Scan Code'}
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Code Editor Panel */}
        <div style={{ border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden' }}>
          <Editor
            height="500px"
            theme="vs-dark"
            language={language === 'auto' ? 'javascript' : language}
            value={code}
            onChange={(val) => setCode(val || '')}
          />
        </div>

        {/* Security Audit Report Output Panel */}
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', overflowY: 'auto', maxHeight: '500px', border: '1px solid #334155' }}>
          <h3 style={{ marginTop: 0 }}>Security Audit Report</h3>
          
          {result ? (
            <div>
              <div style={{ padding: '10px 15px', backgroundColor: '#0f172a', borderRadius: '6px', marginBottom: '15px' }}>
                <h4 style={{ margin: 0 }}>
                  Security Score: <span style={{ color: result.securityScore >= 70 ? '#22c55e' : result.securityScore >= 40 ? '#f59e0b' : '#ef4444' }}>{result.securityScore ?? 'N/A'}/100</span>
                </h4>
              </div>

              {result.summary && (
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>Summary:</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1' }}>{result.summary}</p>
                </div>
              )}

              <h4>Vulnerabilities Found:</h4>
              {result.vulnerabilities && result.vulnerabilities.length > 0 ? (
                result.vulnerabilities.map((item, index) => (
                  <div key={index} style={{ borderLeft: '4px solid #ef4444', padding: '10px', marginBottom: '12px', backgroundColor: '#0f172a', borderRadius: '4px' }}>
                    {typeof item === 'object' ? (
                      <>
                        <strong style={{ color: item.severity === 'High' ? '#ef4444' : '#f59e0b' }}>
                          [{item.severity || 'Warning'}] {item.type || 'Issue'}
                        </strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#cbd5e1' }}>{item.description}</p>
                      </>
                    ) : (
                      <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>• {item}</p>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: '#22c55e' }}>No obvious vulnerabilities found!</p>
              )}

              {(result.fixes || result.suggestedFix) && (
                <>
                  <h4>Fixes & Recommendations:</h4>
                  <p style={{ fontSize: '13px', color: '#cbd5e1' }}>{result.fixes || 'Review the suggested secure implementation below.'}</p>
                </>
              )}

              {(result.secureCode || result.suggestedFix) && (
                <>
                  <h4>Suggested Secure Code:</h4>
                  <pre style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', fontSize: '12px', overflowX: 'auto', color: '#38bdf8', border: '1px solid #334155' }}>
                    {result.secureCode || result.suggestedFix}
                  </pre>
                </>
              )}
            </div>
          ) : (
            <p style={{ color: '#94a3b8' }}>Paste your code on the left and click 'Scan Code' to run security audit.</p>
          )}
        </div>
      </div>
    </div>
  );
}