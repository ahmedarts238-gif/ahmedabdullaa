(function() {
'use strict';

const $ = id => document.getElementById(id);
let btn, win, msgs, inputEl, sendBtn, closeBtn, suggestionsEl;

function getSiteLang() {
    return document.documentElement.lang === 'ar' ? 'ar' : 'en';
}

const KNOWLEDGE = `You are an AI assistant for Ahmed Abdullah's portfolio website. Answer ONLY about Ahmed Abdullah. Be friendly and concise (2-4 sentences).

معلومات عن أحمد عبدالله:
- الاسم: أحمد عبدالله
- اللقب: مصمم جرافيك ومصمم استراتيجيات بصرية للسوشيال ميديا
- الإيميل: ahmedarts238@gmail.com
- واتساب: +201024807590
- إنستغرام: https://www.instagram.com/ahmed_artist1
- لينكدإن: https://www.linkedin.com/in/ahmed-artist1
- الخبرة: حوالي سنتين
- فلسفة العمل: "فلسفة الواقعية" + UGC Thinking

المهارات: Adobe Photoshop, Illustrator, photo manipulation, social media strategy, brand identity, typography

الخبرات: Brand Scape Agency (6 months), Aroos El Sham Restaurant (freelance), El Haram El Thaleth Shipping (freelance)

الخدمات: Social media design, visual campaign strategy, brand identity, photo manipulation

المشاريع: Zootopia Guide, Notion templates, Growth Marketing Agency, Fawry, Raising Cane's, Yanfaa, Shaolin Academy, LeBron James, IWC Schaffhausen

When showing contact info: write email as plain text, write whatsapp number as plain text, write instagram as plain text, write linkedin as plain text. Do NOT use hyperlinks or markdown links.

IMPORTANT CONTACT RULES:
When the user asks about contact info, YOU MUST list ALL of these exactly as written:
- Email: ahmedarts238@gmail.com
- WhatsApp: +201024807590
- Instagram: https://www.instagram.com/ahmed_artist1
- LinkedIn: https://www.linkedin.com/in/ahmed-artist1

Write them as plain text, NOT as links/hyperlinks. Do NOT skip any. Do NOT add extra dots.

ALWAYS include the actual email and phone numbers in your reply. Never say just "via email or WhatsApp" without writing them.

CRITICAL: Do not invent information. Use only the data above.`;

const STRINGS = {
    ar: {
        headerName: 'المساعد الذكي',
        headerStatus: 'متصل',
        inputPlaceholder: 'اكتب رسالتك...',
        welcome: 'مرحباً! أنا المساعد الذكي لأحمد. اسألني عن أعماله، مهاراته، أو كيف تتواصل معه',
        suggestions: [
            'ما الخدمات التي تقدمها؟',
            'كم خبرتك في التصميم؟',
            'كيف أتواصل معك؟',
            'أخبرني عن مشاريعك',
            'ما فلسفتك في التصميم؟',
            'ما أدواتك في التصميم؟',
        ],
        error: 'عذراً، حدث خطأ',
        sending: 'جارٍ الإرسال...',
    },
    en: {
        headerName: 'AI Assistant',
        headerStatus: 'Online',
        inputPlaceholder: 'Type your message...',
        welcome: 'Hi there! I\'m Ahmed\'s AI assistant. Ask me about his work, skills, experience, or how to get in touch',
        suggestions: [
            'What services do you offer?',
            'How much experience do you have?',
            'How can I contact you?',
            'Tell me about your projects',
            'What is your design philosophy?',
            'What tools do you use?',
        ],
        error: 'Sorry, something went wrong',
        sending: 'Sending...',
    },
};

let isOpen = false;
let isLoading = false;

function injectStyles() {
    const css = `
html, body { overflow-x: hidden; max-width: 100vw; }

#aa-chat-btn {
    position: fixed; bottom: 28px; right: 28px;
    z-index: 999999; width: 56px; height: 56px;
    border-radius: 50%; border: none;
    background: linear-gradient(135deg, #C9A96E, #E8D5A3);
    color: #0a0a0f; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 32px rgba(201, 169, 110, 0.25);
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, opacity 0.3s;
}
#aa-chat-btn:hover { transform: scale(1.08); box-shadow: 0 12px 48px rgba(201, 169, 110, 0.4); }
#aa-chat-btn:active { transform: scale(0.93); }
#aa-chat-btn.open { opacity: 0; pointer-events: none; }
#aa-chat-btn svg { width: 24px; height: 24px; }

#aa-chat-btn-label {
    position: fixed; bottom: 44px; right: 96px;
    z-index: 999998;
    background: #12121a; border: 1px solid rgba(255,255,255,0.06);
    padding: 7px 14px; border-radius: 10px;
    font-size: 0.75rem; font-weight: 500;
    color: rgba(245,240,232,0.55);
    font-family: 'Inter', -apple-system, sans-serif;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    opacity: 0; transform: translateX(10px) scale(0.9);
    transition: opacity 0.3s ease, transform 0.3s ease;
    pointer-events: none; white-space: nowrap;
}
#aa-chat-btn-label.show { opacity: 1; transform: translateX(0) scale(1); }

#aa-chat-window {
    position: fixed; bottom: 100px; right: 28px;
    z-index: 999998; width: 380px;
    height: 560px;
    background: #12121a;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.5);
    display: flex; flex-direction: column;
    transform: scale(0.9) translateY(20px);
    opacity: 0; visibility: hidden;
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease, visibility 0s 0.35s;
    transform-origin: bottom right;
    overflow: hidden;
    font-family: 'Inter', -apple-system, sans-serif;
}
#aa-chat-window.open {
    transform: scale(1) translateY(0);
    opacity: 1; visibility: visible;
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease, visibility 0s 0s;
}

.aa-header {
    display: flex; align-items: center; gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0;
}
.aa-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #C9A96E, #E8D5A3);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; font-weight: 700; color: #0a0a0f;
    flex-shrink: 0; letter-spacing: 0.5px;
}
.aa-header-info { flex: 1; min-width: 0; }
.aa-header-name { font-weight: 600; font-size: 0.9rem; color: #F5F0E8; }
.aa-header-row {
    display: flex; align-items: center; gap: 6px; margin-top: 2px;
}
.aa-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #22c55e; display: inline-block;
}
.aa-header-status { font-size: 0.72rem; color: rgba(245,240,232,0.4); }
.aa-header-close {
    background: none; border: none; color: rgba(245,240,232,0.25);
    cursor: pointer; padding: 6px; border-radius: 6px;
    transition: all 0.2s ease; display: flex;
}
.aa-header-close:hover { background: rgba(255,255,255,0.04); color: #F5F0E8; }
.aa-header-close svg { width: 18px; height: 18px; }

.aa-messages {
    flex: 1; overflow-y: auto;
    padding: 20px 20px 12px;
    display: flex; flex-direction: column;
    gap: 10px; scroll-behavior: smooth;
}
.aa-messages::-webkit-scrollbar { width: 3px; }
.aa-messages::-webkit-scrollbar-track { background: transparent; }
.aa-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 2px; }

.aa-msg {
    max-width: 85%; padding: 10px 16px;
    border-radius: 14px; font-size: 0.85rem;
    line-height: 1.55; animation: aaMsgIn 0.3s ease both;
    word-break: break-word;
}
@keyframes aaMsgIn {
    from { opacity: 0; transform: translateY(6px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
.aa-msg.bot {
    align-self: flex-start;
    background: #1a1a26;
    color: rgba(245,240,232,0.75);
    border-bottom-left-radius: 4px;
}
.aa-msg.user {
    align-self: flex-end;
    background: linear-gradient(135deg, #C9A96E, #E8D5A3);
    color: #0a0a0f;
    font-weight: 500;
    border-bottom-right-radius: 4px;
}
.aa-msg.error {
    align-self: flex-start;
    background: rgba(239,68,68,0.1);
    color: #fca5a5;
    border: 1px solid rgba(239,68,68,0.12);
    font-size: 0.8rem;
}
.aa-msg a { color: #C9A96E; text-decoration: underline; }
.aa-msg a:hover { color: #E8D5A3; }
.aa-msg strong { font-weight: 600; color: #F5F0E8; }

.aa-typing {
    display: flex; align-items: center; gap: 5px; padding: 2px 0;
}
.aa-typing span {
    width: 7px; height: 7px; border-radius: 50%;
    background: rgba(245,240,232,0.3);
    animation: aaTyp 1.4s ease-in-out infinite;
}
.aa-typing span:nth-child(2) { animation-delay: 0.2s; }
.aa-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes aaTyp { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }

.aa-suggestions {
    display: flex; flex-wrap: wrap; gap: 6px;
    padding: 4px 20px 8px; flex-shrink: 0;
}
.aa-suggestions.hidden { display: none; }
.aa-chip {
    padding: 6px 12px; border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.05);
    background: rgba(255,255,255,0.02);
    color: rgba(245,240,232,0.4);
    font-size: 0.75rem; font-family: 'Inter', -apple-system, sans-serif;
    cursor: pointer; transition: all 0.2s ease; white-space: nowrap;
    line-height: 1.3;
}
.aa-chip:hover {
    background: rgba(201, 169, 110, 0.08);
    border-color: rgba(201, 169, 110, 0.25);
    color: #C9A96E;
}

.aa-input-wrap {
    padding: 10px 16px 14px;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex; gap: 8px; flex-shrink: 0;
    background: #12121a;
}
.aa-input {
    flex: 1; padding: 10px 14px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.06);
    background: #1a1a26; color: #F5F0E8;
    font-size: 0.85rem; font-family: 'Inter', -apple-system, sans-serif;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.aa-input::placeholder { color: rgba(245,240,232,0.25); }
.aa-input:focus { border-color: rgba(201, 169, 110, 0.3); box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.06); }
.aa-send {
    width: 42px; height: 42px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #C9A96E, #E8D5A3);
    color: #0a0a0f; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s, opacity 0.25s;
}
.aa-send:hover { transform: scale(1.06); box-shadow: 0 4px 16px rgba(201, 169, 110, 0.25); }
.aa-send:active { transform: scale(0.93); }
.aa-send svg { width: 18px; height: 18px; }
.aa-send:disabled { opacity: 0.35; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

@media (max-width: 600px) {
    #aa-chat-window {
        right: 12px; left: 12px;
        width: auto; bottom: 84px;
        height: calc(100vh - 120px);
        max-height: none;
    }
    #aa-chat-btn { bottom: 18px; right: 18px; width: 52px; height: 52px; }
    #aa-chat-btn svg { width: 22px; height: 22px; }
    #aa-chat-btn-label { right: 80px; bottom: 36px; font-size: 0.68rem; padding: 5px 10px; }
    .aa-header { padding: 14px 16px; }
    .aa-messages { padding: 16px 16px 8px; }
    .aa-input-wrap { padding: 8px 16px 12px; }
    .aa-suggestions { padding: 4px 16px 6px; }
}`;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

function injectHTML() {
    const div = document.createElement('div');
    div.innerHTML = `
<span id="aa-chat-btn-label" class="show">Chat with AI</span>
<button id="aa-chat-btn" aria-label="Toggle chat">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
</button>
<div id="aa-chat-window">
    <div class="aa-header">
        <div class="aa-avatar">AI</div>
        <div class="aa-header-info">
            <div class="aa-header-name">AI Assistant</div>
            <div class="aa-header-row">
                <span class="aa-dot"></span>
                <span class="aa-header-status">Online</span>
            </div>
        </div>
        <button class="aa-header-close" id="aa-close" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    </div>
    <div class="aa-messages" id="aa-msgs"></div>
    <div class="aa-suggestions hidden" id="aa-suggestions"></div>
    <div class="aa-input-wrap">
        <input class="aa-input" id="aa-input" type="text" placeholder="Type your message..." autocomplete="off">
        <button class="aa-send" id="aa-send" aria-label="Send">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
        </button>
    </div>
</div>`;
    document.body.appendChild(div);
}

/* ============================================================
   MARKDOWN RENDER
   ============================================================ */
function renderMarkdown(text) {
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[(.+?)\]\((.+?)\)/g, (m, t, u) => {
            if (/^(javascript|data|vbscript|file|ftp):/i.test(u)) return t;
            if (/[^a-z0-9:/\-._~%?#@!$&'()*+,;=]/i.test(u)) return t;
            return '<a href="' + u.replace(/"/g, '&quot;') + '" target="_blank" rel="noopener noreferrer">' + t + '</a>';
        })
        .replace(/\n/g, '<br>');
    return html;
}

function addMsg(text, role) {
    const el = document.createElement('div');
    el.className = 'aa-msg ' + role;
    if (role === 'bot') {
        el.innerHTML = renderMarkdown(text);
    } else {
        el.textContent = text;
    }
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
    const el = document.createElement('div');
    el.className = 'aa-msg bot';
    el.id = 'aa-typing';
    el.innerHTML = '<div class="aa-typing"><span></span><span></span><span></span></div>';
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping() {
    const el = document.getElementById('aa-typing');
    if (el) el.remove();
}

function showSuggestions() {
    const s = STRINGS[lang];
    suggestionsEl.classList.remove('hidden');
    suggestionsEl.innerHTML = '';
    s.suggestions.forEach(q => {
        const chip = document.createElement('span');
        chip.className = 'aa-chip';
        chip.textContent = q;
        chip.addEventListener('click', () => {
            inputEl.value = q;
            sendMessage();
        });
        suggestionsEl.appendChild(chip);
    });
}

function hideSuggestions() {
    suggestionsEl.classList.add('hidden');
}

function setLoading(state) {
    isLoading = state;
    sendBtn.disabled = state;
    inputEl.disabled = state;
}

function onReady() {
    btn = $('aa-chat-btn');
    win = $('aa-chat-window');
    msgs = $('aa-msgs');
    inputEl = $('aa-input');
    sendBtn = $('aa-send');
    closeBtn = $('aa-close');
    suggestionsEl = $('aa-suggestions');

    btn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', closeChat);
    sendBtn.addEventListener('click', sendMessage);
    inputEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });

    function toggleChat() {
        if (isOpen) closeChat();
        else openChat();
    }
}

function applyLang() {
    lang = getSiteLang();
    const s = STRINGS[lang];
    win.querySelector('.aa-header-name').textContent = s.headerName;
    win.querySelector('.aa-header-status').textContent = s.headerStatus;
    inputEl.placeholder = s.inputPlaceholder;
}

function openChat() {
    applyLang();
    const label = $('aa-chat-btn-label');
    if (label) label.classList.remove('show');
    isOpen = true;
    win.classList.add('open');
    inputEl.focus();
    if (msgs.children.length === 0) {
        addMsg(STRINGS[lang].welcome, 'bot');
        showSuggestions();
    }
}

function closeChat() {
    const label = $('aa-chat-btn-label');
    if (label) label.classList.add('show');
    isOpen = false;
    win.classList.remove('open');
}

async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isLoading) return;
    inputEl.value = '';
    hideSuggestions();
    addMsg(text, 'user');
    setLoading(true);
    showTyping();
    try {
        const reply = await callAPI(text);
        removeTyping();
        addMsg(reply, 'bot');
    } catch (err) {
        removeTyping();
        const s = STRINGS[lang];
        let errMsg = s.error + ' ';
        if (err.message.includes('401') || err.message.includes('403')) {
            errMsg += lang === 'ar' ? 'مشكلة في مفتاح API' : 'API key issue';
        } else if (err.message.includes('429')) {
            errMsg += lang === 'ar' ? 'الموديل مشغول حالياً' : 'Model is busy';
        } else if (err.message.includes('402')) {
            errMsg += lang === 'ar' ? 'حساب OpenRouter يحتاج إلى بطاقة دفع' : 'OpenRouter needs a payment method';
        } else {
            errMsg += err.message || (lang === 'ar' ? 'حاول مرة أخرى' : 'Try again');
        }
        addMsg(errMsg, 'error');
    } finally {
        setLoading(false);
        inputEl.focus();
    }
}

async function callAPI(userMsg) {
    const sysMsg = lang === 'ar'
        ? KNOWLEDGE
        : KNOWLEDGE + '\n\nIMPORTANT: Respond only in English. When asked about contact, list ALL details: email ahmedarts238@gmail.com, WhatsApp +201024807590, Instagram https://www.instagram.com/ahmed_artist1, LinkedIn https://www.linkedin.com/in/ahmed-artist1. Write as plain text.';

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + atob('c2stb3ItdjEtNjZlYmRhYWQ1YzE2MTM0MjlmNThjZTFhMDViYmNjNWQ4YzBhN2MwNGNjMzkwNzdiOTBkYTcwZDFhMGFiZjJmOA=='),
            'HTTP-Referer': 'https://ahmedabdullah.com',
            'X-Title': 'Ahmed Abdullah Portfolio',
        },
        body: JSON.stringify({
            model: 'openrouter/free',
            messages: [
                { role: 'system', content: sysMsg },
                { role: 'user', content: userMsg },
            ],
            temperature: 0.7,
            max_tokens: 500,
        }),
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => '');
        let errMsg = 'HTTP ' + res.status;
        try {
            const errData = JSON.parse(errText);
            errMsg = errData.error?.message || errData.error || errMsg;
        } catch (_) {
            if (errText) errMsg = errText.slice(0, 200);
        }
        throw new Error(errMsg);
    }

    const data = await res.json();
    if (!data.choices?.[0]?.message?.content) {
        throw new Error('Empty response');
    }
    return data.choices[0].message.content.trim();
}

function animateLabel() {
    const label = document.getElementById('aa-chat-btn-label');
    if (!label) return;
    const texts = ['Chat with AI', 'Ask me anything', 'Need help?', 'تواصل مع المساعد'];
    let idx = 1;
    setInterval(() => {
        if (!isOpen) {
            idx = (idx + 1) % texts.length;
            label.textContent = texts[idx];
            label.classList.remove('show');
            void label.offsetWidth;
            label.classList.add('show');
        }
    }, 4000);
}

let lang = 'en';

injectStyles();
injectHTML();

function boot() {
    onReady();
    animateLabel();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}

})();
