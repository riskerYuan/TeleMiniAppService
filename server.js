const express = require("express");
const cors = require("cors");

import {
  handleRequestAIChatGpt35,
  handleRequestTest,
  handleRequestAIChatGpt4,
  handleRequestAIWidgetConvergeGpt35,
  handleRequestAIWidgetConvergeGpt4,
  handleRequestAIWidgetDivergeGpt35,
  handleRequestAIWidgetDivergeGpt4,
  handleRequestAIChatAudioToText,
} from "./utils";

const app = express();

app.use(express.json());

app.use(cors()); // Enable All CORS Requests

//app.options('*', cors()) // Enable CORS preflight for all routes 测试跨域的时候开启这个地方

function handlePreflight(req, res, next) {
  next();
}

app.use(handlePreflight);

//Ending points
app.post("/handleRequestAIChatGpt35", handleRequestAIChatGpt35);

app.get("/handleRequestTest", handleRequestTest);

app.post("/handleRequestAIChatGpt4", handleRequestAIChatGpt4);

app.post(
  "/handleRequestAIWidgetConvergeGpt35",
  handleRequestAIWidgetConvergeGpt35
);

app.post(
  "/handleRequestAIWidgetConvergeGpt4",
  handleRequestAIWidgetConvergeGpt4
);

app.post(
  "/handleRequestAIWidgetDivergeGpt35",
  handleRequestAIWidgetDivergeGpt35
);

app.post("/handleRequestAIWidgetDivergeGpt4", handleRequestAIWidgetDivergeGpt4);

app.post("/handleRequestAIChatAudioToText", handleRequestAIChatAudioToText);
//Functions write here

app.listen(8080, function () {
  console.log("Server is running on port 8080");
});
