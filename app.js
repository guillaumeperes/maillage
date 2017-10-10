const express = require('express');
const app = express();
const LISTEN_PORT = 55555;

app.get('/', function (req, res) {
    res.send('Hello World!')
});

app.listen(LISTEN_PORT, function () {
    console.log('Example app listening on port 3000!')
});
