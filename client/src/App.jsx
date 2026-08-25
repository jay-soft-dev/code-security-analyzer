import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { ShieldAlert, CheckCircle, Code, Play, RefreshCw } from 'lucide-react';

export default function App() {
  const [code, setCode] = useState('// Paste your C, C++, or JS code here\n');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/analyze', {
        code,
        language
      });
      setResult(response.data.data);
    } catch (err) {
      alert('Error analyzing code! Make sure backend is running on port 5000.');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldAlert color="#38bdf8" /> AI Security Code Reviewer
      </h2>
      
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)} 
          style={{ padding: '8px 12px', borderRadius: '4px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155' }}
        >
          <option value="javascript">JavaScript</option>
          <option value="cpp">C / C++</option>
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
          {loading ? 'Scanning...' : 'Scan Code'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Code Editor */}
        <div style={{ border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden' }}>
          <Editor
            height="450px"
            theme="vs-dark"
            language={language}
            value={code}
            onChange={(val) => setCode(val)}
          />
        </div>

        {/* Security Audit Report */}
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', overflowY: 'auto', maxHeight: '450px', border: '1px solid #334155' }}>
          <h3>Security Audit Report</h3>
          {result ? (
            <div>
              <div style={{ padding: '10px', backgroundColor: '#0f172a', borderRadius: '6px', marginBottom: '15px' }}>
                <h4 style={{ margin: 0 }}>
                  Security Score: <span style={{ color: '#38bdf8' }}>{result.securityScore}</span>
                </h4>
              </div>

              <h4>Vulnerabilities Found:</h4>
              {result.vulnerabilities?.length > 0 ? (
                result.vulnerabilities.map((item, index) => (
                  <div key={index} style={{ borderLeft: '4px solid #ef4444', paddingLeft: '10px', marginBottom: '12px', backgroundColor: '#0f172a', padding: '8px', borderRadius: '4px' }}>
                    <strong style={{ color: item.severity === 'High' ? '#ef4444' : '#f59e0b' }}>
                      [{item.severity}] {item.type}
                    </strong>
                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#cbd5e1' }}>{item.description}</p>
                  </div>
                ))
              ) : (
                <p style={{ color: '#22c55e' }}>No obvious vulnerabilities found!</p>
              )}

              <h4>Fixes & Recommendations:</h4>
              <p style={{ fontSize: '13px', color: '#cbd5e1' }}>{result.fixes}</p>

              <h4>Suggested Secure Code:</h4>
              <pre style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '4px', fontSize: '12px', overflowX: 'auto', color: '#38bdf8' }}>
                {result.secureCode}
              </pre>
            </div>
          ) : (
            <p style={{ color: '#94a3b8' }}>Paste your code on the left and click 'Scan Code' to run security audit.</p>
          )}
        </div>
      </div>
    </div>
  );
}