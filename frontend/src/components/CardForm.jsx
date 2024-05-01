import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
const CARD_ELEMENT_OPTIONS = {
  hidePostalCode: true, // Hides the postal code field
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
const CardForm = ({ onCardAddition }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (error) {
      console.error(error);
    } else {
      onCardAddition(paymentMethod);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement options={CARD_ELEMENT_OPTIONS} />
      <button type="submit" disabled={!stripe}>
        Add Card
      </button>
    </form>
  );
};

export default CardForm;
