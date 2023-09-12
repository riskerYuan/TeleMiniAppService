import langchain from "langchain";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, SystemMessage, AIMessage } from "langchain/schema";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { loadQARefineChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

const tokenList = [
  "sk-kyTesnlEcYH2Wk4PpsfRCysuTOMzX",
  "sk-2NXtwfKhQ7PkEHdHavbiU9Iq0KZTwK",
];

const headers = {
  "Access-Control-Allow-Origin": "*", // change this to match your deployment
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS,FETCH",
  "Access-Control-Allow-Headers": "Content-Type",
};

function handlePreflight(request) {
  if (
    request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Handle CORS preflight request.
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };
    return new Response(null, { headers });
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, { headers: { Allow: "POST,OPTIONS" } });
  }
}

addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method === "OPTIONS") {
    // Handle CORS preflight request.
    event.respondWith(handlePreflight(event.request));
  } else if (
    event.request.method === "POST" &&
    url.pathname === "/handleRequestAIChatGpt35"
  ) {
    event.respondWith(handleRequestAIChatGpt35(event.request));
  } else if (
    event.request.method === "POST" &&
    url.pathname === "/handleRequestAIChatGpt4"
  ) {
    event.respondWith(handleRequestAIChatGpt4(event.request));
  } else if (
    event.request.method === "POST" &&
    url.pathname === "/handleRequestAIWidgetConvergeGpt35"
  ) {
    event.respondWith(handleRequestAIWidgetConvergeGpt35(event.request));
  } else if (
    event.request.method === "POST" &&
    url.pathname === "/handleRequestAIWidgetConvergeGpt4"
  ) {
    event.respondWith(handleRequestAIWidgetConvergeGpt4(event.request));
  } else if (
    event.request.method === "POST" &&
    url.pathname === "/handleRequestAIWidgetDivergeGpt35"
  ) {
    event.respondWith(handleRequestAIWidgetDivergeGpt35(event.request));
  } else if (
    event.request.method === "POST" &&
    url.pathname === "/handleRequestAIWidgetDivergeGpt4"
  ) {
    event.respondWith(handleRequestAIWidgetDivergeGpt4(event.request));
  } else if (
    event.request.method === "GET" &&
    url.pathname === "/handleRequestTest"
  ) {
    event.respondWith(handleRequestTest(event.request));
  } else {
    // 如果是其他类型请求或者url路径不匹配，返回405 Method Not Allowed
    event.respondWith(
      new Response("Invalid request method or path", { status: 405 })
    );
  }
});

async function handleRequestAIChatGpt35(request) {
  try {
    const requestData = await request.json(); // 解析请求的 JSON 数据
    const promptValue = requestData.prompt;
    const messageValue = requestData.messages;

    console.log("prompt:", promptValue);

    console.log("messages:", messageValue);

    const key = azureApiKey;

    // LLM
    const AzureOpenAIlangchain = new ChatOpenAI({
      azureOpenAIApiKey: key,
      azureOpenAIApiInstanceName: "",//your azureOpenAiApiInstanceName
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
              writer.write(textEncoder.encode(token));
            },
          },
        ],
      })
      .then(() => {
        // 处理完成后，关闭流
        writer.close();
      })
      .catch((e) => {
        // 处理错误
        console.error(e);
        writer.abort(e);
        throw e;
      });

    return new Response(readable, {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(`Error: ${error}`, { status: 500, headers: headers });
  }
}

async function handleRequestAIChatGpt4(request) {
  try {
    const requestData = await request.json(); // 解析请求的 JSON 数据
    const promptValue = requestData.prompt;
    const messageValue = requestData.messages;

    console.log("prompt:", promptValue);

    console.log("messages:", messageValue);

    const key = apiKeyTest;

    // LLM
    const OpenAIlangchain = new ChatOpenAI({
      openAIApiKey: key,
      modelName: "gpt-4",
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
      llm: OpenAIlangchain,
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
              writer.write(textEncoder.encode(token));
            },
          },
        ],
      })
      .then(() => {
        // 处理完成后，关闭流
        writer.close();
      })
      .catch((e) => {
        // 处理错误
        console.error(e);
        writer.abort(e);
        throw e;
      });

    return new Response(readable, {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(`Error: ${error}`, { status: 500, headers: headers });
  }
}

//** widget ai Converge */ 
async function handleRequestAIWidgetConvergeGpt35(request) {
  try {
    // 解析获取传入的信息。假设信息是JSON格式并用POST方法发送
    const { commandData, currentWidgetsTextContent } = await request.json();

    console.warn("commandData", commandData);
    console.warn("currentWidgetsTextContent", currentWidgetsTextContent);

    const key = azureApiKey;

    let totalTokens = null;

    const AzureOpenAIlangchain = new ChatOpenAI({
      azureOpenAIApiKey: key,
      azureOpenAIApiInstanceName: "",//your azureOpenAiApiInstanceName
      azureOpenAIApiDeploymentName: "gpt35-16k",
      azureOpenAIApiVersion: "2023-06-01-preview",
      temperature: commandData.temperature
        ? Number(commandData.temperature)
        : 0.8,
      maxTokens:
        commandData.maximumLength && Number(commandData.maximumLength) > 2048
          ? 2048
          : Number(commandData.maximumLength),
      topP: commandData.topP ? Number(commandData.topP) : 1,
      frequencyPenalty: commandData.frequencyPenalty
        ? Number(commandData.frequencyPenalty)
        : 0,
      presencePenalty: commandData.presencePenalty
        ? Number(commandData.presencePenalty)
        : 0,
      callbacks: [
        {
          handleLLMStart: async (llm, prompts) => {},
          handleLLMEnd: async (output) => {
            totalTokens = output;
            console.log("handleLLMEnd", output);
          },
          handleLLMError: async (err) => {},
        },
      ],
    });

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 4000,
      chunkOverlap: 600,
    });

    const docOutput = await splitter.splitDocuments([
      new Document({ pageContent: currentWidgetsTextContent }),
    ]);

    console.log("docOutput", docOutput);

    const refineEmbeddingsModelAzureOpenAI = {
      azureOpenAIApiKey: key,
      azureOpenAIApiInstanceName: "",//your azureOpenAiApiInstanceName
      azureOpenAIApiDeploymentName: "boardx-text-embedding-ada",
      azureOpenAIApiVersion: "2023-06-01-preview",
      batchSize: 2048,
      maxRetries: 10,
      maxConcurrency: 10,
    };

    const result = await langchainRefineProcessingText(
      refineEmbeddingsModelAzureOpenAI,
      AzureOpenAIlangchain,
      docOutput,
      commandData
    );

    const resultData = {
      content: result.content,
      totalTokens: totalTokens.llmOutput.tokenUsage.totalTokens,
    }

    const json = JSON.stringify(resultData, null, 2);

    console.warn("resultData", resultData);

    //将结果返回给客户端
    return new Response(json, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    return new Response(`Error: ${error}`, { status: 500, headers: headers });
  }
}

async function handleRequestAIWidgetConvergeGpt4(request) {
  try {
    // 解析获取传入的信息。假设信息是JSON格式并用POST方法发送
    const { commandData, currentWidgetsTextContent } = await request.json();

    console.warn("commandData", commandData);
    console.warn("currentWidgetsTextContent", currentWidgetsTextContent);

    const key = apiKeyTest;

    let totalTokens = null;

    const OpenAIlangchain = new ChatOpenAI({
      openAIApiKey: key,
      modelName: "gpt-4",
      temperature: commandData.temperature
        ? Number(commandData.temperature)
        : 0.8,
      maxTokens:
        commandData.maximumLength && Number(commandData.maximumLength) > 2048
          ? 2048
          : Number(commandData.maximumLength),
      topP: commandData.topP ? Number(commandData.topP) : 1,
      frequencyPenalty: commandData.frequencyPenalty
        ? Number(commandData.frequencyPenalty)
        : 0,
      presencePenalty: commandData.presencePenalty
        ? Number(commandData.presencePenalty)
        : 0,
      callbacks: [
        {
          handleLLMStart: async (llm, prompts) => {},
          handleLLMEnd: async (output) => {
            totalTokens = output;
            console.log("handleLLMEnd", output);
          },
          handleLLMError: async (err) => {},
        },
      ],
    });

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 4000,
      chunkOverlap: 600,
    });

    const docOutput = await splitter.splitDocuments([
      new Document({ pageContent: currentWidgetsTextContent }),
    ]);

    console.warn("docOutput", docOutput);

    const refineEmbeddingsModelOpenAI = {
      openAIApiKey: key,
      batchSize: 2048,
      modelName: "text-embedding-ada-002",
      maxRetries: 10,
      maxConcurrency: 10,
    };

    const result = await langchainRefineProcessingText(
      refineEmbeddingsModelOpenAI,
      OpenAIlangchain,
      docOutput,
      commandData
    );

    const resultData = {
      content: result.content,
      totalTokens: totalTokens.llmOutput.tokenUsage.totalTokens,
    };

    const json = JSON.stringify(resultData, null, 2);

    console.warn("resultData", resultData);

    //将结果返回给客户端
    return new Response(json, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    return new Response(`Error: ${error}`, { status: 500, headers: headers });
  }
}

//** widget ai diverge */ 
async function handleRequestAIWidgetDivergeGpt35(request) {
  try {
    // 解析获取传入的信息。假设信息是JSON格式并用POST方法发送
    const { commandData, prompt } = await request.json();

    const key = azureApiKey;

    let totalTokens = null;

    const AzureOpenAIlangchain = new ChatOpenAI({
      azureOpenAIApiKey: key,
      azureOpenAIApiInstanceName: "",//your azureOpenAiApiInstanceName
      azureOpenAIApiDeploymentName: "gpt35-16k",
      azureOpenAIApiVersion: "2023-06-01-preview",
      temperature: commandData.temperature
        ? Number(commandData.temperature)
        : 0.8,
      maxTokens:
        commandData.maximumLength && Number(commandData.maximumLength) > 2048
          ? 2048
          : Number(commandData.maximumLength),
      topP: commandData.topP ? Number(commandData.topP) : 1,
      frequencyPenalty: commandData.frequencyPenalty
        ? Number(commandData.frequencyPenalty)
        : 0,
      presencePenalty: commandData.presencePenalty
        ? Number(commandData.presencePenalty)
        : 0,
      callbacks: [
        {
          handleLLMStart: async (llm, prompts) => {

          },
          handleLLMEnd: async (output) => {
            totalTokens = output;
            console.log("handleLLMEnd", output);
          },
          handleLLMError: async (err) => {

          },
        },
      ],
    });

    const result = await AzureOpenAIlangchain.call([new HumanMessage(prompt)]);
  
    const resultData = {
      content: result.content,
      totalTokens: totalTokens.llmOutput.tokenUsage.totalTokens,
    };

    const json = JSON.stringify(resultData, null, 2);

    //将结果返回给客户端
    return new Response(json, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    return new Response(`Error: ${error}`, { status: 500, headers: headers });
  }
}

async function handleRequestAIWidgetDivergeGpt4(request) {
try {
  // 解析获取传入的信息。假设信息是JSON格式并用POST方法发送
  const { commandData, prompt } = await request.json();

  const key = apiKeyTest;

  let totalTokens = null;

  const OpenAIlangchain = new ChatOpenAI({
    openAIApiKey: key,
    modelName: "gpt-4",
    temperature: commandData.temperature
      ? Number(commandData.temperature)
      : 0.8,
    maxTokens:
      commandData.maximumLength && Number(commandData.maximumLength) > 2048
        ? 2048
        : Number(commandData.maximumLength),
    topP: commandData.topP ? Number(commandData.topP) : 1,
    frequencyPenalty: commandData.frequencyPenalty
      ? Number(commandData.frequencyPenalty)
      : 0,
    presencePenalty: commandData.presencePenalty
      ? Number(commandData.presencePenalty)
      : 0,
    callbacks: [
      {
        handleLLMStart: async (llm, prompts) => {},
        handleLLMEnd: async (output) => {
          totalTokens = output;
          console.log("handleLLMEnd", output);
        },
        handleLLMError: async (err) => {},
      },
    ],
  });

  const result = await OpenAIlangchain.call([new HumanMessage(prompt)]);

  const resultData = {
    content: result.content,
    totalTokens: totalTokens.llmOutput.tokenUsage.totalTokens,
  };

  const json = JSON.stringify(resultData, null, 2);

  //将结果返回给客户端
  return new Response(json, {
    status: 200,
    headers: headers,
  });
} catch (error) {
  return new Response(`Error: ${error}`, { status: 500, headers: headers });
}
}

//** 创建 Prompt Template */ 
const getDefinePromptTemplate = (commandData) => {
  if (
    commandData.bindingTemplates &&
    commandData.templateId &&
    commandData.templateId.length > 0 &&
    commandData.customizedContentOutputFormat &&
    commandData.customizedContentOutputFormat.length > 0
  ) {
    let parserObj = {};

    for (var i = 0; i < commandData.customizedContentOutputFormat.length; i++) {
      let item = commandData.customizedContentOutputFormat[i];
      // parserObj[item.title] = z.array(z.string()).describe(item.description);
      parserObj[item.title] = z.array(z.string()).describe("");
    }

    const parser = StructuredOutputParser.fromZodSchema(z.object(parserObj));

    const formatInstructions = parser.getFormatInstructions();

    const questionPromptTemplate = new PromptTemplate({
      template: "\n{format_instructions}\n{question}",
      inputVariables: ["question"],
      partialVariables: { format_instructions: formatInstructions },
    });

    return { parser, questionPromptTemplate };
  } else {
    return { parser: null, questionPromptTemplate: null };
  }
};

//** 处理文本 */ 
const langchainRefineProcessingText = async (
  refineEmbeddingsModel,
  llms,
  docsContent,
  commandData
) => {
  const { parser, questionPromptTemplate } =
    getDefinePromptTemplate(commandData);

  const embeddings = new OpenAIEmbeddings(refineEmbeddingsModel);

  let chain = loadQARefineChain(llms);

  if (questionPromptTemplate) {
    chain = loadQARefineChain(llms, {
      questionPrompt: questionPromptTemplate,
    });
  }

  const store = await MemoryVectorStore.fromDocuments(docsContent, embeddings);

  const question = commandData.command;

  // Select the relevant documents
  const relevantDocs = await store.similaritySearch(question);

  // Call the chain
  const result = await chain.call({
    input_documents: relevantDocs,
    question,
  });

  if (parser) {
    return {
      content: await parser.parse(result.output_text),
    };
  } else {
    return {
      content: result.output_text,
    };
  }
};

async function handleRequestTest(request) {
  try {
    const response = "ok this is a test";
    //将结果返回给客户端
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    return new Response(`Error: ${error}`, { status: 500 });
  }
}
