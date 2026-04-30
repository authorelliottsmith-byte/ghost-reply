exports.handler = async function (event) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { message, context, tone, intent = "Neutral", modifier } = body;

    console.log("ENV KEY EXISTS:", !!process.env.OPENAI_API_KEY);

    const buildPrompt = () => {
      let base = `
You are a highly skilled communicator who writes like a real person.

Context: ${context}
Tone: ${tone}
Intent: ${intent}

Instructions:
- Write like a real person would text or email.
- Keep it natural, conversational, and easy to read.
- Match the selected tone without exaggerating it.
- Follow the user's intent:
  - Accept → positive and interested
  - Decline → polite and respectful rejection
  - Neutral → non-committal response
- Do NOT use emojis unless the original message clearly uses multiple emojis.
  If used, keep them minimal and natural.
- Avoid corporate buzzwords or stiff language.
- Keep it concise but complete.

Write a natural, human reply to:
${message}
`;

      if (modifier === "shorter") base += "\nMake it shorter.";
      if (modifier === "longer") base += "\nAdd a bit more detail.";
      if (modifier === "direct") base += "\nMake it more direct.";

      return base;
    };

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, // ✅ FIXED
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5.4-nano",
        input: buildPrompt()
      })
    });

    console.log("STATUS:", response.status);

    const data = await response.json();
    console.log("OpenAI response:", JSON.stringify(data));

    if (data.error) throw new Error(data.error.message);

    const text =
      data.output?.[0]?.content?.[0]?.text ||
      "Couldn't generate a reply.";

    return {
      statusCode: 200,
      body: JSON.stringify({ text })
    };

  } catch (err) {
    console.error("FUNCTION ERROR:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
