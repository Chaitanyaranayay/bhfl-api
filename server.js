const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const EMAIL = process.env.OFFICIAL_EMAIL || "chaitanya0316.be23@chitkara.edu.in";

app.get("/health", (req, res) => {
  res.status(200).json({
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
        error: "Request must contain exactly one key"
      });
    }

    const key = keys[0];
    const value = body[key];
    let data;

    if (key === "fibonacci") {
      if (!Number.isInteger(value) || value < 0) {
        return res.status(400).json({
          is_success: false,
          official_email: EMAIL,
          error: "Fibonacci value must be a non-negative integer"
        });
      }

      let fib = [];
      let a = 0, b = 1;
      for (let i = 0; i < value; i++) {
        fib.push(a);
        [a, b] = [b, a + b];
      }
      data = fib;
    }

    else if (key === "prime") {
      if (!Array.isArray(value)) {
        return res.status(400).json({
          is_success: false,
          official_email: EMAIL,
          error: "Prime input must be an array"
        });
      }

      const isPrime = (n) => {
        if (!Number.isInteger(n) || n <= 1) return false;
        for (let i = 2; i <= Math.sqrt(n); i++) {
          if (n % i === 0) return false;
        }
        return true;
      };

      data = value.filter(isPrime);
    }

    else if (key === "hcf") {
      const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
      data = value.reduce((a, b) => gcd(a, b));
    }

    else if (key === "lcm") {
      const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
      const lcm = (a, b) => (a * b) / gcd(a, b);
      data = value.reduce((a, b) => lcm(a, b));
    }

    else if (key === "AI") {
      try {
        const geminiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: `Answer in ONE WORD only: ${value}`
                  }
                ]
              }
            ]
          }
        );

        const aiText =
          geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;

        data = aiText.trim().split(" ")[0];
      } catch (err) {
        return res.status(500).json({
          is_success: false,
          official_email: EMAIL,
          error: "AI service failed"
        });
      }
    }

    else {
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

  } catch (error) {
    return res.status(500).json({
      is_success: false,
      official_email: EMAIL,
      error: "Internal server error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
