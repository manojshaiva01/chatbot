const apiKey = "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"; // 🔒 Insert your OpenRouter API key here

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");

let isTyping = false;

// Load chat history from localStorage on page load
window.addEventListener("load", () => {
  const history = localStorage.getItem("chatHistory");
  if (history) {
    const messages = JSON.parse(history);
    messages.forEach(({ sender, text, type }) => {
      appendMessage(sender, text, type, false);
    });
  }
});

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("You", message, "user", true);
  userInput.value = "";

  showTypingIndicator();

  try {
    // Check if user wants to generate an image
    if (message.toLowerCase().includes("generate image") || message.toLowerCase().includes("create image")) {
      // Simulate image generation response
      hideTypingIndicator();
      const imageUrl = "https://via.placeholder.com/300x200.png?text=Generated+Image";
      appendImageMessage("AI", imageUrl, "ai", true);
      return;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-site.com", // optional
        "X-Title": "DeepSeek Chat App"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || "No response from AI.";
    hideTypingIndicator();
    appendMessage("AI", aiText, "ai", true);
  } catch (err) {
    hideTypingIndicator();
    appendMessage("Error", err.message, "ai", true);
  }
}

function appendImageMessage(sender, imageUrl, type, save = true) {
  const msg = document.createElement("div");
  msg.className = `message ${type}`;

  const avatar = document.createElement("span");
  avatar.className = "avatar " + type;
  avatar.textContent = type === "user" ? "👤" : type === "ai" ? "🤖" : "⚠️";

  const content = document.createElement("div");
  content.className = "message-content";

  const img = document.createElement("img");
  img.src = imageUrl;
  img.alt = "Generated Image";
  img.style.maxWidth = "100%";
  img.style.borderRadius = "10px";

  content.appendChild(img);

  const timestamp = document.createElement("div");
  timestamp.className = "timestamp";
  timestamp.textContent = new Date().toLocaleTimeString();

  msg.appendChild(avatar);
  msg.appendChild(content);
  msg.appendChild(timestamp);

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (save) {
    saveChatHistory(sender, "[Image]", type);
  }
}

function appendMessage(sender, text, type, save = true) {
  const msg = document.createElement("div");
  msg.className = `message ${type}`;

  const avatar = document.createElement("span");
  avatar.className = "avatar " + type;
  avatar.textContent = type === "user" ? "👤" : type === "ai" ? "🖥️" : "⚠️";

  const content = document.createElement("div");
  content.className = "message-content";

  if (type === "ai") {
    // Parse text for code blocks delimited by ``` and render separately
    const parts = text.split(/```/);
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Normal text part
        const p = document.createElement("p");
        p.innerHTML = parts[i].replace(/\n/g, "<br>");
        content.appendChild(p);
      } else {
        // Code block part
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.textContent = parts[i];
        pre.appendChild(code);
        content.appendChild(pre);
      }
    }
  } else {
    content.innerHTML = `<strong>${sender}:</strong> ${text}`;
  }

  const timestamp = document.createElement("div");
  timestamp.className = "timestamp";
  timestamp.textContent = new Date().toLocaleTimeString();

  msg.appendChild(avatar);
  msg.appendChild(content);
  msg.appendChild(timestamp);

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (save) {
    saveChatHistory(sender, text, type);
  }
}

function saveChatHistory(sender, text, type) {
  let history = localStorage.getItem("chatHistory");
  let messages = history ? JSON.parse(history) : [];
  messages.push({ sender, text, type });
  localStorage.setItem("chatHistory", JSON.stringify(messages));
}

function showTypingIndicator() {
  if (isTyping) return;
  isTyping = true;
  const typingMsg = document.createElement("div");
  typingMsg.className = "message ai typing-indicator";
  typingMsg.id = "typingIndicator";
  typingMsg.textContent = "AI is typing...";
  chatBox.appendChild(typingMsg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTypingIndicator() {
  isTyping = false;
  const typingMsg = document.getElementById("typingIndicator");
  if (typingMsg) {
    chatBox.removeChild(typingMsg);
  }
}

function clearChat() {
  chatBox.innerHTML = "";
  userInput.value = "";
  userInput.focus();
}

// Enter key to send
userInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
