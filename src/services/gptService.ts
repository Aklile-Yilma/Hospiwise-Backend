import { OpenAI } from "openai";
import * as dotenv from "dotenv";
dotenv.config();

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";  // Azure custom endpoint
const modelName = "gpt-4o";  // Azure model name (make sure it's correct)

// Create a new OpenAI client using Azure's custom endpoint and API key
const client = new OpenAI({ baseURL: endpoint, apiKey: token });

export const askGPT = async (prompt: string) => {
  try {
    // Send a request to the Azure GPT model with the provided prompt
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant for managing and maintaining hospital facilities. You provide detailed information and assist with troubleshooting, maintenance requests." },
        { role: "user", content: prompt }  // The user prompt you want to send
      ],
      model: modelName  // Use the Azure model name here
    });

    // Return the response content
    return response.choices[0].message.content;
  } catch (err) {
    console.error("Error with Azure GPT API:", err);
    throw new Error("Failed to communicate with the GPT model");
  }
};
