import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import MarkdownIt from 'markdown-it';
import './style.css';

let API_KEY = 'AIzaSyC_dQ5KNGDeZFTsZjJL-ZUOYPFR_NVQ39E';

let form = document.querySelector('form');
let promptTextarea = document.querySelector('textarea[name="prompt"]');
let chatOutput = document.querySelector('#chat-output');
let botImage = document.querySelector('#bot-ai');

let imageInterval;

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
  "Saya adalah Omeo, asisten edukasi interaktif yang dirancang untuk membantu Anda belajar dan mengeksplorasi berbagai topik. Bagaimana saya bisa membantu Anda hari ini?",
  "Omeo di sini! Saya siap membantu Anda dengan berbagai pertanyaan dan informasi yang Anda butuhkan.",
  "Hai! Nama saya Omeo, dan saya di sini untuk memandu Anda melalui berbagai topik. Ada yang bisa saya bantu?",
  "Selamat datang! Saya Omeo, asisten virtual Anda. Apakah Anda membutuhkan bantuan atau informasi tentang topik tertentu?"
];

form.onsubmit = async (ev) => {
  ev.preventDefault();

  const prompt = promptTextarea.value.trim().toLowerCase();
  addChatBubble(prompt, 'user');
  promptTextarea.value = '';

  if (
    prompt.includes('siapa yang membuat kamu') || 
    prompt.includes('siapa yang menciptakan kamu') || 
    prompt.includes('siapa yang mengembangkan kamu') || 
    prompt.includes('siapa developer kamu')
  ) {
    const responseText = `Saya dibuat dan dilatih oleh Yanuar Ardhika Rahmadhani Ubaidillah. Untuk lebih mengenal, Anda dapat mengunjungi website portofolionya di: <a href="https://yanuar-ardhika.vercel.app/" target="_blank" class="text-blue-500 underline">https://yanuar-ardhika.vercel.app/</a>.`;
    const responseBubble = addChatBubble('', 'ai', true);
    toggleBotImage(true);
    typeResponse(responseBubble, responseText, null, 0, () => toggleBotImage(false));
  } else if (prompt.includes('siapa kamu') || prompt.includes('kamu siapa') || prompt.includes('siapa omeo')) {
    const responseText = getRandomResponse();
    const responseBubble = addChatBubble('', 'ai', true);
    toggleBotImage(true);
    typeResponse(responseBubble, responseText, null, 0, () => toggleBotImage(false));
  } else {
    const loadingBubble = addChatBubble('Typing<i class="fa-solid fa-spinner fa-spin-pulse ml-2"></i>', 'ai', true);
    toggleBotImage(true);

    try {
      const result = await chat.sendMessageStream(prompt);

      let buffer = [];
      let md = new MarkdownIt();

      for await (let response of result.stream) {
        buffer.push(response.text());
      }

      loadingBubble.innerHTML = '';

      const fullResponse = buffer.join('');
      typeResponse(loadingBubble, fullResponse, md, 0, () => toggleBotImage(false)); // Kembali ke gambar awal

    } catch (e) {
      loadingBubble.innerHTML = '<hr>' + e;
      loadingBubble.classList.remove('normal', 'text-gray-100');
      toggleBotImage(false);
    }
  }
};

function getRandomResponse() {
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

function typeResponse(element, text, md, index = 0, callback) {
  if (index < text.length) {
    element.innerHTML = md ? md.render(text.slice(0, index + 1)) : text.slice(0, index + 1);
    setTimeout(() => typeResponse(element, text, md, index + 1, callback), 25);
  } else {
    element.classList.remove('normal', 'text-gray-100');
    if (callback) callback();
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
    bubbleInner.classList.add('bg-white', 'text-gray-800');
  }

  if (isLoading) {
    bubbleInner.classList.add('bg-white', 'text-gray-800'); 
  }

  bubbleInner.innerHTML = text;
  
  bubble.appendChild(iconContainer);
  bubble.appendChild(bubbleInner);
  chatOutput.appendChild(bubble);

  chatOutput.scrollTop = chatOutput.scrollHeight;

  return bubbleInner;
}

function toggleBotImage(isTyping) {
  if (isTyping) {
    imageInterval = setInterval(() => {
      const randomImage = Math.floor(Math.random() * 5) + 1;
      botImage.src = `/${randomImage}.png`;
    }, 500);
  } else {
    clearInterval(imageInterval);
    botImage.src = '/1.png';
  }
}