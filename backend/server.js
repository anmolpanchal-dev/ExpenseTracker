import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

// load .env
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// test route
app.get("/", (req, res) => {
  res.send("AI Helpbot backend running 🚀");
});

// chatbot route
app.post("/api/helpbot", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) return res.json({ reply: "Please ask something 🙂" });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant for an expense tracker app. Explain expenses, suggest savings, and guide users simply.",
        },
        { role: "user", content: message },
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "AI is not responding 😕" });
  }
});

// start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
