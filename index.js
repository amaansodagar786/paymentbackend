require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post("/checkout", async (req, res) => {
  try {
      const { items, customerName, customerAddress } = req.body;

      const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: items.map(item => ({
              price_data: {
                  currency: "inr",
                  product_data: {
                      name: item.name
                  },
                  unit_amount: item.price * 100,
              },
              quantity: item.quantity
          })),
          success_url: "https://github.com/amaansodagar786",
          cancel_url: "https://vercel.com/amaan-sodagars-projects",
          customer_email: "test@example.com", // Example email
          billing_address_collection: 'required', // Require billing address
          shipping_address_collection: {
              allowed_countries: ['IN'] // Allow shipping address from India
          },
          metadata: {
              customer_name: customerName,
              customer_address: customerAddress
          }
      });

      res.json({ sessionId: session.id }); // Return sessionId instead of URL
  } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
    res.send('Hello 400000!')
    })

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server connected on port ${PORT}`);
});
