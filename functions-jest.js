const {apiKey, apiKeyTest, azureApiKey} = require('./settings-jest.js');

async function handleRequestAIChatGpt35(request, res,next) {
    try {
        const requestData = await request.body;
        //const requestData = await request.json(); // 解析请求的 JSON 数据
        const promptValue = requestData.prompt;
        const messageValue = requestData.messages;

        const key = azureApiKey;
        // LLM
        const AzureOpenAIlangchain = new ChatOpenAI({
            azureOpenAIApiKey: key,
            azureOpenAIApiInstanceName: "boardxai",
            azureOpenAIApiDeploymentName: "gpt35-16k",
            azureOpenAIApiVersion: "2023-06-01-preview",
            streaming: true,
        });

        const { readable, writable } = new TransformStream();

        let pastMessages = [];

        for (const item of messageValue) {
            if (item.role === "system") {
                pastMessages.push(new SystemMessage(item.content));
            }
            if (item.role === "user") {
                pastMessages.push(new HumanMessage(item.content));
            }
            if (item.role === "assistant") {
                pastMessages.push(new AIMessage(item.content));
            }
        }

        // 初始化内存和链
        const memory = new BufferMemory({
            chatHistory: new ChatMessageHistory(pastMessages),
        });

        const chain = new ConversationChain({
            llm: AzureOpenAIlangchain,
            memory: memory,
        });

        const writer = writable.getWriter();

        const textEncoder = new TextEncoder();
        // 调用链并获取响应
        chain
            .call({
                input: promptValue,
                callbacks: [
                    {
                        handleLLMNewToken(token) {
                            console.log({ token });
                            //writer.write(textEncoder.encode(token)); //worker 环境的write方法
                            res.write(token);
                        },
                    },
                ],
            })
            .then(() => {
                // 处理完成后，关闭流
                //writer.close(); //worker 环境的close方法
                res.end();
            })
            .catch((e) => {
                // 处理错误
                console.error(e);
                writer.abort(e);
                throw e;
            });

            //实时返回给客户端

    } catch (error) {
        res.status(500).json(`Error: ${error}`);
    }
}

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

module.exports = {
    handleRequestAIChatGpt35,
    handleRequestTest
  };