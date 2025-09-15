const express = require('express');
const app = express();

app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Simple test server is working!' });
});

// Test login route
app.post('/test-login', (req, res) => {
  console.log('Received login request:', req.body);
  res.json({ 
    message: 'Test login endpoint reached!',
    received: req.body
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/test`);
});