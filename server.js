require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
app.use(express.json());
app.use(cors());

const EMAIL = process.env.OFFICIAL_EMAIL;

function fibonacci(n) {
    if (n < 0) return [];
    let arr = [0, 1];
    for (let i = 2; i < n; i++) {
        arr.push(arr[i - 1] + arr[i - 2]);
    }
    return arr.slice(0, n);
}
function isPrime(num) {
    if (num < 2) return false;
    for (let i = 2; i * i <= num; i++) {
        if (num % i === 0) return false;
    }
    return true;
}
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}
function hcfArray(arr) {
    return arr.reduce((acc, val) => gcd(acc, val));
}
function lcm(a, b) {
    return (a * b) / gcd(a, b);
}
function lcmArray(arr) {
    return arr.reduce((acc, val) => lcm(acc, val));
}
async function askAI(question) {
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [{
                            text: `Answer the following question in ONE WORD only. No punctuation.\n\n${question}`
                        }]
                    }
                ]
            }
        );
        let answer = response.data.candidates[0].content.parts[0].text.trim();
        answer = answer.split(" ")[0];
        return answer;
    } catch (error) {
        console.log("Gemini Error:", error.response?.data || error.message);
        throw new Error("AI API failed");
    }
}
app.get("/health", (req, res) => {
    return res.status(200).json({
        is_success: true,
        official_email: EMAIL
    });
});
app.post("/bfhl", async (req, res) => {
    try {
        const body = req.body;
        const keys = Object.keys(body);
        if (keys.length !== 1) {
            return res.status(400).json({
                is_success: false,
                official_email: EMAIL,
                error: "Exactly one key required"
            });
        }
        const key = keys[0];
        const value = body[key];
        let data;
        switch (key) {
            case "fibonacci":
                if (typeof value !== "number" || value < 0)
                    throw new Error("Invalid fibonacci input");
                data = fibonacci(value);
                break;
            case "prime":
                if (!Array.isArray(value))
                    throw new Error("Invalid prime input");
                data = value.filter(isPrime);
                break;
            case "lcm":
                if (!Array.isArray(value))
                    throw new Error("Invalid lcm input");
                data = lcmArray(value);
                break;
            case "hcf":
                if (!Array.isArray(value))
                    throw new Error("Invalid hcf input");
                data = hcfArray(value);
                break;
            case "AI":
                if (typeof value !== "string")
                    throw new Error("Invalid AI input");
                data = await askAI(value);
                break;
            default:
                return res.status(400).json({
                    is_success: false,
                    official_email: EMAIL,
                    error: "Invalid key"
                });
        }
        return res.status(200).json({
            is_success: true,
            official_email: EMAIL,
            data
        });
    } catch (err) {
        return res.status(500).json({
            is_success: false,
            official_email: EMAIL,
            error: err.message
        });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
