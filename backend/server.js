const express = require('express');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

// Set up Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define a route for file upload
app.post('/upload', upload.single('file'), (req, res) => {
  // Handle the uploaded file here
  const fileBuffer = req.file.buffer;
  // Implement file storage and shredding logic here
  // Respond to the client with the result
  res.json({ message: 'File uploaded successfully' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
