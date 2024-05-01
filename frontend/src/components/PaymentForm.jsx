import React, { useState } from 'react';

const PaymentForm = ({ onPayment }) => {
  const [amount, setAmount] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Call onPayment function with the entered amount
    onPayment(amount);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button type="submit">Pay</button>
    </form>
  );
};

export default PaymentForm;
