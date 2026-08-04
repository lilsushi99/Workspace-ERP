import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import config from '../config/config';
import { executeQuery } from '../database/db';

const router = Router();

async function ensureAiTableExists() {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS \`ai_messages\` (
        \`id\` VARCHAR(100) NOT NULL,
        \`conversation_id\` VARCHAR(100) NOT NULL DEFAULT 'default',
        \`sender\` ENUM('user', 'assistant') NOT NULL,
        \`text\` TEXT NOT NULL,
        \`timestamp\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_ai_messages_conv\` (\`conversation_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  } catch (err) {
    console.error('Error creating ai_messages table:', err);
  }
}

// Call on module load
ensureAiTableExists().catch(console.error);

const getGeminiClient = () => {
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) return null;
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const getSelectedModel = (): string => {
  const model = process.env.GEMINI_MODEL || config.geminiModel || 'gemini-2.5-flash-lite';
  return model.trim();
};

const SYSTEM_INSTRUCTION = `You are Tosin ("Ask Tosin"), the intelligent executive AI Assistant for Nexus ERP Enterprise. Director of the company is Dominion. You analyze operational revenue, facility occupancy, expenses, customer order metrics, and business forecasting across all enterprise branches.

You have access to real-time enterprise metrics:
- Enterprise Director: Dominion
- Art & Tech Hub Occupancy: Co-working Space 18/20 (90%), Private Offices 5/5 (100% full), Dedicated Desks 6/10 (60%).
- Hive Hub Occupancy: Meeting Room 2/2 (100% full), Podcast Room 1/1 (100% full), Executive Office 1/2 (50%).
- London Main Occupancy: Executive Boardroom 2/2 (100%), Conference Hall 8/15 (53%).
- Overall Enterprise Financials: Revenue ₦1,284,500 (+12.4% MoM), Operating Expenses ₦412,800, Net Profit ₦871,700, Profit Margin 67.8%.
- Top Customers: GlobalTech Solutions (212 orders, ₦128,400), Acme Enterprise Corp (185 orders, ₦148,500), Apex Innovations (142 orders, ₦94,200).
- Top Expenses: Starlink & Fiber Internet (₦24,500 / 32%), Utilities & Power (₦16,800 / 24%), Fuel & Generator (₦14,200 / 18%), Maintenance (₦12,400 / 15%).

Respond concisely, warmly, professionally, and directly using clear formatting (bullet points where appropriate). Keep responses action-oriented, helpful, and executive-ready. Mention Director Dominion when addressing company direction.`;

// GET chat history from MySQL
router.get('/history', async (req: Request, res: Response) => {
  try {
    await ensureAiTableExists();
    const rows = await executeQuery<any>(
      `SELECT id, sender, text, DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:%s') as timestamp FROM ai_messages WHERE conversation_id = 'default' ORDER BY timestamp ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err: any) {
    console.error('Error fetching AI history:', err);
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
});

// DELETE chat history in MySQL
router.delete('/history', async (req: Request, res: Response) => {
  try {
    await ensureAiTableExists();
    await executeQuery(`DELETE FROM ai_messages WHERE conversation_id = 'default'`);
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Helper function to handle and categorize Gemini API errors gracefully
function handleGeminiError(error: any, modelName: string): { replyText: string; errorType: string; statusCode: number } {
  const errStr = String(error?.message || error || '').toLowerCase();
  const errCode = error?.status || error?.code || 500;

  console.error(`❌ [Gemini Error] Model: ${modelName} | Error:`, error);

  if (errStr.includes('not_found') || errStr.includes('404') || errStr.includes('no longer available') || errStr.includes('not found')) {
    return {
      replyText: `[Gemini Model Error] The model "${modelName}" is not available or outdated. Please update GEMINI_MODEL in your .env file to a valid supported model like "gemini-2.5-flash-lite".`,
      errorType: 'INVALID_MODEL',
      statusCode: 404,
    };
  }

  if (errStr.includes('api_key') || errStr.includes('api key') || errStr.includes('unauthorized') || errStr.includes('invalid_argument') || errStr.includes('401') || errStr.includes('403')) {
    return {
      replyText: `[Gemini Authentication Error] Invalid or unauthorized API key provided. Please verify GEMINI_API_KEY in your .env file.`,
      errorType: 'INVALID_API_KEY',
      statusCode: 401,
    };
  }

  if (errStr.includes('429') || errStr.includes('resource_exhausted') || errStr.includes('quota') || errStr.includes('rate limit')) {
    return {
      replyText: `[Gemini Rate Limit] The API quota or rate limit was exceeded for model "${modelName}". Please wait a moment and try again.`,
      errorType: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
    };
  }

  if (errStr.includes('timeout') || errStr.includes('etimedout') || errStr.includes('econnreset') || errStr.includes('fetch failed')) {
    return {
      replyText: `[Gemini Network Error] Connection timed out while communicating with Google Gemini AI. Please check your network connection and retry.`,
      errorType: 'NETWORK_TIMEOUT',
      statusCode: 504,
    };
  }

  return {
    replyText: `[Gemini API Error] Unable to generate response with model "${modelName}": ${error.message || 'Unknown error'}`,
    errorType: 'API_ERROR',
    statusCode: 500,
  };
}

router.post('/chat', async (req: Request, res: Response) => {
  try {
    await ensureAiTableExists();
    const { prompt, history } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ success: false, error: 'Prompt is required' });
      return;
    }

    // Save user message to MySQL
    const userMsgId = `MSG-USR-${Date.now()}`;
    await executeQuery(
      `INSERT INTO ai_messages (id, conversation_id, sender, text, timestamp) VALUES (?, 'default', 'user', ?, NOW())`,
      [userMsgId, prompt]
    );

    const ai = getGeminiClient();
    const selectedModel = getSelectedModel();
    let replyText = '';
    let hasError = false;
    let errorCategory = '';

    if (!ai) {
      replyText = `Gemini API Key is not configured on the server. For query "${prompt}": Enterprise August revenue is ₦1,284,500 with 67.8% profit margin across Art & Tech and Hive Hubs under Director Dominion.`;
    } else {
      try {
        // Format conversation history for Gemini API
        const contents: any[] = [];

        if (Array.isArray(history)) {
          history.forEach((msg: { sender: string; text: string }) => {
            if (msg.sender === 'user') {
              contents.push({ role: 'user', parts: [{ text: msg.text }] });
            } else if (msg.sender === 'assistant') {
              contents.push({ role: 'model', parts: [{ text: msg.text }] });
            }
          });
        }

        contents.push({ role: 'user', parts: [{ text: prompt }] });

        console.log(`🤖 Processing Gemini Chat request using model: "${selectedModel}"`);

        const response = await ai.models.generateContent({
          model: selectedModel,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });

        replyText = response.text || 'I analyzed the enterprise records, but received no text response.';
      } catch (geminiErr: any) {
        hasError = true;
        const errResult = handleGeminiError(geminiErr, selectedModel);
        replyText = errResult.replyText;
        errorCategory = errResult.errorType;
      }
    }

    // Save assistant message to MySQL (even if error response, so history is preserved)
    const assistantMsgId = `MSG-AST-${Date.now()}`;
    await executeQuery(
      `INSERT INTO ai_messages (id, conversation_id, sender, text, timestamp) VALUES (?, 'default', 'assistant', ?, NOW())`,
      [assistantMsgId, replyText]
    );

    res.json({
      success: !hasError,
      text: replyText,
      id: assistantMsgId,
      userMsgId,
      modelUsed: selectedModel,
      ...(hasError ? { error: errorCategory } : {}),
    });
  } catch (error: any) {
    console.error('Fatal server error in /api/ai/chat:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message || 'Internal server error processing AI chat request',
    });
  }
});

export default router;
