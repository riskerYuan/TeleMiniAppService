import jwt from 'jsonwebtoken';
import axios from "axios";
import { Readable } from 'stream';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAIKEY
});

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

function reBuildContext(context){
  let newArr = [];
  context.map((item)=>{
    if(item.role === 'use'){
      newArr.push(item);
    }
    if(item.role === 'assistant'){
      item.role === 'system';
      newArr.push(item);
    }
  })
  return newArr;

}

async function handleRequestGML(req, res) {
  try {
    const { prompt } = req.body;
    const apiKey = process.env.GLMKEY;
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

async function handleRequestGPT4(req, res) {
  try {
    
    const { prompt } = req.body;
    const completion = await openai.chat.completions.create({
      messages: prompt,
      model: "gpt-4-turbo",
    });

    res.status(200).json(completion.choices[0]);
  } catch (error) {
    console.error('error---',error.message); // 只记录错误消息
  res.status(506).json({ error: error.message });
  }
}

async function handleRequestGML4ForPaperGpt(req, res) {
  try {
    const { prompt,top_p,temperature } = req.body;

    const apiKey = process.env.GLMKEY;
    const expirationInSeconds = 60 * 60 * 24 * 30;
    const token = generateToken(apiKey, expirationInSeconds);

    const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const data = {
      model: 'glm-4',
      messages: prompt,
      temperature: temperature,
      top_p: top_p,
    }

    const response = await axios.post(url, data, {
      headers: headers
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.message); // 只记录错误消息
  res.status(506).json({ error: error.message });
  }
}

async function handleRequestZw(req, res) {
  try {
    const { keyword,page,year } = req.body;

    const url = 'https://wap.cnki.net/gate/m052/web/api/article/search';
    const headers = {
      'Content-Type': 'application/json'
    };
    let data = 
        {
            "keyword":keyword,
            "searchType":0,
            "dbType":"",
            "pageIndex":page,
            "pageSize":20,
            "articletype":0,
            "sorttype":0,
            "fieldtype":101,
            "yeartype":year,
            "remark":"",
            "yearinterval":"",
            "screen":{"screentype":0,"isscreen":"","subject_sc":"","research_sc":"","depart_sc":"","author_sc":"","subjectcode_sc":"","researchcode_sc":"","departcode_sc":"","authorcode_sc":"","sponsor_sc":"","teacher_sc":"","sponsorcode_sc":"","teachercode_sc":"","starttime_sc":"","endtime_sc":"","timestate_sc":""},"senior":{"theme_kw":"","title_kw":"","full_kw":"","author_kw":"","depart_kw":"","key_kw":"","abstract_kw":"","source_kw":"","teacher_md":"","catalog_md":"","depart_md":"","refer_md":"","name_meet":"","collect_meet":""}
        }

    const response = await axios.post(url, data, {
      headers: headers
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.message); // 只记录错误消息
  res.status(506).json({ error: error.message });
  }
}

export {
  handleRequestTest,
  handleRequestGML,
  handleRequestGPT4,
  handleRequestGML4ForPaperGpt,
  handleRequestZw,
  generateToken
};
