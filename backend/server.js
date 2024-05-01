/* const express = require("express");
const cors = require('cors')

const app = express();
// This is your test secret API key.
const stripe = require("stripe")('sk_test_51PAnPsCSBgqy4orWhoJiOJ45PH1U62zONv1cXwb6Qaj7kvdVzbjJAfHKAgGgPccVP8cCXEzDU1EgLPJ3Q8toGewW00v7zpO3UO');
app.use(cors())

app.use(express.static("public"));
app.use(express.json());

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});


app.listen(4242, () => console.log("Node server listening on port 4242!")); */
// server/app.js

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
