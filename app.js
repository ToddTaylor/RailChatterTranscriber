import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
app.use(express.static('src'));
app.use(express.static('src/views'));
app.use(express.static('src/public'));
app.use(express.json());

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/src/views/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export default app;