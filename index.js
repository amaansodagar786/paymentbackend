import React, { useState } from 'react';
import { useStripe, useElements, CardNumberElement, CardCvcElement, CardExpiryElement } from '@stripe/react-stripe-js';
import './CheckoutForm.scss';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [description, setDescription] = useState(''); // Add description state

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardNumberElement);

    try {
      // Create Payment Method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsProcessing(false);
        return;
      }

      // Call backend to create Payment Intent with all necessary details
      const response = await fetch('http://localhost:4000/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1000, // Adjust amount as per your requirement
          description,
          customer_name: customerName,
          customer_address: customerAddress,
        }),
      });

      const data = await response.json();

      // Confirm the Payment Intent
      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (confirmError) {
        setErrorMessage(confirmError.message);
        setIsProcessing(false);
      } else {
        alert('Payment successful!');
        // Handle success (e.g., redirect, update UI)
      }
    } catch (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
      alert('Payment failed: ' + error.message);
    }
  };

  return (
    <div className="checkout-form">
      <form onSubmit={handleSubmit}>
        <label htmlFor="customer-name">Customer Name</label>
        <input
          type="text"
          id="customer-name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />

        <label htmlFor="customer-address">Customer Address</label>
        <textarea
          id="customer-address"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          required
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label htmlFor="card-number">Card Number</label>
        <CardNumberElement
          id="card-number"
          className="StripeElement"
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
        <label htmlFor="card-expiry">Card Expiry</label>
        <CardExpiryElement
          id="card-expiry"
          className="StripeElement"
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
        <label htmlFor="card-cvc">Card CVC</label>
        <CardCvcElement
          id="card-cvc"
          className="StripeElement"
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? 'Processing...' : 'Pay 10 Rs'}
        </button>
      </form>
    </div>
  );
};

export default CheckoutForm;
