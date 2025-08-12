// sms.js
require('dotenv').config();
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendOrderSMS(vendorPhone, orderDetails) {
const messageText = `Hi ${orderDetails.vendorName}, you have a new order (#${orderDetails.orderId}). View order: ${orderDetails.orderLink}`;
  try {
    await client.messages.create({
      body: messageText,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: vendorPhone
    });
    console.log(`✅ SMS sent to ${vendorPhone} for Order #${orderDetails.orderId}`);
  } catch (error) {
    console.error(`❌ Failed to send SMS to ${vendorPhone}. Error: ${error.message}`);
  }
}

module.exports = { sendOrderSMS };
