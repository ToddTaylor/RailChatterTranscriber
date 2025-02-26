import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const router = express.Router();

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/src/views/index.html');
});

app.use(express.static('src'));
app.use(express.static('src/views'));
app.use(express.static('src/public'));

app.use('/', router);
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');