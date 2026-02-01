import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// test route (IMPORTANT)
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// AI Helpbot route
app.post("/helpbot", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.json({ reply: "Please ask something 🙂" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a friendly help bot for an expense tracking app. Give simple money-saving advice.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    res.json({
      reply: response.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "AI is not responding right now 😕" });
  }
});

// start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
