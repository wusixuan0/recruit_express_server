import dotenv from 'dotenv/config'
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai"
import * as fs from 'fs';

const app = express();
const port = process.env.PORT || 3001;

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

async function readFile() {
    const randomIndex = Math.floor(Math.random() * 3) + 1;

    const fileName = `response${randomIndex}.txt`;

    try {
        const data = await fs.promises.readFile(fileName, 'utf-8');
        return data;
    } catch (err) {
        console.error('Error reading file:', err);
    }
}

async function saveToFile(filePath, data) {
  try {
    await fs.promises.writeFile(filePath, data, 'utf-8');
    console.log(`Successfully saved data to ${filePath}`);
  } catch (err) {
    console.error('Error saving file:', err);
  }
}

app.get("/", async (req, res) => {
    console.log(`Received Get request for ${req.url} at ${new Date().toISOString()}`);

    const responseText = await readFile();

    res.json({
        responseText: responseText,
    });
});


app.post("/", async (req, res) => {
    console.log(`Received Post request for ${req.url} at ${new Date().toISOString()}`);
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

app.listen(port, () => {
    console.log(`Server listening on ${port}`);
});