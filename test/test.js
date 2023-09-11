const request = require('supertest');
const express = require('express');
const cors = require('cors');
import { handleRequestTest } from '../utils';


beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(cors());

    app.get('/handleRequestTest', jest.fn(handleRequestTest));
    // app.post('/handleRequestAIChatGpt35', jest.fn(handleRequestAIChatGpt35));
});

test('handleRequestTest', async () => {
    const response = await request(app)
        .get('/handleRequestTest');

    expect(response.statusCode).toBe(200);
    const text = JSON.parse(response.text);
    expect(text).toBe('ok this is a test');
});

// test('handleRequestAIChatGpt35HasContext', (done) => {
//     const req = request(app).post('/handleRequestAIChatGpt35').send({messages: [],
//     prompt: "hi" });
//     let data = '';
//     req.on('info', function(res) {
//         res.on('data', function(chunk){
//             data += chunk;
//         });
//         res.on('end', function(){
//             expect(data).not.toBeNull();
//             // 添加你的其他断言
//             done();
//         });
//     });

//     req.on('error', function(err) {
//         console.log(err);
//         done(err);
//     });

//     req.write('hi');
//     req.end();
// }, 300000);

// test('handleRequestAIChatGpt35HasContext', async (done) => {
//     const req = request(app).post('/handleRequestAIChatGpt35').send({messages: [],
//     prompt: "hi" });

//     let data = '';
//     req.on('data', (chunk) => {
//         data += chunk;
//     })

//     req.on('end', () => {
//         expect(data).not.toBeNull();
//         // 添加你的其他断言
//         done();
//     }, 600000);
// });