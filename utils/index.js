import settings from "../settings.js";
import jwt from 'jsonwebtoken';
import axios from "axios";
import { Readable } from 'stream';

async function handleRequestTest(req, res) {
  try {
    const response = "ok this is a test";

    //将结果返回给客户端
    res.status(200).json(response);
  } catch (error) {
    const responseError = "this basic test is not working";
    res.status(500).json(responseError);
  }
}

function generateToken(apiKey, expSeconds) {
  const secret = apiKey.split('.')[1];
  const id = apiKey.split('.')[0];
  const payload = {
    api_key: id,
    exp: Math.floor(Date.now() / 1000) + expSeconds,
    timestamp: Math.floor(Date.now() / 1000),
  };
  const token = jwt.sign(payload, secret, {
    algorithm: 'HS256',
    header: { alg: 'HS256', sign_type: 'SIGN' },
  });

  return token;
}
async function handleRequestGML(req, res) {
  try {
    const { prompt } = req.body;
    const apiKey = settings.gmlKey;
    const expirationInSeconds = 60 * 60 * 24 * 30;
    const token = generateToken(apiKey, expirationInSeconds);
  
    const url = 'https://open.bigmodel.cn/api/paas/v3/model-api/chatglm_pro/sse-invoke';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  
    const response = await axios.post(url, {
      model: 'chatglm_pro',
      prompt,
      temperature: 0.10,
      top_p: 0.70,
      stream: true
    }, {
      headers: headers,
      responseType: 'stream'
    });
  
    let dataBuffer = '';
  
    // 创建一个可读流来处理数据
    const readable = new Readable({
      read(size) {
        // 不需要实现读取逻辑，因为数据将通过下面的监听器处理
      }
    });
  
    // 监听数据事件并处理 SSE 数据
    response.data.on('data', (chunk) => {
      const chunkStr = chunk.toString();
      dataBuffer += chunkStr;
  
      // 分割数据，找到所有的事件并提取 data 部分发送
      const events = dataBuffer.split('\n');
      events.forEach((event) => {
        if (event.startsWith('data:')) {
          // 发送 data 部分给前端，移除 'data:' 和可能的空格
          const data = event.slice(5).trim();
          readable.push(data);
        }
      });
  
      // 清理已经处理的数据
      if (events.length > 0) {
        dataBuffer = events[events.length - 1]; // 保留最后一个可能不完整的事件
      }
    });
  
    // 监听结束事件
    response.data.on('end', () => {
      readable.push(null); // 标记流的结束
    });
  
    // 将处理后的流发送给前端
    readable.pipe(res);
  
  } catch (error) {
    res.status(506).json(`Error: ${error}`);
  }
 }
export {
  handleRequestTest,
  handleRequestGML,
  generateToken
};
