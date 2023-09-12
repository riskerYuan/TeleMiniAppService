const request = require('supertest');
const express = require('express');
const cors = require('cors');

import { handleRequestTest, handleRequestAIChatGpt35,handleRequestAIChatGpt4, handleRequestAIWidgetConvergeGpt35, handleRequestAIWidgetConvergeGpt4, handleRequestAIWidgetDivergeGpt35, handleRequestAIWidgetDivergeGpt4,getDefinePromptTemplate,langchainRefineProcessingText  } from '../utils';


beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(cors());

    app.get('/handleRequestTest', jest.fn(handleRequestTest));
    app.post('/handleRequestAIChatGpt35', jest.fn(handleRequestAIChatGpt35));
    app.post('/handleRequestAIChatGpt4', jest.fn(handleRequestAIChatGpt4));
    app.post('/handleRequestAIWidgetConvergeGpt35', jest.fn(handleRequestAIWidgetConvergeGpt35));
    app.post('/handleRequestAIWidgetConvergeGpt4', jest.fn(handleRequestAIWidgetConvergeGpt4));
    app.post('/handleRequestAIWidgetDivergeGpt35', jest.fn(handleRequestAIWidgetDivergeGpt35));
    app.post('/handleRequestAIWidgetDivergeGpt4', jest.fn(handleRequestAIWidgetDivergeGpt4));

});

test('handleRequestTest', async () => {
    const response = await request(app)
        .get('/handleRequestTest');

    expect(response.statusCode).toBe(200);
    const text = JSON.parse(response.text);
    expect(text).toBe('ok this is a test');
});

test('handleRequestAIChatGpt35 returns a chunk has no context', async () => {
    jest.setTimeout(30000); // Extend timeout if necessary
    const body = {
        prompt: 'hi',
        messages: [],
    };
    const res = await request(app)
        .post('/handleRequestAIChatGpt35')
        .send(body)
        .expect(200); // Expects HTTP status code 200

},15000);

test('handleRequestAIChatGpt35 returns a chunk has context', async () => {
    jest.setTimeout(30000); // Extend timeout if necessary
    const body = {
        prompt: 'hi',
        messages: [{ role: 'user', content: '你好' }],
    };
    const res = await request(app)
        .post('/handleRequestAIChatGpt35')
        .send(body)
        .expect(200); // Expects HTTP status code 200

},15000);

test('handleRequestAIChatGpt4 returns a chunk has no context', async () => {
    jest.setTimeout(30000); // Extend timeout if necessary
    const body = {
        prompt: 'hi',
        messages: [],
    };
    const res = await request(app)
        .post('/handleRequestAIChatGpt4')
        .send(body)
        .expect(200); // Expects HTTP status code 200

},15000);

test('handleRequestAIChatGpt4 returns a chunk has context', async () => {
    jest.setTimeout(30000); // Extend timeout if necessary
    const body = {
        prompt: 'hi',
        messages: [{ role: 'user', content: '你好' }],
    };
    const res = await request(app)
        .post('/handleRequestAIChatGpt4')
        .send(body)
        .expect(200); // Expects HTTP status code 200

},15000);

test('handleRequestAIWidgetConvergeGpt35 endingPoint', async () => {
    jest.setTimeout(30000); // Extend timeout if necessary
    const body = {
        commandData: '',
        currentWidgetsTextContent: '',
    };
    const res = await request(app)
        .post('/handleRequestAIWidgetConvergeGpt35')
        .send(body)
        .expect(200); // Expects HTTP status code 200

},15000);

test('handleRequestAIWidgetConvergeGpt4 endingPoint', async () => {
    jest.setTimeout(30000); // Extend timeout if necessary
    const body = {
        commandData: '',
        currentWidgetsTextContent: '',
    };
    const res = await request(app)
        .post('/handleRequestAIWidgetConvergeGpt4')
        .send(body)
        .expect(200); // Expects HTTP status code 200

},15000);

test('handleRequestAIWidgetDivergeGpt35 endingPoint', async () => {
    jest.setTimeout(30000); // Extend timeout if necessary
    const body = {
        commandData: '',
        prompt: '',
    };
    const res = await request(app)
        .post('/handleRequestAIWidgetDivergeGpt35')
        .send(body)
        .expect(200); // Expects HTTP status code 200

},15000);

test('handleRequestAIWidgetDivergeGpt4 endingPoint', async () => {
    jest.setTimeout(30000); // Extend timeout if necessary
    const body = {
        commandData: '',
        prompt: '',
    };
    const res = await request(app)
        .post('/handleRequestAIWidgetDivergeGpt4')
        .send(body)
        .expect(200); // Expects HTTP status code 200

},15000);

