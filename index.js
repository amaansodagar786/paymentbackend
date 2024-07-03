require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all origins

app.post('/create-payment-intent', async (req, res) => {
  const { amount, customerName, customerAddress } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'inr',
      description: 'Description of the product or service', // Add a description here
      metadata: {
        customer_name: customerName,
        customer_address: customerAddress,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating Payment Intent:', error);
    res.status(500).json({ error: 'Failed to create Payment Intent' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server connected on port ${PORT}`);
});
