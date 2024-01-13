import settings from "../settings.js";

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
async function handleRequestGML(request, res) {
  try {
    // Parse incoming information; assuming it's in JSON format sent via POST method
    const { commandData, prompt } = await request.json();

    const apiKey = settings.gmlKey;
    const expirationInSeconds = 60 * 60 * 24 * 30;
    const token = generateToken(apiKey, expirationInSeconds);
    const url = 'https://open.bigmodel.cn/api/paas/v3/model-api/chatglm_turbo/sse-invoke';
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ commandData, prompt }),
    });
    
    const { readable, writable } = new TransformStream();
    const reader = response.body.getReader();
    
    reader.read().then(function processResult(result) {
      if (result.done) {
        // All data has been processed
        console.log('Streaming completed');
        return;
      }
      
      const chunk = result.value;
      
      // Process each chunk of data received
      const data = new TextDecoder().decode(chunk);
      console.log(data);
      
      // Continue reading the next chunk
      return reader.read().then(processResult);
    });
    
    // Send streaming response to the client
    res.status(200).json(readable);
  } catch (error) {
    res.status(502).json(error);
  }
}
export {
  handleRequestTest,
  handleRequestGML
};
