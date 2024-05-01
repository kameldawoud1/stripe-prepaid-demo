import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
const stripePromise = loadStripe(
  'pk_test_51PAnPsCSBgqy4orWeEURu4ZdQ9l5lFTeZrpocJljScA0CNkvtrKq8RTjZknJASoBiW540lHY5smFldrIKaf74iH000aYkIiP9f'
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
        <Elements stripe={stripePromise}>
    <App />
    </Elements>

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
