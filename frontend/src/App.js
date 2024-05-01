import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

function App() {
  const [customerId, setCustomerId] = useState(() =>
    localStorage.getItem('customerId')
  );
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [amount, setAmount] = useState('');
  const stripe = useStripe();
  const elements = useElements();
  const CARD_ELEMENT_OPTIONS = {
    hidePostalCode: true,
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
      },
    },
  };

  useEffect(() => {
    if (customerId) {
      fetchCards();
    }
  }, [customerId]);

  async function createCustomer() {
    try {
      const response = await fetch(
        'http://localhost:5000/api/create-customer',
        { method: 'POST' }
      );
      const data = await response.json();
      setCustomerId(data.id);
      localStorage.setItem('customerId', data.id);
    } catch (error) {
      console.error(error);
    }
  }

  async function addCard() {
    const cardElement = elements.getElement(CardElement);
    const { error, token } = await stripe.createToken(cardElement);
    if (!error) {
      try {
        await fetch(`http://localhost:5000/api/add-card/${customerId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardToken: token.id }),
        });
        cardElement.clear();
        fetchCards();
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error(error);
    }
  }

  async function fetchCards() {
    try {
      const response = await fetch(
        `http://localhost:5000/api/get-cards/${customerId}`
      );
      const data = await response.json();
      console.log('cards', data);
      setCards(data.cards);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchPaymentIntent() {
    try {
      // Fetch the customer ID from localStorage
      const customerId = localStorage.getItem('customerId');

      const response = await fetch('http://localhost:5000/api/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          customerId: customerId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Payment Intent');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async function handlePayment() {
    try {
      const { paymentIntent } = await fetchPaymentIntent();
      console.log({ selectedCard });
      const { error } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: selectedCard,
        }
      );

      if (!error) {
        showMessage('Payment succeeded');
        console.log('Payment succeeded');
      } else {
        showMessage('Payment failed. Please try again.');
        console.error(error);
      }
    } catch (error) {
      showMessage('An error occurred. Please try again later.');
      console.error(error);
    }
  }
  function showMessage(message) {
    alert(message);
  }

  return (
    <div
      style={{
        background: 'blue',
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '500px',
          background: '#ffff',
          height: '300px',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
        }}
      >
        {!customerId ? (
          <button onClick={createCustomer}>Create Customer</button>
        ) : (
          <>
            <CardElement options={CARD_ELEMENT_OPTIONS} />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px',
              }}
            >
              <button onClick={addCard}>Add Card</button>
            </div>
            <select onChange={(e) => setSelectedCard(e.target.value)}>
              <option key={'test'} value={''} disabled selected>
                select card
              </option>
              {cards?.map((card) => (
                <>
                  <option key={card.id} value={card.id}>
                    {card.brand} **** **** **** {card.card.last4}
                  </option>
                </>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              placeholder="amout"
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              onClick={handlePayment}
              disabled={cards.length === 0 || !selectedCard}
            >
              Pay
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
