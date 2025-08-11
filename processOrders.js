// processOrders.js

const { sendOrderNotification } = require('./index');
const vendors = require('./vendors.json');
const axios = require('axios');

// The URL of the API server you will have running locally.
const API_BASE_URL = 'http://localhost:3001/products';

// The incoming order data, now very simple.
const incomingOrders = [
  {
    orderId: 'ORD5534',
    customerName: 'Alice Johnson',
    vendorId: 'vendor-001',
    orderTimestamp: new Date(),
    items: [
      { sku: 'SHOE-BL-42', quantity: 1 },
      { sku: 'SOCK-WH-LG', quantity: 2 },
    ]
  },
  {
    orderId: 'ORD5535',
    customerName: 'Bob Williams',
    vendorId: 'vendor-002',
    orderTimestamp: new Date(),
    items: [
      { sku: 'TSHIRT-RD-M', quantity: 1 }
    ]
  },
    {
    orderId: 'ORD5535',
    customerName: 'Bob Williams',
    vendorId: 'vendor-000',
    orderTimestamp: new Date(),
    items: [
      { sku: 'TSHIRT-RD-M', quantity: 1 }
    ]
  }
];

/**
 * Makes a real network request to your running API server.
 * @param {string} sku - The Product Code to look up.
 * @returns {object|null} - Product details or null if an error occurs.
 */
async function fetchProductDetails(sku) {
  try {
    console.log(`🔎 Calling API for SKU: ${sku}`);
    const response = await axios.get(`${API_BASE_URL}/${sku}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error(`❌ API Error: Product with SKU ${sku} was not found (404).`);
    } else {
      console.error(`❌ API Error: Could not fetch details for SKU ${sku}.`, error.message);
    }
    return null;
  }
}

// Main function to orchestrate the process.
const handleAllOrders = async (orders) => {
  console.log(`Processing ${orders.length} incoming orders...`);

  for (const order of orders) {
    const vendor = vendors[order.vendorId];
    if (!vendor) {
      console.error(`❌ WARNING: No vendor found for vendorId "${order.vendorId}".`);
      continue;
    }

    const productDetailPromises = order.items.map(async (item) => {
      const detailsFromApi = await fetchProductDetails(item.sku);
      if (detailsFromApi) {
        return { ...detailsFromApi, sku: item.sku, quantity: item.quantity };
      }
      return null;
    });
    
    let fullProductDetails = await Promise.all(productDetailPromises);
    fullProductDetails = fullProductDetails.filter(p => p !== null);

    if (fullProductDetails.length === 0) {
        console.error(`❌ Skipping order #${order.orderId} because no product details could be fetched.`);
        continue;
    }
    
    const orderLink = `https://getto.aventusinformatics.com/orders/${order.orderId}`;
    
    await sendOrderNotification({
      vendorEmail: vendor.email,
      vendorName: vendor.name,
      orderId: order.orderId,
      orderTimestamp: order.orderTimestamp,
      products: fullProductDetails,
      orderLink: orderLink
    });
  }

  console.log('✅ All order notifications have been processed.');
};

handleAllOrders(incomingOrders);