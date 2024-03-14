const express = require("express");
const cors = require("cors");

import {
  handleRequestTest,
  handleRequestGML,
  handleRequestGPT4,
  handleRequestGML4ForPaperGpt,
  handleRequestZw
} from "../utils/functions";

const app = express();

app.use(express.json());

app.use(cors()); // Enable All CORS Requests

app.options('*', cors()) // Enable CORS preflight for all routes 测试跨域的时候开启这个地方

//Ending points

app.get("/handleRequestTest", handleRequestTest);

app.post("/handleRequestGML", handleRequestGML);

app.post("/handleRequestGPT4", handleRequestGPT4);

app.post("/handleRequestGML4ForPaperGpt", handleRequestGML4ForPaperGpt);

app.post("/handleRequestZw", handleRequestZw);
//Functions write here

app.listen(8080, function () {
  console.log("Server is running on port 8080");
});
