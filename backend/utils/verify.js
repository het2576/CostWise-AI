export async function verifyGeminiKey() {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    await model.generateContent("Test connection");
    console.log("✅ Gemini API connection successful");
  } catch (error) {
    console.error("❌ Gemini API connection failed:", error.message);
  }
} 