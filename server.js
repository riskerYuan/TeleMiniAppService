const express = require("express");
const cors = require("cors");

import {
  handleRequestTest,
  handleRequestGML,
  handleRequestGML4,
} from "./utils";

const app = express();

app.use(express.json());

app.use(cors()); // Enable All CORS Requests

app.options('*', cors()) // Enable CORS preflight for all routes 测试跨域的时候开启这个地方

function handlePreflight(req, res, next) {
  next();
}

app.use(handlePreflight);

//Ending points

app.get("/handleRequestTest", handleRequestTest);

app.post("/handleRequestGML", handleRequestGML);

app.post("/handleRequestGML4", handleRequestGML4);
//Functions write here

app.listen(8080, function () {
  console.log("Server is running on port 8080");
});
