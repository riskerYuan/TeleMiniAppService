import settings from "../settings.js";
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

const azureApiKey = settings.azureApiKey;

const apiKey = settings.apiKey;

const apiKeyTest = settings.apiKeyTest;

const azureApiKeyGpt4 = settings.azureApiKeyGpt4;

async function handleRequestAIChatGpt35(request, res, next) {
  try {
    const requestData = await request.body;
    //const requestData = await request.body; // 解析请求的 JSON 数据
    const promptValue = requestData.prompt;
    const messageValue = requestData.messages;
    const promptPersonaData = requestData.promptPersonaData;

    const key = azureApiKey;
    // LLM
    const AzureOpenAIlangchain = new ChatOpenAI({
      azureOpenAIApiKey: key,
      azureOpenAIApiInstanceName: "boardxai",
      azureOpenAIApiDeploymentName: "gpt35-16k",
      azureOpenAIApiVersion: "2023-06-01-preview",
      streaming: true,
      temperature:
        promptPersonaData && promptPersonaData.temperature
          ? Number(promptPersonaData.temperature)
          : 0.8,
      maxTokens:
        promptPersonaData && promptPersonaData.maximumLength
          ? Number(promptPersonaData.maximumLength)
          : 2048,
      topP:
        promptPersonaData && promptPersonaData.topP
          ? Number(promptPersonaData.topP)
          : 1,
      frequencyPenalty:
        promptPersonaData && promptPersonaData.frequencyPenalty
          ? Number(promptPersonaData.frequencyPenalty)
          : 0,
      presencePenalty:
        promptPersonaData && promptPersonaData.presencePenalty
          ? Number(promptPersonaData.presencePenalty)
          : 0,
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

async function handleRequestAIChatGpt4(request, res) {
  try {
    const requestData = await request.body; // 解析请求的 JSON 数据
    const promptValue = requestData.prompt;
    const messageValue = requestData.messages;
    const promptPersonaData = requestData.promptPersonaData;

   const key = azureApiKeyGpt4;

   // LLM
   // const OpenAIlangchain = new ChatOpenAI({
   //   openAIApiKey: key,
   //   modelName: "gpt-4",
   //   streaming: true,
   // });

   const AzureOpenAIlangchain = new ChatOpenAI({
     azureOpenAIApiKey: key,
     azureOpenAIApiInstanceName: "boardxgpt4",
     azureOpenAIApiDeploymentName: "gpt4",
     azureOpenAIApiVersion: "2023-06-01-preview",
     streaming: true,
     temperature:
       promptPersonaData && promptPersonaData.temperature
         ? Number(promptPersonaData.temperature)
         : 0.8,
     maxTokens:
       promptPersonaData && promptPersonaData.maximumLength
         ? Number(promptPersonaData.maximumLength)
         : 2048,
     topP:
       promptPersonaData && promptPersonaData.topP
         ? Number(promptPersonaData.topP)
         : 1,
     frequencyPenalty:
       promptPersonaData && promptPersonaData.frequencyPenalty
         ? Number(promptPersonaData.frequencyPenalty)
         : 0,
     presencePenalty:
       promptPersonaData && promptPersonaData.presencePenalty
         ? Number(promptPersonaData.presencePenalty)
         : 0,
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
              //   res.write(textEncoder.encode(token));
              res.write(token);
            },
          },
        ],
      })
      .then(() => {
        // 处理完成后，关闭流
        res.end();
      })
      .catch((e) => {
        // 处理错误
        writer.abort(e);
        throw e;
      });
  } catch (error) {
    return new Response(`Error: ${error}`, { status: 500, headers: headers });
  }
}

//** widget ai Converge */
async function handleRequestAIWidgetConvergeGpt35(request, res) {
  try {
    // 解析获取传入的信息。假设信息是JSON格式并用POST方法发送
    const { commandData, currentWidgetsTextContent } = await request.body;

    const key = azureApiKey;

    let totalTokens = null;

    const AzureOpenAIlangchain = new ChatOpenAI({
      azureOpenAIApiKey: key,
      azureOpenAIApiInstanceName: "boardxai",
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

    const refineEmbeddingsModelAzureOpenAI = {
      azureOpenAIApiKey: key,
      azureOpenAIApiInstanceName: "boardxai",
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
    };

    const json = JSON.stringify(resultData, null, 2);

    console.warn("resultData", resultData);

    //将结果返回给客户端
    res.status(200).json(json);
  } catch (error) {
    res.status(500).json(`Error: ${error}`);
  }
}

async function handleRequestAIWidgetConvergeGpt4(request, res) {
  try {
    // 解析获取传入的信息。假设信息是JSON格式并用POST方法发送
    const { commandData, currentWidgetsTextContent } = await request.body;

    console.warn("commandData", commandData);
    console.warn("currentWidgetsTextContent", currentWidgetsTextContent);

    const key = azureApiKeyGpt4;

    let totalTokens = null;

    const OpenAIlangchain = new ChatOpenAI({
      azureOpenAIApiKey: key,
      azureOpenAIApiInstanceName: "boardxgpt4",
      azureOpenAIApiDeploymentName: "gpt4",
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
            console.log("handleLLMEnd--1", output);
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
      azureOpenAIApiKey: key,
      azureOpenAIApiInstanceName: "boardxgpt4",
      azureOpenAIApiDeploymentName: "text-embedding-ada-002",
      azureOpenAIApiVersion: "2023-06-01-preview",
      batchSize: 2048,
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
    res.status(200).json(json);
  } catch (error) {
    res.status(500).json(`Error: ${error}`);
  }
}

//** widget ai diverge */
async function handleRequestAIWidgetDivergeGpt35(request, res) {
  try {
    // 解析获取传入的信息。假设信息是JSON格式并用POST方法发送
    const { commandData, prompt } = await request.body;

    const key = azureApiKey;

    let totalTokens = null;

    const AzureOpenAIlangchain = new ChatOpenAI({
      azureOpenAIApiKey: key,
      azureOpenAIApiInstanceName: "boardxai",
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

    const result = await AzureOpenAIlangchain.call([new HumanMessage(prompt)]);

    const resultData = {
      content: result.content,
      totalTokens: totalTokens.llmOutput.tokenUsage.totalTokens,
    };

    const json = JSON.stringify(resultData, null, 2);

    //将结果返回给客户端
    res.status(200).json(json);
  } catch (error) {
    res.status(500).json(`Error: ${error}`);
  }
}

async function handleRequestAIWidgetDivergeGpt4(request, res) {
  try {
    // 解析获取传入的信息。假设信息是JSON格式并用POST方法发送
    const { commandData, prompt } = await request.body;

    const key = azureApiKeyGpt4;

    let totalTokens = null;

    const OpenAIlangchain = new ChatOpenAI({
      azureOpenAIApiKey: key,
      azureOpenAIApiInstanceName: "boardxgpt4",
      azureOpenAIApiDeploymentName: "gpt4",
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

    const result = await OpenAIlangchain.call([new HumanMessage(prompt)]);

    const resultData = {
      content: result.content,
      totalTokens: totalTokens.llmOutput.tokenUsage.totalTokens,
    };

    const json = JSON.stringify(resultData, null, 2);

    //将结果返回给客户端
    res.status(200).json(json);
  } catch (error) {
    res.status(500).json(`Error: ${error}`);
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

    const questionPromptTemplateString = `Context information is below.
      ---------------------
      {context}
      ---------------------
      Given the context information and no prior knowledge, answer the question: {question}`;

    const questionPromptTemplate = new PromptTemplate({
      inputVariables: ["context", "question"],
      template: questionPromptTemplateString,
    });

    const refinePromptTemplateString = `The original question is as follows: {question}
      We have provided an existing answer: {existing_answer}
      We have the opportunity to refine the existing answer
      (only if needed) with some more context below.
      ------------
      {context}
      ------------
      Given the new context, refine the original answer to better answer the question.
      You must provide a response, either original answer or refined answer.`;

    const refinePrompt = new PromptTemplate({
      inputVariables: ["question", "existing_answer", "context"],
      template: refinePromptTemplateString,
    });

    return { parser, questionPromptTemplate, refinePrompt };
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
  const { parser, questionPromptTemplate, refinePrompt } =
    getDefinePromptTemplate(commandData);

  const embeddings = new OpenAIEmbeddings(refineEmbeddingsModel);

  let chain = loadQARefineChain(llms);

  if (questionPromptTemplate) {
    chain = loadQARefineChain(llms, {
      questionPrompt: questionPromptTemplate,
      refinePrompt: refinePrompt,
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

async function parseFormData(request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const formData = new FormData();
    const body = await request.formData();
    for (const [key, value] of body.entries()) {
      formData.append(key, value);
    }
    return formData;
  } else {
    throw new Error("不支持的请求内容类型");
  }
}

async function handleRequestAIChatAudioToText(request, res) {
  try {
    const form = new formidable.IncomingForm();
    form.parse(request, async function (err, fields, files) {
      // files 是上传的文件信息，可以处理保存文件

      console.warn("files", files);
      console.warn("fields", fields);
      const stream = streamifier.createReadStream(files);

      console.warn("stream", stream);
      console.warn("transcription", transcription);
      res.send({ message: "文件上传成功-1" });
    });

    form.on("end", function () {
      res.status(200).json({ message: "文件上传成功-1" });
    });
  } catch (error) {
    return new Response("服务器出错", { status: 500 });
  }
}

export {
  handleRequestAIChatGpt35,
  handleRequestTest,
  handleRequestAIChatGpt4,
  handleRequestAIWidgetConvergeGpt35,
  handleRequestAIWidgetConvergeGpt4,
  handleRequestAIWidgetDivergeGpt35,
  handleRequestAIWidgetDivergeGpt4,
  getDefinePromptTemplate,
  langchainRefineProcessingText,
  handleRequestAIChatAudioToText,
};
