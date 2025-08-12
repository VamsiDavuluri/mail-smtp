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
  const orderDate = new Date(orderDetails.orderTimestamp);
  const formattedDate = `${orderDate.getDate().toString().padStart(2, '0')}/${
    (orderDate.getMonth() + 1).toString().padStart(2, '0')
  }/${orderDate.getFullYear()}, ${
    orderDate.getHours().toString().padStart(2, '0')
  }:${orderDate.getMinutes().toString().padStart(2, '0')}:${
    orderDate.getSeconds().toString().padStart(2, '0')
  } (IST)`;

  const mailOptions = {
    from: `"Getto India Orders" <${process.env.EMAIL}>`,
    to: orderDetails.vendorEmail,
    subject: `📦 You have a new order! (#${orderDetails.orderId})`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,sans-serif;">
      <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f4f4f7;">
        <tr>
          <td align="center" style="padding:20px;">
            <table role="presentation" style="width:100%;max-width:600px;border-collapse:collapse;background-color:#ffffff;border-radius:12px;overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(to right,#00d0BB,#007EA9);padding:20px;text-align:center;">
                  <h2 style="font-size:22px;color:#ffffff;margin:0;">New Order Received</h2>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding:20px;color:#333;font-size:15px;">
                  <p style="margin:0 0 10px 0;">Hi ${orderDetails.vendorName},</p>
                  <p style="margin:0;">You have received a new order. Please process it as soon as possible.</p>
                </td>
              </tr>
              <!-- Order Info -->
              <tr>
                <td style="padding:0 20px 20px 20px;">
                  <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
                    <tr>
                      <td style="padding:10px;font-weight:bold;background-color:#fafafa; width:200px;">Order ID</td>
                      <td style="padding:10px; background-color:#fafafa;">${orderDetails.orderId}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px;font-weight:bold; background-color:#fafafa;">Order Time</td>
                      <td style="padding:10px; background-color:#fafafa;">${formattedDate}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Products -->
              <tr>
                <td style="padding:0 20px 20px 20px;">
                    <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
                    <table role="presentation" style="width:100%;min-width:500px;border-collapse:collapse; text-align: center;">
                <thead>
                   <tr style="background-color: #25bcb4;border-radius: 0px 9.99px 9.99px 9.99px;background: linear-gradient(to right, #00d0BB, #007EA9)"> 
                      <th style="border: 1px solid #ccc; padding: 8px;color: white"><strong>Image</strong></th>
                      <th style="border: 1px solid #ccc; padding: 8px;color: white">Product</th>
                      <th style="border: 1px solid #ccc; padding: 8px;color: white">Quantity</th>
                      <th style="border: 1px solid #ccc; padding: 8px;color: white">Size</th>
                      <th style="border: 1px solid #ccc; padding: 8px;color: white">Price</th>
                   </tr>
                </thead> 
                    <tbody>
                      ${orderDetails.products.map(p => `
                        <tr>
                          <td style="padding:10px;border-bottom:1px solid #f0f0f0; border-radius:8px;">
                            <img src="${p.imageUrl}" alt="${p.name}" style="width:60px;border-radius:6px;display:block; margin:0 auto;">
                          </td>
                          <td style="padding:10px;border-bottom:1px solid #f0f0f0;">
                            <div style="font-weight:500;">${p.name}</div>
                            ${p.options && p.options.length > 0 
                              ? p.options.map(opt => `<div style="font-size:12px;color:#555;"><strong>${opt.label}:</strong> ${opt.value}</div>`).join('')
                              : ''}
                          </td>
                          <td style="padding:10px;text-align:center; font-weight:bold; border-bottom:1px solid  #f0f0f0;">${p.quantity}</td>
                          <td style="padding:10px;border-bottom:1px solid #f0f0f0;">${p.sku || 'N/A'}</td>
                          <td style="padding:10px;text-align:right;border-bottom:1px solid #f0f0f0;">${(p.price || 0).toLocaleString('en-IN',{style:'currency',currency:'INR'})}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </td>
              </tr>
              <!-- Button -->
              <tr>
                <td style="text-align:center;padding:20px;">
                  <a href="${orderDetails.orderLink}" style="background-color:#4285F4;color:#ffffff;padding:14px 24px;text-decoration:none;border-radius:6px;font-size:15px;display:inline-block;">View & Process Order</a>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:15px;font-size:13px;color:#777;text-align:center;background-color:#fafafa;">
                  ⚠️ This is an automated reminder to process new incoming orders promptly.<br>
                  If you have any issues, please contact <a href="mailto:contact@gettoindia.com" style="color:#007EA9;">contact@gettoindia.com</a>.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Notification sent to ${orderDetails.vendorEmail} for Order #${orderDetails.orderId}.`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${orderDetails.vendorEmail}. Error: ${error.message}`);
  }
};

module.exports = { sendOrderNotification };