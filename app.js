const express = require('express');
const app = express();
const path = require('path');
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