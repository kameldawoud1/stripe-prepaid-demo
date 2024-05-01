const express = require('express');
const stripe = require('stripe')(
  'sk_test_51PAnPsCSBgqy4orWhoJiOJ45PH1U62zONv1cXwb6Qaj7kvdVzbjJAfHKAgGgPccVP8cCXEzDU1EgLPJ3Q8toGewW00v7zpO3UO'
);
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Set up your Express server and Stripe API key
app.get('/api/get-cards/:customerId', async (req, res) => {
  const customerId = req.params.customerId;
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      type: 'card',
      limit: 3,
      customer: customerId,
    });
    const cards = paymentMethods.data.length > 0 ? paymentMethods.data : [];
    res.json({ cards });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/check-customer/:customerId', async (req, res) => {
  const customerId = req.params.customerId;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    res.json({ exists: !!customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/create-customer', async (req, res) => {
  try {
    const customer = await stripe.customers.create();
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/add-card/:customerId', async (req, res) => {
  const customerId = req.params.customerId;
  const { cardToken } = req.body;
  try {
    await stripe.customers.createSource(customerId, { source: cardToken });
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/payment-intent', async (req, res) => {
  try {
    const { amount, customerId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert amount to cents
      currency: 'usd',
      customer: customerId, // Pass the customer ID to create PaymentIntent for this customer
    });

    res.json({ paymentIntent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create Payment Intent' });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
