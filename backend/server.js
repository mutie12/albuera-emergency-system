const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Original routes
app.get('/health', (req, res) => {
    res.status(200).send({ status: 'OK' });
});

// Test endpoint
app.get('/test', (req, res) => {
    res.status(200).send({ message: 'This is a test endpoint.' });
});

// Other original routes and middleware
// e.g. app.use('/api', apiRoutes);
// e.g. app.use((req, res, next) => { /* middleware logic */ });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});