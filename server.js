
const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');

const app = express();
const PORT = 3000;
const DATA_FILE_PATH = path.join(__dirname, 'data.json');
const DATA_INIT_CONTENT = `{
  "queue_count": 0,
  "pin_count": 0,
  "note_count": 0,
  "notes": [],
  "schedule": []
}
`;

// Create json file if does not exist
async function initDataFile() {
    try {
    const fileHandle = await fs.open(DATA_FILE_PATH, 'wx'); // fails if the file already exists
    await fileHandle.writeFile(DATA_INIT_CONTENT);
    console.log(`[201] <initDataFile>: Created new file at ${DATA_FILE_PATH}`);
    await fileHandle.close();
  } catch (error) {
    if (error.code === 'EEXIST') {
      console.log(`[200] <initDataFile>: File already exists at ${DATA_FILE_PATH}.`);
    } else {
      throw error;
    }
  }
}

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Read JSON
app.get('/api/data', async (req, res) => {
  try {
    const contents = await fs.readFile(DATA_FILE_PATH, 'utf8');
    res.type('json').send(contents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not read data.json.' });
  }
});

// Write JSON
app.put('/api/data', async (req, res) => {
  try {
    const data = req.body;

    if (data === null || typeof data !== 'object') {
      return res.status(400).json({
        error: 'JSON must be an object or array.'
      });
    }

    const contents = JSON.stringify(data, null, 2) + '\n';
    const tempFile = `${DATA_FILE_PATH}.tmp`;

    // Write temporary file, then replace the original.
    await fs.writeFile(tempFile, contents, 'utf8');
    await fs.rename(tempFile, DATA_FILE_PATH);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not save data.json.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

initDataFile();
