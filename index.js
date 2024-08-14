const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", () => {
  console.log("server is Running");
});

app.listen(port, () => {
  console.log(`Port is running at: ${port}`);
});
