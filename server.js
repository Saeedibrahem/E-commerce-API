require('dotenv').config();
require('express-async-errors'); // auto-catch async errors
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/carts');
const orderRoutes = require('./routes/orders');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/carts', cartRoutes);
app.use('/orders', orderRoutes);

// health
app.get('/health', (req, res) => res.json({ ok: true }));

// docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
}).catch(err => {
    console.error('Failed to connect DB', err);
    process.exit(1);
});
