import express from "express";

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Minimal server working' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Minimal server running on port ${port}`);
});