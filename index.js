import langchain from 'langchain';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
    HumanMessage,
    SystemMessage,
    AIMessage
} from 'langchain/schema';
import { BufferMemory, ChatMessageHistory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { loadQAStuffChain } from 'langchain/chains';
//import { TextLoader } from 'langchain/document_loaders/fs/text';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { loadQARefineChain } from 'langchain/chains';
import { loadQAMapReduceChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';

const tokenList = ['sk-kyTesnlEcYH2Wk4PpsfRCysuTOMzX', 'sk-2NXtwfKhQ7PkEHdHavbiU9Iq0KZTwK'];
// langchain
const OpenAIlangchain = new ChatOpenAI({
    openAIApiKey: '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',
    modelName: 'gpt-4',
});

const AzureOpenAIlangchain = new ChatOpenAI({
    azureOpenAIApiKey: '0a2dcdf910784ba0bf070787646409d7',
    azureOpenAIApiInstanceName: 'boardxai',
    azureOpenAIApiDeploymentName: 'gpt35-16k',
    azureOpenAIApiVersion: '2023-06-01-preview',
});

addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    //判断tokens是否等于tokenList中的某一个
    const tokens = url.searchParams.get('token');
    if (tokens !== null && tokenList.includes(tokens)) {
        if (event.request.method === 'POST' && url.pathname === '/handleRequestAIChat') {
            event.respondWith(handleRequestAIChat(event.request));
        } else if (event.request.method === 'GET' && url.pathname === '/handleRequestTest') {
            event.respondWith(handleRequestTest(event.request));
        } else {
            // 如果是其他类型请求或者url路径不匹配，返回405 Method Not Allowed
            event.respondWith(new Response('Invalid request method or path', { status: 405 }));
        }
    } else {
        event.respondWith(new Response('Invalid token', { status: 403 }));
    }

})

async function handleRequestAIChat(request) {
    try {
        // 解析获取传入的信息。假设信息是JSON格式并用POST方法发送
        const { pastMessages, prompt } = await request.json();

        // 初始化内存和链
        const memory = new BufferMemory({
            chatHistory: new ChatMessageHistory(pastMessages)
        });
        const chain = new ConversationChain({
            llm: AzureOpenAIlangchain,
            memory: memory
            // verbose: true
        });

        // 调用链并获取响应
        const response = await chain.call({
            input: prompt
        });

        //将结果返回给客户端
        return new Response(JSON.stringify(response), { status: 200 });
    }
    catch (error) {
        return new Response(`Error: ${error}`, { status: 500 })
    }
}

async function handleRequestTest(request) {
    try {

        const response = 'ok this is a test';
        //将结果返回给客户端
        return new Response(JSON.stringify(response), { status: 200 });
    }
    catch (error) {
        return new Response(`Error: ${error}`, { status: 500 })
    }
}