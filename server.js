const express = require('express');
const cors = require('cors');

import { handleRequestAIChatGpt35, handleRequestTest } from './utils';


const app = express();

app.use(express.json());

app.use(cors()); // Enable All CORS Requests

//app.options('*', cors()) // Enable CORS preflight for all routes 测试跨域的时候开启这个地方

function handlePreflight(req, res, next) {
    next();
}

app.use(handlePreflight);

//Ending points
app.post('/handleRequestAIChatGpt35', handleRequestAIChatGpt35)

app.get('/handleRequestTest', handleRequestTest)

//Functions write here


app.listen(8080, function () {
    console.log('Server is running on port 8080');
})
