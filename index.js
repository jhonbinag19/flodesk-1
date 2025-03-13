import express from 'express';
import cors from 'cors';
import { handleFlodeskAction } from './src/handlers/flodeskHandler.js';

const app = express();

// CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Create router for API routes
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

// Subscriber Endpoints
// 1. Get All Subscribers
// GET https://flodeskendpoints.vercel.app/api/subscribers
apiRouter.get('/subscribers', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header is required'
      });
    }

    await handleFlodeskAction(req, res, {
      action: 'getAllSubscribers',
      apiKey,
      payload: {}
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// 2. Get Specific Subscriber
// GET https://flodeskendpoints.vercel.app/api/subscribers/{email}
apiRouter.get('/subscribers/:email', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    const email = decodeURIComponent(req.params.email);
    
    await handleFlodeskAction(req, res, {
      action: 'getSubscriber',
      apiKey,
      payload: { email }
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// 3. Create/Update Subscriber
// POST https://flodeskendpoints.vercel.app/api/subscribers
apiRouter.post('/subscribers', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    await handleFlodeskAction(req, res, {
      action: 'createOrUpdateSubscriber',
      apiKey,
      payload: req.body
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// 4. Add to Segments
// POST https://flodeskendpoints.vercel.app/api/subscribers/{email}/segments
apiRouter.post('/subscribers/:email/segments', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    const email = decodeURIComponent(req.params.email);
    await handleFlodeskAction(req, res, {
      action: 'addToSegments',
      apiKey,
      payload: { 
        email,
        segmentIds: req.body.segmentIds
      }
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// 5. Remove from Segment
// DELETE https://flodeskendpoints.vercel.app/api/subscribers/{email}/segments/{segmentId}
apiRouter.delete('/subscribers/:email/segments/:segmentId', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    const email = decodeURIComponent(req.params.email);
    const segmentId = req.params.segmentId;
    
    await handleFlodeskAction(req, res, {
      action: 'removeFromSegment',
      apiKey,
      payload: { email, segmentId }
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// 6. Unsubscribe from All
// POST https://flodeskendpoints.vercel.app/api/subscribers/{email}/unsubscribe
apiRouter.post('/subscribers/:email/unsubscribe', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    const email = decodeURIComponent(req.params.email);
    
    await handleFlodeskAction(req, res, {
      action: 'unsubscribeFromAll',
      apiKey,
      payload: { email }
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Segment Endpoints
// 1. Get All Segments
// GET https://flodeskendpoints.vercel.app/api/segments
apiRouter.get('/segments', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    await handleFlodeskAction(req, res, {
      action: 'getAllSegments',
      apiKey,
      payload: {}
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Mount API routes at /api
app.use('/api', apiRouter);

// Catch-all for undefined routes
app.use('*', (req, res) => {
  console.log('404 for path:', req.originalUrl);
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
    error: err.message
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// For Vercel
export default app;