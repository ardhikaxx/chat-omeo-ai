import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import MarkdownIt from 'markdown-it';
import './style.css';

let API_KEY = 'AIzaSyBXWODYhZnSv1ggNfE73B6AiVfiMY50loU';

let form = document.querySelector('form');
let promptTextarea = document.querySelector('textarea[name="prompt"]');
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

const responses = [
  "Saya adalah Cerdaskara, asisten edukasi interaktif yang dirancang untuk membantu Anda belajar dan mengeksplorasi berbagai topik. Bagaimana saya bisa membantu Anda hari ini?",
  "Cerdaskara di sini! Saya siap membantu Anda dengan berbagai pertanyaan dan informasi yang Anda butuhkan.",
  "Hai! Nama saya Cerdaskara, dan saya di sini untuk memandu Anda melalui berbagai topik. Ada yang bisa saya bantu?",
  "Selamat datang! Saya Cerdaskara, asisten virtual Anda. Apakah Anda membutuhkan bantuan atau informasi tentang topik tertentu?"
];

form.onsubmit = async (ev) => {
  ev.preventDefault();

  const prompt = promptTextarea.value.trim().toLowerCase();
  addChatBubble(prompt, 'user');
  promptTextarea.value = '';

  if (prompt.includes('siapa kamu') || prompt.includes('kamu siapa') || prompt.includes('siapa cerdaskara')) {
    const responseText = getRandomResponse();
    const responseBubble = addChatBubble('', 'ai', true);
    typeResponse(responseBubble, responseText);
  } else {
    const loadingBubble = addChatBubble('Typing<i class="fa-solid fa-spinner fa-spin-pulse ml-2"></i>', 'ai', true);
    promptTextarea.value = '';

    try {
      const result = await chat.sendMessageStream(prompt);

      let buffer = [];
      let md = new MarkdownIt();

      for await (let response of result.stream) {
        buffer.push(response.text());
      }

      loadingBubble.innerHTML = '';

      // Menampilkan teks secara bertahap (efek typing)
      const fullResponse = buffer.join('');
      typeResponse(loadingBubble, fullResponse, md);

    } catch (e) {
      loadingBubble.innerHTML = '<hr>' + e;
      loadingBubble.classList.remove('normal', 'text-gray-100');
    }
  }
};

function getRandomResponse() {
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

function typeResponse(element, text, md, index = 0) {
  if (index < text.length) {
    element.innerHTML = md ? md.render(text.slice(0, index + 1)) : text.slice(0, index + 1);
    setTimeout(() => typeResponse(element, text, md, index + 1), 25);
  } else {
    element.classList.remove('normal', 'text-gray-100');
  }
}

function addChatBubble(text, sender, isLoading = false) {
  const bubble = document.createElement('div');
  bubble.classList.add('bubble', sender === 'user' ? 'bubble-user' : 'bubble-ai');
  
  const iconContainer = document.createElement('div');
  iconContainer.classList.add('icon-container');

  const bubbleInner = document.createElement('div');
  bubbleInner.classList.add('px-4', 'py-2', 'break-words', 'rounded-lg', 'shadow-md', 'bubble-inner');
  
  if (sender === 'user') {
    bubbleInner.classList.add('bg-blue-500', 'text-white'); 
  } else {
    bubbleInner.classList.add('bg-gray-200', 'text-gray-800');
  }

  if (isLoading) {
    bubbleInner.classList.add('bg-gray-200', 'text-gray-800'); 
  }

  bubbleInner.innerHTML = text;
  
  bubble.appendChild(iconContainer);
  bubble.appendChild(bubbleInner);
  chatOutput.appendChild(bubble);

  chatOutput.scrollTop = chatOutput.scrollHeight;

  return bubbleInner;
}