const API_URL = "https://ghost-reply.netlify.app/.netlify/functions/generate";

const messageInput = document.querySelector("#message");
const contextSelect = document.querySelector("#context");
const toneSelect = document.querySelector("#tone");
const intentSelect = document.querySelector("#intent");
const generateButton = document.querySelector("#generate");
const copyButton = document.querySelector("#copy");
const output = document.querySelector("#output");
const statusText = document.querySelector("#status");

let currentReply = "";

function setStatus(message) {
  statusText.textContent = message;
}

function setLoading(isLoading) {
  generateButton.disabled = isLoading;
  copyButton.disabled = isLoading || !currentReply;
  generateButton.textContent = isLoading ? "Generating..." : "Generate reply";
}

function renderReply(text) {
  currentReply = text.trim();
  output.textContent = currentReply || "Your reply will appear here.";
  output.classList.toggle("is-empty", !currentReply);
  copyButton.disabled = !currentReply;
}

async function generateReply() {
  const message = messageInput.value.trim();

  if (!message) {
    setStatus("Paste a message first.");
    messageInput.focus();
    return;
  }

  setStatus("");
  setLoading(true);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        context: contextSelect.value,
        tone: toneSelect.value,
        intent: intentSelect.value
      })
    });

    const data = await response.json();

    if (!response.ok || !data.text) {
      throw new Error(data.error || "Request failed");
    }

    renderReply(data.text);
  } catch (error) {
    console.error(error);
    setStatus("Something went wrong. Try again in a second.");
  } finally {
    setLoading(false);
  }
}

generateButton.addEventListener("click", generateReply);

copyButton.addEventListener("click", async () => {
  if (!currentReply) return;

  try {
    await navigator.clipboard.writeText(currentReply);
    copyButton.textContent = "Copied";
    window.setTimeout(() => {
      copyButton.textContent = "Copy";
    }, 1200);
  } catch {
    setStatus("Could not copy the reply.");
  }
});

messageInput.addEventListener("input", () => setStatus(""));
