// ==========================================================================
// SAN TECHNOLOGIES - COMPONENT INJECTOR ENGINE & GLOBAL LOGIC
// ==========================================================================

const CACHE_VERSION = 'v1.0'; // Update this to force clients to download new headers/footers

// --- 1. COMPONENT INJECTOR ---
async function injectComponent(elementId, componentPath) {
    const target = document.getElementById(elementId);
    if (!target) return;

    const cacheKey = `san_comp_${componentPath}_${CACHE_VERSION}`;
    const cachedHTML = localStorage.getItem(cacheKey);

    if (cachedHTML) {
        target.innerHTML = cachedHTML;
        return;
    }

    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
        const html = await response.text();
        target.innerHTML = html;
        localStorage.setItem(cacheKey, html);
    } catch (error) {
        console.error(error);
    }
}

// --- 2. GLOBAL UI UTILITIES (Attached to Window for HTML onclick support) ---
window.topFunction = function() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
};

window.acceptCookies = function() {
    const banner = document.getElementById("cookieBanner");
    if (banner) banner.style.display = "none";
    localStorage.setItem("cookiesAccepted", "true");
};

window.toggleMenu = function() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) mobileMenu.classList.toggle('active');
};


// --- 3. GLOBAL TRANSLATION LOGIC ---
function initGlobalTranslations() {
    if (typeof translations === 'undefined') return;

    const toggles = document.querySelectorAll('.lang-toggle-input');
    
    function updateLanguage(lang) {
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });
        document.querySelectorAll('[data-translate-meta]').forEach(el => {
            const key = el.getAttribute('data-translate-meta');
            if (translations[lang] && translations[lang][key]) {
                el.setAttribute('content', translations[lang][key]);
            }
        });
        document.documentElement.lang = lang;
    }

    const savedLang = localStorage.getItem('selectedLang') || 'de';
    updateLanguage(savedLang);

    toggles.forEach(t => { t.checked = (savedLang === 'en'); });

    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const isChecked = this.checked;
            const newLang = isChecked ? 'en' : 'de';
            toggles.forEach(t => t.checked = isChecked);
            localStorage.setItem('selectedLang', newLang);
            updateLanguage(newLang);
            
            // Sync Bot if it's active
            setTimeout(() => { 
                if(typeof window.updateChatUI === 'function') window.updateChatUI();
                if (!sessionStorage.getItem('san_chat_context')) {
                    sessionStorage.removeItem('san_chat_html');
                    if(typeof window.initChat === 'function') window.initChat();
                }
            }, 100);
        });
    });
}

// --- 4. SAN LAXA AI BOT LOGIC ---
const CHAT_TEXTS = {
    en: {
        prompt: "Ask SAN Laxa",
        typing: "SAN Laxa is typing...",
        placeholder: "Ask a question...",
        disclaimer: "SAN Laxa provides general information and does not replace professional consultation.",
        welcome: "🙏🏽 I’m SAN Laxa, your AI assistant.<br>I can help you with SAN Suite, E-Commerce solutions, or your project enquiry."
    },
    de: {
        prompt: "Frag SAN Laxa",
        typing: "SAN Laxa tippt...",
        placeholder: "Stellen Sie eine Frage...",
        disclaimer: "SAN Laxa stellt allgemeine Informationen bereit und ersetzt keine professionelle Beratung.",
        welcome: "🙏🏽 Ich bin SAN Laxa, Ihr KI-Assistent.<br>Ich helfe Ihnen gerne bei Fragen zur SAN Suite, zu E-Commerce-Lösungen oder zu Ihrem Projekt."
    }
};

window.getLang = function() { return localStorage.getItem('selectedLang') || 'de'; };

window.updateChatUI = function() {
    const lang = window.getLang();
    const t = CHAT_TEXTS[lang];
    if(document.getElementById('prompt-text')) document.getElementById('prompt-text').textContent = t.prompt;
    if(document.getElementById('typing-indicator')) document.getElementById('typing-indicator').textContent = t.typing;
    if(document.getElementById('chat-input')) document.getElementById('chat-input').placeholder = t.placeholder;
    if(document.getElementById('disclaimer-text')) document.getElementById('disclaimer-text').textContent = t.disclaimer;
};

window.getContext = function() { return sessionStorage.getItem('san_chat_context') || ""; };
window.addToContext = function(role, text) { sessionStorage.setItem('san_chat_context', window.getContext() + `${role}: ${text}\n`); };

window.initChat = function() {
    window.updateChatUI();
    const savedHTML = sessionStorage.getItem('san_chat_html');
    const msgBox = document.getElementById('messages');
    if (!msgBox) return; // Prevent errors if bot component isn't loaded
    
    if (savedHTML && savedHTML.trim() !== "") {
        msgBox.innerHTML = savedHTML;
        msgBox.scrollTop = msgBox.scrollHeight;
    } else {
        const lang = window.getLang();
        msgBox.innerHTML = `<div class="msg bot">${CHAT_TEXTS[lang].welcome}</div>`;
    }
};

window.toggleChat = function() {
    const win = document.getElementById('chat-window');
    const prompt = document.getElementById('chat-prompt');
    if (!win || !prompt) return;

    if (win.style.display === 'flex') { 
        win.style.display = 'none'; 
        prompt.style.display = 'flex'; 
    } else { 
        win.style.display = 'flex'; 
        prompt.style.display = 'none'; 
        document.getElementById('chat-input').focus(); 
        const mb = document.getElementById('messages'); 
        mb.scrollTop = mb.scrollHeight; 
    }
};

window.closeAndResetChat = function() {
    document.getElementById('chat-window').style.display = 'none'; 
    document.getElementById('chat-prompt').style.display = 'flex';
    sessionStorage.removeItem('san_chat_html');
    sessionStorage.removeItem('san_chat_context');
    const lang = window.getLang();
    document.getElementById('messages').innerHTML = `<div class="msg bot">${CHAT_TEXTS[lang].welcome}</div>`;
};

window.handleEnter = function(e) { if (e.key === 'Enter') window.sendMessage(); };

window.appendMsg = function(sender, text, isHtml) {
    const box = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = `msg ${sender}`;
    if (isHtml) div.innerHTML = text; else div.textContent = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    sessionStorage.setItem('san_chat_html', box.innerHTML);
};

window.sendMessage = async function() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    window.appendMsg('user', text, false);
    window.addToContext('User', text);
    input.value = '';
    document.getElementById('typing-indicator').style.display = 'block';

    try {
        const res = await fetch('/api/chat', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, history: window.getContext() })
        });
        const data = await res.json();
        
        document.getElementById('typing-indicator').style.display = 'none';
        
        if (!res.ok) {
            window.appendMsg('bot', `⚠️ ${data.reply}`, false);
        } else {
            window.appendMsg('bot', data.reply, true);
            window.addToContext('AI', data.reply);
        }
    } catch (err) {
        document.getElementById('typing-indicator').style.display = 'none';
        window.appendMsg('bot', "Offline Mode.", false);
    }
};

// --- 5. PAGE LOAD COMMANDER ---
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inject the HTML Components
    await injectComponent('san-header', 'components/header.html');
    await injectComponent('san-mobile-menu', 'components/mobile-menu.html');
    await injectComponent('san-footer', 'components/footer.html');
    await injectComponent('san-bot', 'components/bot.html');

    // 2. Wire up the Hamburger Button
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', window.toggleMenu);
    }

    // 3. Check Cookie Status
    if (localStorage.getItem("cookiesAccepted") === "true") {
        const banner = document.getElementById("cookieBanner");
        if(banner) banner.style.display = "none";
    }

    // 4. Initialize Translations & Bot
    initGlobalTranslations();
    window.initChat();

    // 5. Bot Load Animation (Wait 3 seconds)
    setTimeout(() => {
        const widget = document.getElementById('chat-widget');
        if (widget) {
            widget.style.opacity = '1';
            widget.style.pointerEvents = 'auto'; 
        }
    }, 3000);
});