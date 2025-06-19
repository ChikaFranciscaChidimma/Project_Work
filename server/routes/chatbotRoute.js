import express from 'express';
import { fetchBranchData } from '../services/chatbotService.js';


const router = express.Router();

router.post('/query', async (req, res) => {
  try {
    const { query, branch, role } = req.body;
    
    // Validate input
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid query parameter' 
      });
    }
    
    // Enforce branch privacy
    if (role !== 'admin' && !branch) {
      return res.status(403).json({ 
        error: 'Branch information required for this request' 
      });
    }
    
    // Process query with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );
    
    const response = await Promise.race([
      fetchBranchData(query, branch),
      timeoutPromise
    ]);
    
    res.json(response);
  } catch (error) {
    console.error('Chatbot route error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process chatbot request',
      response: "⚠️ I'm having trouble accessing that information right now. Please try again later."
    });
  }
});

export default router;