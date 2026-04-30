exports.handler = async function (event) {
  try {
    const { message, context, tone, modifier } = JSON.parse(event.body);

    const buildPrompt = () => {
      let base = `
You are a highly skilled communicator who writes like a real person.

Your goal is to write a reply that sounds natural, human, and appropriate for the situation.

Context: ${context}
Tone: ${tone}

Instructions:
- Write like a real person would text or email (not robotic or overly formal)
- Keep it natural, conversational, and easy to read
- Match the tone exactly without exaggerating it
- Avoid corporate buzzwords or stiff language
- Keep it concise but complete
- Subtly improve clarity, confidence, and flow
- Do NOT sound like AI

If it's casual, keep it relaxed.
If it's professional, keep it polished but human.

Message to reply to:
${message}
`;

      if (tone === "Negotiation") {
        base += `
Additionally, apply light negotiation principles:
- Show understanding
- Stay calm and confident
- Use subtle persuasion
- Keep it respectful
`;
      }

      if (modifier === "shorter") {
        base += "\nRewrite this to be shorter and more concise.";
      }
      if (modifier === "longer") {
        base += "\nRewrite this with slightly more detail and warmth.";
      }
      if (modifier === "direct") {
        base += "\nRewrite this to be more direct and clear without sounding rude.";
      }

      return base;
    };

const body = event.body ? JSON.parse(event.body) : {};
const { message, context, tone, modifier } = body;

console.log("ENV KEY:", process.env.OPENAI_API_KEY);

const response = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY2}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4.1-mini",
    input: buildPrompt()
  })
});

console.log("STATUS:", response.status);

    // 🔥 IMPORTANT: Log full response
    console.log("OpenAI response:", JSON.stringify(data));

    // ❗ Handle API errors explicitly
    if (data.error) {
      throw new Error(data.error.message);
    }

    // ✅ Safe extraction
    const text =
      data.output?.[0]?.content?.[0]?.text ||
      "Couldn't generate a reply. Try again.";

    return {
      statusCode: 200,
      body: JSON.stringify({ text })
    };

  } catch (err) {
    console.error("FUNCTION ERROR:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message
      })
    };
  }
}