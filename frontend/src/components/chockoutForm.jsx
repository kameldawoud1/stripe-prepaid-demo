// client/src/CheckoutForm.js

import React, { useEffect, useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import "./../App.css"

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [customerId, setCustomerId] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if customer data exists in localStorage
    const storedCustomer = localStorage.getItem('customer');
    if (storedCustomer) {
      const { customerId, cards } = JSON.parse(storedCustomer);
      setCustomerId(customerId);
      setCards(cards);
    }
  }, []);

  const handleCreateCustomer = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/createCustomer');
      const { customerId } = response.data.customer;
      setCustomerId(customerId);
      localStorage.setItem('customer', JSON.stringify({ customerId, cards: [] }));
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  const handleAddCard = async () => {
    try {
      const cardElement = elements.getElement(CardElement);
      const { paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      const response = await axios.post('http://localhost:5000/api/addCard', {
        customerId,
        cardToken: paymentMethod.id,
      });
      const { card } = response.data;
      setCards([...cards, card]);
      localStorage.setItem('customer', JSON.stringify({ customerId, cards: [...cards, card] }));
    } catch (error) {
      console.error('Error adding card:', error);
    }
  };

  const handleProcessPayment = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:5000/api/processPayment', {
        customerId,
        cardId: selectedCard,
        amount,
        currency: 'usd', // Change the currency as needed
      });
      console.log('Payment processed:', response.data.paymentIntent);
      setMessage('Payment successful!');
    } catch (error) {
      console.error('Error processing payment:', error);
      setMessage('Payment failed!');
    }
    setIsLoading(false);
  };

  const handleCardChange = (event) => {
    setSelectedCard(event.target.value);
  };

  return (
    <div>
      {!customerId ? (
        <button onClick={handleCreateCustomer} disabled={isLoading}>
          Create Customer
        </button>
      ) : (
        <>
          <select value={selectedCard} onChange={handleCardChange}>
            <option value="">Select Card</option>
            {cards.map((card) => (
              <option key={card.id} value={card.id}>
                Card ending in {card.last4}
              </option>
            ))}
          </select>
          <CardElement />
          <button onClick={handleAddCard} disabled={!stripe || isLoading}>
            Add Card
          </button>
          <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
          <button onClick={handleProcessPayment} disabled={!stripe || !selectedCard || isLoading}>
            {isLoading ? 'Processing...' : 'Pay'}
          </button>
        </>
      )}
      {message && <div>{message}</div>}
    </div>
  );
}
