const http = require('http');

const products = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    price: 2500.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    description: "High-quality wireless headphones with noise cancellation"
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 899.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
    description: "Feature-rich smartwatch with health monitoring"
  },
  {
    id: 3,
    name: "Laptop Backpack",
    price: 2000.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
    description: "Durable laptop backpack with multiple compartments"
  },
  {
    id: 4,
    name: "Mechanical Keyboard",
    price: 1200.99,
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=300&fit=crop",
    description: "RGB mechanical keyboard with customizable keys"
  },
  {
    id: 5,
    name: "Gaming Mouse",
    price: 500.99,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop",
    description: "Precision gaming mouse with adjustable DPI"
  }
];

let cart = [];

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Routes
  if (pathname === '/api/products' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(products));
  }
  else if (pathname === '/api/cart' && req.method === 'GET') {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      items: cart,
      total: parseFloat(total.toFixed(2))
    }));
  }
  else if (pathname === '/api/cart' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        try {
            const { productId, quantity } = JSON.parse(body);
            const product = products.find(p => p.id === parseInt(productId));
            
            if (!product) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Product not found' }));
                return;
            }

            const existingItem = cart.find(item => item.id === parseInt(productId));
            
            if (existingItem) {
                existingItem.quantity += parseInt(quantity) || 1;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: parseInt(quantity) || 1
                });
            }

            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Send success response
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                items: cart,
                total: parseFloat(total.toFixed(2))
            }));
        } catch (error) {
            console.error('Cart POST error:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid request data' }));
        }
    });
  }
  else if (pathname.startsWith('/api/cart/') && req.method === 'DELETE') {
    const id = parseInt(pathname.split('/').pop());
    cart = cart.filter(item => item.id !== id);
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      items: cart,
      total: parseFloat(total.toFixed(2))
    }));
  }
  else if (pathname === '/api/checkout' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { cartItems, name, email } = JSON.parse(body);
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const receipt = {
          orderId: Math.random().toString(36).substr(2, 9).toUpperCase(),
          customer: { name, email },
          items: cartItems,
          total: parseFloat(total.toFixed(2)),
          timestamp: new Date().toISOString(),
          status: 'confirmed'
        };
        
        // Clear cart after successful checkout
        cart = [];
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(receipt));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }
  else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Mock E-Commerce API is running!' }));
  }
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Products API: http://localhost:${PORT}/api/products`);
  console.log(`Cart API: http://localhost:${PORT}/api/cart`);
});