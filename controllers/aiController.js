const { GoogleGenAI } = require("@google/genai");
const { sendError } = require("../utils/error");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MAX_CHARS = 10000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const generateWithRetry = async (model, contents, retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await ai.models.generateContent({ model, contents });
      return result;
    } catch (error) {
      const isRetryable =
        error.status === 503 || // Service unavailable
        error.status === 429 || // Rate limit
        error.status === 500; // Internal server error

      const isLastAttempt = attempt === retries;

      if (isRetryable && !isLastAttempt) {
        const delay = RETRY_DELAY_MS * attempt;
        console.warn(
          `Gemini attempt ${attempt} failed (${error.status}). Retrying in ${delay}ms...`
        );
        await wait(delay);
        continue;
      }

      throw error;
    }
  }
};

exports.summarizeText = async (req, res) => {
  try {
    const { text, mode = "paragraph" } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return sendError(res, 400, "Please enter some text to summarize");
    }

    if (text.length > MAX_CHARS) {
      return sendError(res, 413, `Text exceeds ${MAX_CHARS.toLocaleString()} character limit.`);
    }

    const prompts = {
      paragraph: `Summarize the following text in a concise paragraph (3-5 sentences). Be clear and informative:\n\n${text}`,
      bullets: `Summarize the following text as 5 key bullet points. Start each point with dot "•":\n\n${text}`,
      oneline: `Summarize the following text in exactly one sentence:\n\n${text}`,
    };

    if (!prompts[mode]) {
      return sendError(res, 400, "Invalid summary mode");
    }

    const result = await generateWithRetry(process.env.GEMINI_API_MODEL, prompts[mode]);

    const finishReason = result.candidates?.[0]?.finishReason;

    if (finishReason === "SAFETY" || finishReason === "RECITATION") {
      return sendError(res, 422, "Content was blocked by safety filters.");
    }

    return res.json({
      summary: result.text,
      isTruncated: finishReason === "MAX_TOKENS",
      tokens: {
        input: result.usageMetadata?.promptTokenCount ?? 0,
        output: result.usageMetadata?.candidatesTokenCount ?? 0,
        thinking: result.usageMetadata?.thoughtsTokenCount ?? 0,
        total: result.usageMetadata?.totalTokenCount ?? 0,
      },
    });
  } catch (error) {
    console.error("AI Summarize Failed", error);

    if (error.status === 503) {
      return sendError(res, 503, "AI is temporarily overloaded. Please try again in a moment.");
    }
    if (error.status === 429) {
      return sendError(res, 429, "Rate limit reached. Please wait a moment and try again.");
    }

    return sendError(res, 500, "Failed to summarize text. Please try again.");
  }
};
