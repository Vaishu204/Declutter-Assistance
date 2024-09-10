const express = require('express');
const fs = require('fs-extra');
const path = require('path');

const app = express();
app.use(express.json());

app.post('/analyze-directory', async (req, res) => {
  const { directoryPath } = req.body;
  try {
    const files = await fs.readdir(directoryPath);
    const fileDetails = await Promise.all(files.map(async (file) => {
      const filePath = path.join(directoryPath, file);
      const stats = await fs.stat(filePath);
      return {
        path: filePath,
        size: stats.size,
        lastModified: stats.mtime,
      };
    }));
    res.json({
      fileDetails,
      totalSize: fileDetails.reduce((sum, file) => sum + file.size, 0),
    });
  } catch (error) {
    console.error('Error analyzing directory:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/delete-file', async (req, res) => {
  const { filePath } = req.body;
  try {
    await fs.remove(filePath);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

