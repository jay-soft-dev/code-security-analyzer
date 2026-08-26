
app.post('/api/analyze', async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

  
    const prompt = `
    You are an expert Code Security & Performance Auditor. 
    Analyze the following code written in ${language || 'Auto-Detect Language'}:

    Code:
    \`\`\`
    ${code}
    \`\`\`

    Provide the analysis strictly in JSON format with the following keys:
    {
      "securityScore": <Number between 0 to 100>,
      "summary": "<Brief summary of code quality and main security feedback>",
      "vulnerabilities": ["<Vulnerability 1>", "<Vulnerability 2>"],
      "suggestedFix": "<Refactored, secure, and optimized code>"
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean response to handle JSON formatting
    const cleanedJson = responseText.replace(/```json|```/g, '').trim();
    res.json(JSON.parse(cleanedJson));

  } catch (error) {
    console.error('Error analyzing code:', error);
    res.status(500).json({ error: 'Failed to analyze code' });
  }
});