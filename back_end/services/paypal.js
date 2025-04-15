// back_end/services/paypal.js
const fetch = require('node-fetch');
const dotenv = require("dotenv");
const express = require("express");
const fs = require("fs");
const path = require("path");
dotenv.config({ path: path.join(__dirname, '..', '.env') });


const CLIENT_ID = process.env.CLIENT_ID_paypal;
const SECRET = process.env.SECRET_paypal;

async function getAccessToken() {
  const res = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await res.json();
  return data.access_token;
}

async function createProduct(accessToken, productData) {
  const res = await fetch('https://api-m.sandbox.paypal.com/v1/catalogs/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
  });

  return await res.json();
}

async function createPlan(accessToken, planData) {
  const res = await fetch('https://api-m.sandbox.paypal.com/v1/billing/plans', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(planData)
  });

  return await res.json();
}

module.exports = {
  getAccessToken,
  createProduct,
  createPlan
};
