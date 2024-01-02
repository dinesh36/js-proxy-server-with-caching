const express = require("express");
const app = express();
const API_PORT = 5001;

app.use((req, res)=>{
    res.send('API server...');
});
app.listen(API_PORT, 'localhost', () => {
    console.log(`Starting Proxy at ${this.host}:${this.port}`);
});
