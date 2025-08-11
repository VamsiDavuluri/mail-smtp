// index.js (Complete, Final Version with VML Fix)

require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

/**
 * Creates the HTML for the product variants (e.g., Size, Color).
 */
const createVariantHtml = (options) => {
  if (!options || options.length === 0) return '';
  return `<div class="variant-text" style="font-size: 13px; color: #555555; margin-top: 5px;">${options.map(opt => `<strong>${opt.label}:</strong> ${opt.value}`).join('<br>')}</div>`;
};

/**
 * Creates the HTML for the main product rows.
 */
const createProductRows = (products) => {
  if (!products || products.length === 0) return '<tr><td colspan="5" style="padding: 15px; text-align: center; color: #888;">No products in this order.</td></tr>';
  return products.map(p => {
    const formattedPrice = (p.price || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
    return `
      <tr class="product-row">
        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; vertical-align: top; width: 84px;">
          <img src="${p.imageUrl}" alt="${p.name}" width="60" style="border-radius: 4px; display: block;">
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; vertical-align: top;">
          <span class="text-primary">${p.name}</span>
          ${createVariantHtml(p.options)}
        </td>
        <td class="text-primary" style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: center; vertical-align: top;">${p.quantity}</td>
        <td class="text-primary" style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: center; vertical-align: top;">${p.sku || 'N/A'}</td>
        <td class="text-primary" style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right; vertical-align: top;">${formattedPrice}</td>
      </tr>
    `;
  }).join('');
};

const sendOrderNotification = async (orderDetails) => {
  const mailOptions = {
    from: `"Getto India Orders" <${process.env.EMAIL}>`,
    to: orderDetails.vendorEmail,
    subject: `You have a new order! (#${orderDetails.orderId})`,
    html: `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <!--[if !mso]><!-->
      <link href="https://fonts.googleapis.com/css?family=Arial" rel="stylesheet">
      <!--<![endif]-->
      <style>
        /* Default light mode styles */
        body { margin: 0; padding: 0; background-color: #f4f4f7; font-family: Arial, sans-serif; }
        .main-container { background-color: #ffffff; margin: 20px auto; padding: 20px; max-width: 600px; border-radius: 8px; border: 1px solid #e0e0e0; }
        .text-primary { color: #333333; }
        p { line-height: 1.5; color: #333333; margin: 1em 0; }
        
        /* Custom dark mode theme */
        @media (prefers-color-scheme: dark) {
          body { background-color: #121212 !important; }
          .main-container {
            background-color: #1e1e1e !important;
            border: 1px solid #333333 !important;
          }
          .text-primary, p, h3 {
            color: #e0e0e0 !important;
          }
          .variant-text {
            color: #bbbbbb !important;
          }
          .product-row td {
            border-bottom: 1px solid #333333 !important;
          }
          hr {
             border-top: 1px solid #444444 !important;
          }
          .footer-text {
            color: #888888 !important;
          }
        }
      </style>
    </head>
    <body class="body">
      <div class="main-container">
        <h2 style="font-size: 24px; color: white; padding: 20px; margin: -20px -20px 20px -20px; background-image: linear-gradient(to right, #00d0BB, #007EA9); border-radius: 8px 8px 0 0; text-align: center;">
          New Order Received
        </h2>
        
        <p class="text-primary">Hi ${orderDetails.vendorName},</p>
        <p class="text-primary">You have received a new order. Please process it as soon as possible.</p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 25px; border: 1px solid #dddddd;">
          <tbody>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-right: 1px solid #dddddd; width: 100px; background-color: #f9f9f9;" class="text-primary">Order ID</td>
              <td style="padding: 10px;" class="text-primary">${orderDetails.orderId}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-right: 1px solid #dddddd; border-top: 1px solid #dddddd; background-color: #f9f9f9;" class="text-primary">Order Time</td>
              <td style="padding: 10px; border-top: 1px solid #dddddd;" class="text-primary">
                ${new Date(orderDetails.orderTimestamp).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })} (IST)
              </td>
            </tr>
          </tbody>
        </table>

        <div style="background: linear-gradient(to right, #00d0BB, #007EA9); border-radius: 5px 5px 0 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="padding: 12px; color: white; font-weight: bold; text-align: left; width: 84px;">Image</th>
                <th style="padding: 12px; color: white; font-weight: bold; text-align: left;">Product Name</th>
                <th style="padding: 12px; color: white; font-weight: bold; text-align: center;">Quantity</th>
                <th style="padding: 12px; color: white; font-weight: bold; text-align: left;">Product Code</th>
                <th style="padding: 12px; color: white; font-weight: bold; text-align: right;">Price</th>
              </tr>
            </thead>
          </table>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; text-align: left; vertical-align: middle;">
          <tbody>
            ${createProductRows(orderDetails.products)}
          </tbody>
        </table>

        <div style="text-align: center; margin: 40px 0;">
          <a href="${orderDetails.orderLink}" class="button" style="background-color: #4285F4; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">
            View & Process Order
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin-top: 30px;">
        
        <p class="footer-text" style="font-size: 14px; color: #888;">
          ⚠️ This is an automated reminder to process new incoming orders promptly.
        </p>
        <p class="footer-text" style="font-size: 14px; color: #888;">
          If you have any issues, please contact <a href="mailto:contact@gettoindia.com" style="color: #007EA9;">contact@gettoindia.com</a>.
        </p>
      </div>
    </body>
    </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Notification sent successfully to ${orderDetails.vendorEmail} for Order #${orderDetails.orderId}.`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${orderDetails.vendorEmail}. Error: ${error.message}`);
  }
};

module.exports = { sendOrderNotification };