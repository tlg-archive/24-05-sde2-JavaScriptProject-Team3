const express = require('express');
const dotenv = require('dotenv');
const { Moov, SCOPES } = require('@moovio/node');

dotenv.config();

const router = express.Router();

router.get('/generate-token', async (req, res) => {
  console.log('Starting token generation...');
  const moov = new Moov({
    accountID: process.env.MOOV_ACCOUNT_ID,
    publicKey: process.env.PUBLIC_KEY,
    secretKey: process.env.PRIVATE_KEY,
    domain: process.env.DOMAIN,
  });

  const scopes = [
    SCOPES.ACCOUNTS_CREATE,
    SCOPES.ACCOUNTS_READ,
    SCOPES.FED_READ,
    SCOPES.PROFILE_ENRICHMENT_READ,
  ];

  try {
    console.log('Generating token with scopes:', scopes);
    const { token } = await moov.generateToken(scopes);
    console.log('INITIAL TOKEN WORKS ON BACKEND', token);
    return res.status(200).json({ token });
  } catch (error) {
    console.error(`Error fetching token: ${error.message}`);
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.statusText,
      });
    } else if (error.request) {
      return res.status(500).json({
        error: 'No response received from the server',
      });
    } else {
      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  }
});

router.get('/generate-account-token', async (req, res) => {
  const { newAccountID } = req.query;
  console.log('Received request for newAccountID:', newAccountID);

  const moov = new Moov({
    accountID: process.env.MOOV_ACCOUNT_ID,
    publicKey: process.env.PUBLIC_KEY,
    secretKey: process.env.PRIVATE_KEY,
    domain: process.env.DOMAIN,
  });

  const scopes = [
    `/accounts/${newAccountID}/cards.read`,
    `/accounts/${newAccountID}/cards.write`,
    `/accounts/${newAccountID}/bank-accounts.read`,
    `/accounts/${newAccountID}/bank-accounts.write`,
    `/fed.read`,
  ];

  try {
    console.log('Generating token with scopes:', scopes);
    const { token } = await moov.generateToken(scopes);
    console.log('SECOND TOKEN WORKS ON BACKEND', token);
    return res.status(200).json({ token });
  } catch (error) {
    console.error(`Error generating account token: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/retrieve-account', async (req, res) => {
  const { accountID } = req.query;
  console.log(
    'Received request to retrieve account details for accountID:',
    accountID
  );

  const moov = new Moov({
    accountID: process.env.MOOV_ACCOUNT_ID,
    publicKey: process.env.PUBLIC_KEY,
    secretKey: process.env.PRIVATE_KEY,
    domain: process.env.DOMAIN,
  });

  const scopes = [`/accounts/${accountID}/profile.read`];

  try {
    console.log('Generating token with scopes for account details:', scopes);
    const { token } = await moov.generateToken(scopes);
    console.log('Token for account details generated:', token);

    const accountDetails = await moov.get(`/accounts/${accountID}`, { token });
    console.log('Account details retrieved:', accountDetails);
    return res.status(200).json({ accountDetails });
  } catch (error) {
    console.error(`Error retrieving account details: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
