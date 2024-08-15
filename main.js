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
    maxOutputTokens: 100,
    temperature: 0.5,
  }
});

form.onsubmit = async (ev) => {
  ev.preventDefault();

  const prompt = promptInput.value;
  
  addChatBubble(prompt, 'user');

  const loadingBubble = addChatBubble('Typing...', 'ai', true);

  try {
    const result = await chat.sendMessageStream(prompt);

    let buffer = [];
    let md = new MarkdownIt();
    for await (let response of result.stream) {
      buffer.push(response.text());
    }

    loadingBubble.innerHTML = md.render(buffer.join(''));
    loadingBubble.classList.remove('italic', 'text-white'); // Hapus style loading

  } catch (e) {
    loadingBubble.innerHTML = '<hr>' + e;
    loadingBubble.classList.remove('semi-bold', 'text-white');
  }

  promptInput.value = '';
};

function addChatBubble(text, sender, isLoading = false) {
  const bubble = document.createElement('div');
  bubble.classList.add('flex', sender === 'user' ? 'justify-end' : 'justify-start');
  
  const bubbleInner = document.createElement('div');
  bubbleInner.classList.add('max-w-xs', 'px-4', 'py-2', 'rounded-lg', 'text-white', 'shadow-md');
  bubbleInner.classList.add(sender === 'user' ? 'bg-blue-500' : 'bg-gray-500');
  
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