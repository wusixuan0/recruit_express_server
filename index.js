import dotenv from 'dotenv/config'
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai"

const app = express();
const PORT = 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

if (!process.env.GEMINI_API_KEY) {
    console.error("API key not found");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function googleApiFetch(prompt) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
}

app.post("/api", async (req, res) => {
    const prompt = req.body.prompt; 
    
    try {
        const responseText = await googleApiFetch(prompt);

        res.json({
            responseText: responseText,
        });
    } catch (error) {
        console.error("Error fetching data from Google API:", error);
        res.status(500).json({ error: "Error fetching data from Google API" });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});