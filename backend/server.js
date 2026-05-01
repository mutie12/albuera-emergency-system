// Test API endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Test endpoint is working.' });
});
