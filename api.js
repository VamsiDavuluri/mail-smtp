// api.js

const express = require('express');
const app = express();
const PORT = 3001;

// This is your "database" of products with the corrected, real image URLs.
const productsDatabase = {
  'SHOE-BL-42': {
    name: 'Premium Running Shoes',
    price: 2499.00,
    imageUrl: 'https://raw.githubusercontent.com/VamsiDavuluri/my-product-assets/main/running-shoe-black.jpeg',
    options: [
      { label: 'Size', value: '42 EU' },
      { label: 'Color', value: 'Midnight Black' }
    ]
  },
  'SOCK-WH-LG': {
    name: 'Athletic Socks (3-Pack)',
    price: 499.00,
    imageUrl: 'https://raw.githubusercontent.com/VamsiDavuluri/my-product-assets/main/socks.jpeg',
    options: [
      { label: 'Size', value: 'Large' }
    ]
  },
  'TSHIRT-RD-M': {
    name: 'Classic Red T-Shirt',
    price: 799.00,
    imageUrl: 'https://raw.githubusercontent.com/VamsiDavuluri/my-product-assets/main/redshirt.jpeg',
    options: []
  },
};

// This defines the API endpoint. When a request comes to /products/:sku, this code runs.
app.get('/products/:sku', (req, res) => {
  const { sku } = req.params; 
  console.log(`[API] Received request for SKU: ${sku}`);

  const product = productsDatabase[sku];

  if (product) {
    // If the product is found, send it back as JSON.
    res.json(product);
  } else {
    // If not found, send a 404 error.
    res.status(404).json({ error: 'Product not found' });
  }
});

// This starts the server.
app.listen(PORT, () => {
  console.log(`✅ Product API server is running on http://localhost:${PORT}`);
});