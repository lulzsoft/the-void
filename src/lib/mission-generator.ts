import { GoogleGenerativeAI } from "@google/generative-ai";
import { MissionRegistry } from "./mission-registry";

// Procedural Fallback Data
const PREFIXES = ["Operation", "Project", "Initiative", "Protocol"];
const CODE_NAMES = ["Red Dawn", "Black Mirror", "Neon Ghost", "Cyber Tooth", "Silent Echo", "Velvet Thunder"];
const TARGETS = ["Arasaka Corp", "The Bank", "Government Archives", "Encrypted Nexus", "Rogue AI"];
const ACTIONS = ["Infiltrate", "Extract", "Destroy", "Hack", "Monitor"];

export class MissionGenerator {
    private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");

    static async generate(topic?: string): Promise<any> {
        try {
            if (process.env.GEMINI_API_KEY) {
                const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
                const prompt = `Generate a unique, cyberpunk-themed mission for a freelance agent platform. 
                Return ONLY a JSON object with these fields:
                - title: (Cool mission name)
                - description: (2-3 sentences max, atmospheric)
                - difficulty: (Easy, Medium, Hard, Suicide)
                - compensation: (e.g. $5000 or 0.5 BTC)
                - duration: (e.g. 48h)
                - requirements: (Array of 3 skill keywords like "Hacking", "Stealth")
                
                Topic/Theme: ${topic || "Corporate Espionage"}`;

                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();

                // Clean markdown code blocks if present
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(jsonStr);
            }
            throw new Error("No API Key");
        } catch (error) {
            console.log("Falling back to procedural generation due to:", error);
            return this.generateProcedural(topic);
        }
    }

    private static generateProcedural(topic?: string) {
        const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
        const code = CODE_NAMES[Math.floor(Math.random() * CODE_NAMES.length)];
        const target = TARGETS[Math.floor(Math.random() * TARGETS.length)];
        const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];

        return {
            title: `${prefix}: ${code}`,
            description: `We need an elite agent to ${action.toLowerCase()} assets from ${target}. High security environment. Stealth is optional but casualties reduce payout.`,
            difficulty: ["Medium", "Hard", "Expert"][Math.floor(Math.random() * 3)],
            compensation: `$${(Math.floor(Math.random() * 50) + 10) * 100}`,
            duration: `${Math.floor(Math.random() * 72) + 24}h`,
            requirements: ["Stealth", "Hacking", "Combat"].sort(() => 0.5 - Math.random()).slice(0, 2)
        };
    }
}
