import React, { useEffect } from 'react';
import { loadMoov } from '@moovio/moov-js';
import header from '../assets/header.png';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch(
          'https://f533-2600-1700-8520-9ba0-900a-87b4-ad47-3176.ngrok-free.app/api/generate-token',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const initialToken = data.token;
        const moovInstance = await loadMoov(initialToken);
        console.log('Moov.js loaded with initial token:', moovInstance);

        const onboarding = document.querySelector('moov-onboarding');
        onboarding.token = initialToken;
        onboarding.open = true;
        console.log('Onboarding token set:', onboarding.token);

        onboarding.onResourceCreated = async ({ resourceType, resource }) => {
          if (resourceType === 'account') {
            const { accountID } = resource;
            console.log(`Account created with ID: ${accountID}`);
            localStorage.setItem('accountID', accountID);

            try {
              const accountTokenResponse = await fetch(
                `https://f533-2600-1700-8520-9ba0-900a-87b4-ad47-3176.ngrok-free.app/api/generate-account-token?newAccountID=${accountID}`,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                  },
                }
              );

              if (!accountTokenResponse.ok) {
                throw new Error(
                  `HTTP error! status: ${accountTokenResponse.status}`
                );
              }

              const accountTokenData = await accountTokenResponse.json();
              const accountToken = accountTokenData.token;

              const paymentMethods = document.querySelector(
                'moov-payment-methods'
              );
              paymentMethods.token = accountToken;
              paymentMethods.accountID = accountID;

              onboarding.open = false;
              paymentMethods.open = true;

              paymentMethods.onCancel = () => {
                console.log('User canceled linking payment method');
                paymentMethods.open = false;
                navigate('/profile');
              };
            } catch (error) {
              console.error('Error fetching account token:', error);
            }
          }
        };
      } catch (error) {
        console.error('Error fetching initial token:', error);
      }
    };

    fetchToken();
  }, [navigate]);

  return (
    <>
      <div
        className='min-h-screen bg-cover'
        style={{ backgroundImage: `url(${header})` }}
      >
        <moov-onboarding></moov-onboarding>

        <moov-payment-methods></moov-payment-methods>
      </div>
    </>
  );
}
