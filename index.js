require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
const { ethers } = require("ethers");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function hashMessage(message) {
  return ethers.keccak256(ethers.toUtf8Bytes(message));
}

app.post("/api/analyze", async (req, res) => {
  const { message } = req.body;

  const prompt = `extract fields: intent, sentiment, topic, summary from the following message:
"${message}"`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });
  const reply = response.choices[0].message.content;
  let context;
  try {
    context = JSON.parse(reply);
  } catch {
    return res.status(400).json({ error: "invalid json" });
  }

  const hash = hashMessage(message);
  res.json({ ...context, hash });
});

app.listen(3001, () => console.log("Server AI MCP listening on port 3001"));
