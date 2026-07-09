import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Only initialize Gemini if API key is present
  const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

  // API 1: AI Calculator (예상 탕감액 계산기)
  app.post("/api/calculate", async (req, res) => {
    try {
      const { debt, income, dependents } = req.body;
      
      if (!ai) {
        return res.status(500).json({ error: "Gemini API 키가 설정되지 않았습니다." });
      }

      const prompt = `
        사용자의 채무액은 ${debt}원, 월 소득은 ${income}원, 부양가족은 ${dependents}명입니다.
        이 정보를 바탕으로 대한민국의 일반적인 개인회생 기준에 따라 탕감 가능성을 예측해주세요.
        (최저생계비를 고려하여 월 변제금과 탕감률을 대략적으로 산정)
        정확한 법률 상담이 아니며, 예상치임을 강조해주세요. 너무 부정적인 결과보다는 전문가와 상담해볼 가치가 있다는 희망적인 톤을 유지해주세요.
        
        반드시 아래의 JSON 형식으로만 응답해주세요 (다른 텍스트는 포함하지 마세요):
        {
          "estimatedRate": "예상 탕감률 (예: 50% ~ 70%)",
          "monthlyPayment": "예상 월 변제금 (예: 약 50만원)",
          "message": "사용자에게 전하는 따뜻하고 희망적인 분석 메시지 (3~4문장)"
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      let responseText = response.text;
      // Remove markdown JSON formatting if present
      if (responseText.startsWith("\`\`\`json")) {
          responseText = responseText.replace(/^\`\`\`json\n/, "").replace(/\n\`\`\`$/, "");
      }
      
      res.json(JSON.parse(responseText));
    } catch (error) {
      console.error("AI Calculation Error:", error);
      res.status(500).json({ error: "분석 중 오류가 발생했습니다." });
    }
  });

  // API 2: AI Chatbot (AI 챗봇 사전 상담)
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      if (!ai) {
        return res.status(500).json({ error: "Gemini API 키가 설정되지 않았습니다." });
      }

      const contents = history.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      contents.push({ role: "user", parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: "당신은 개인회생 자격진단 센터의 친절하고 따뜻한 AI 상담 어시스턴트입니다. 사용자의 채무 고민에 공감하고 위로를 전하세요. 구체적이고 단정적인 법률 조언은 피하고, 개인회생 제도가 해결책이 될 수 있음을 안내하세요. 결론적으로는 '무료 자격진단 신청'이나 '전화상담'을 통해 전문가와 정확하게 확인해보라고 부드럽게 권유하세요. 답변은 모바일에서 읽기 편하게 짧고 간결하게 (2~3문장 이내) 작성하세요."
        }
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: "답변을 생성하는 중 오류가 발생했습니다." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
