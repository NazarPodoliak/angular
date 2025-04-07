const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51RAMwbCMHaFAwkgnIG660LwXujq97MpZPENmC2PKZB9JQ5oWsGFLOKa24fwluWHHJ7FFxYh294bIpG7JwluQ64xK00kZtFQHBM');

const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'Server is working!' });
});

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

app.post('/checkout', async (req, res) => {
  try {
    console.log('=== Checkout Request Started ===');
    console.log('Request headers:', req.headers);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { items } = req.body;
    
    if (!items) {
      console.error('No items in request body');
      return res.status(400).json({ error: 'No items in request body' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      console.error('Items is not an array or is empty');
      return res.status(400).json({ error: 'Items must be a non-empty array' });
    }

    console.log('Processing items:', JSON.stringify(items, null, 2));
    
    // Validate each item
    items.forEach((item, index) => {
      if (!item.name || !item.price || !item.quantity) {
        console.error(`Invalid item at index ${index}:`, item);
        throw new Error(`Invalid item format at index ${index}`);
      }
    });
    
    // Create line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.product],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    console.log('Created line items:', JSON.stringify(lineItems, null, 2));

    // Create Stripe session
    console.log('Creating Stripe session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:4200/success',
      cancel_url: 'http://localhost:4200/cart',
    });

    console.log('Stripe session created successfully:', session.id);
    console.log('=== Checkout Request Completed ===');
    
    res.json({ id: session.id });
  } catch (error) {
    console.error('=== Checkout Error ===');
    console.error('Error type:', error.type);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param
    });
    console.error('=== End Error Details ===');
    
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message,
      type: error.type,
      code: error.code
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = 4242;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Make sure you have set your Stripe secret key!');
}); 