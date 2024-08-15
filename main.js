import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
import './style.css';

let API_KEY = 'AIzaSyBXWODYhZnSv1ggNfE73B6AiVfiMY50loU';

let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let chatOutput = document.querySelector('#chat-output');

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ],
});

const chat = model.startChat({
  history: [],
  generationConfig: {
    maxOutputTokens: 1000,
    temperature: 0.8,
  }
});

form.onsubmit = async (ev) => {
  ev.preventDefault();

  const prompt = promptInput.value.trim().toLowerCase();
  addChatBubble(prompt, 'user');

  if (prompt.includes('siapa kamu') || prompt.includes('kamu siapa') || prompt.includes('siapa cerdaskara')) {
    const responseText = "Saya adalah Cerdaskara, alat edukasi interaktif yang dirancang untuk membantu Anda belajar dan mengeksplorasi berbagai topik. Bagaimana saya bisa membantu Anda hari ini?";
    addChatBubble(responseText, 'ai');
  } else {
    const loadingBubble = addChatBubble('Typing...', 'ai', true);

    try {
      const result = await chat.sendMessageStream(prompt);

      let buffer = [];
      let md = new MarkdownIt();
      for await (let response of result.stream) {
        buffer.push(response.text());
      }

      loadingBubble.innerHTML = md.render(buffer.join(''));
      loadingBubble.classList.remove('normal', 'text-gray-100');

    } catch (e) {
      loadingBubble.innerHTML = '<hr>' + e;
      loadingBubble.classList.remove('normal', 'text-gray-100');
    }
  }

  promptInput.value = '';
};

function addChatBubble(text, sender, isLoading = false) {
  const bubble = document.createElement('div');
  bubble.classList.add('flex', sender === 'user' ? 'justify-end' : 'justify-start');
  
  const bubbleInner = document.createElement('div');
  bubbleInner.classList.add('px-4', 'py-2', 'break-words', 'rounded-lg', 'text-white', 'shadow-md', 'bubble-inner');
  bubbleInner.classList.add(sender === 'user' ? 'bg-blue-500' : 'bg-gray-500');

  if (sender === 'ai') {
    bubbleInner.classList.add('bubble-inner-ai');
  }
  
  if (isLoading) {
    bubbleInner.classList.add('normal', 'text-gray-100');
  }

  bubbleInner.innerHTML = text;
  
  bubble.appendChild(bubbleInner);
  chatOutput.appendChild(bubble);

  chatOutput.scrollTop = chatOutput.scrollHeight;

  return bubbleInner;
}

maybeShowApiKeyBanner(API_KEY);