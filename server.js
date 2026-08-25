import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Code Security Audit Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // System Prompt for Security Auditor
    const prompt = `
    You are a Senior Cybersecurity Auditor and Code Optimizer. 
    Analyze the following ${language || 'programming'} code for security vulnerabilities, memory leaks, and performance issues.

    Provide the response strictly in JSON format with the following structure:
    {
      "securityScore": "Score out of 10 (e.g., 6.5/10)",
      "vulnerabilities": [
        {
          "type": "Vulnerability Name (e.g., Buffer Overflow, SQL Injection, JWT Flaw)",
          "severity": "High/Medium/Low",
          "line": "Line number or snippet",
          "description": "Brief explanation of the risk"
        }
      ],
      "fixes": "Detailed explanation of how to fix these issues",
      "secureCode": "The fully refactored, secure, and optimized code"
    }

    Code to analyze:
    \`\`\`
    ${code}
    \`\`\`
    `;

    // Generate response using Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text);
    res.json({ success: true, data: result });

  } catch (error) {
    console.error('Error analyzing code:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze code' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));