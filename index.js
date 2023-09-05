import langchain from "langchain";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, SystemMessage, AIMessage } from "langchain/schema";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { loadQAStuffChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { loadQARefineChain } from "langchain/chains";
import { loadQAMapReduceChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
// import { PDFLoader } from "langchain/document_loaders/fs/pdf";

const tokenList = [
  "sk-kyTesnlEcYH2Wk4PpsfRCysuTOMzX",
  "sk-2NXtwfKhQ7PkEHdHavbiU9Iq0KZTwK",
];


const headers = {
  "Access-Control-Allow-Origin": "*", // change this to match your deployment
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

function handlePreflight(request) {
  if (request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null) {
    // Handle CORS preflight request.
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Allow-Headers": "*",
    }
    return new Response(null, { headers });
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, { headers: { "Allow": "POST,OPTIONS" } });
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
    // 解析获取传入的信息。假设信息是JSON格式并用POST方法发送
    const { prompt, messages, key } = await request.json();

    let pastMessages = [];
    for (const item of messages) {
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

    const AzureOpenAIlangchain = new ChatOpenAI({
      azureOpenAIApiKey: key,
      azureOpenAIApiInstanceName: "boardxai",
      azureOpenAIApiDeploymentName: "gpt35-16k",
      azureOpenAIApiVersion: "2023-06-01-preview",
    });

    const chain = new ConversationChain({
      llm: AzureOpenAIlangchain,
      memory: memory,
    });

    // 调用链并获取响应
    const response = await chain.call({
      input: prompt,
    });

    //将结果返回给客户端

    return new Response(JSON.stringify(response), { status: 200, headers: headers });
  } catch (error) {
    return new Response(`Error: ${error}`, { status: 500 });
  }
}

async function handleRequestAIChatGpt4(request) {
  try {
    // 解析获取传入的信息。假设信息是JSON格式并用POST方法发送
    const { prompt, messages, key } = await request.json();

    let pastMessages = [];
    for (const item of messages) {
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

    // langchain
    const OpenAIlangchain = new ChatOpenAI({
      openAIApiKey: key,
      modelName: "gpt-4",
    });

    const chain = new ConversationChain({
      llm: OpenAIlangchain,
      memory: memory,
    });

    // 调用链并获取响应
    const response = await chain.call({
      input: prompt,
    });

    //将结果返回给客户端
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    return new Response(`Error: ${error}`, { status: 500 });
  }
}

async function handleRequestTest(request) {
  try {
    const response = "ok this is a test";
    //将结果返回给客户端
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    return new Response(`Error: ${error}`, { status: 500 });
  }
}
