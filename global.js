// ==========================================================================
// SAN TECHNOLOGIES - COMPONENT INJECTOR ENGINE & GLOBAL LOGIC
// ==========================================================================

const CACHE_VERSION = 'v1.1';

const GLOBAL_TRANSLATIONS = {
    'de': {
        'nav_work': 'Referenzen',
        'nav_products': 'Produkte',
        'nav_services': 'Expertise',
        'nav_about': 'Team',
        'nav_back': 'Startseite zurück',
        'nav_contact': 'Zum Kontakt',
        'footer_header_san': 'SAN Technologies',
        'footer_country': 'Deutschland',
        'footer_header_contact': 'Kontakt & Inhaber',
        'footer_rep_by': 'Vertreten durch:',
        'footer_disclaimer': 'Haftungsausschluss: Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links.',
        'footer_rights': 'Alle Rechte vorbehalten.',
        'footer_privacy': 'Datenschutz',
        'footer_impressum': 'Impressum',
        'cookie_text': 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern.',
        'cookie_btn': 'Akzeptieren'
    },
    'en': {
        'nav_work': 'Work',
        'nav_products': 'Solutions',
        'nav_services': 'Expertise',
        'nav_about': 'Team',
        'nav_back': 'Back to Home',
        'nav_contact': 'Contact Us',
        'footer_header_san': 'SAN Technologies',
        'footer_country': 'Germany',
        'footer_header_contact': 'Contact & Owner',
        'footer_rep_by': 'Represented by:',
        'footer_disclaimer': 'Disclaimer: Despite careful content control, we assume no liability for the content of external links.',
        'footer_rights': 'All rights reserved.',
        'footer_privacy': 'Privacy Policy',
        'footer_impressum': 'Legal Notice',
        'cookie_text': 'We use cookies to improve your experience.',
        'cookie_btn': 'Accept'
    }
};

// --- 2. COMPONENT INJECTOR ---
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

// --- 3. GLOBAL UI UTILITIES ---
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


// --- 4. TRANSLATION ENGINE ---
window.updateLanguage = function(lang) {
    // Update Text Elements
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        let text = '';
        
        // Check local page dictionary first, fallback to Global dictionary
        if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
            text = translations[lang][key];
        } else if (GLOBAL_TRANSLATIONS[lang] && GLOBAL_TRANSLATIONS[lang][key]) {
            text = GLOBAL_TRANSLATIONS[lang][key];
        }
        
        if (text) el.innerHTML = text;
    });

    document.querySelectorAll('[data-translate-meta]').forEach(el => {
        const key = el.getAttribute('data-translate-meta');
        let text = '';
        if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
            text = translations[lang][key];
        }
        if (text) el.setAttribute('content', text);
    });

    document.documentElement.lang = lang;

    document.querySelectorAll('.lang-toggle-input').forEach(t => {
        t.checked = (lang === 'en');
    });
};

// Listen for clicks on the language toggle anywhere on the site
document.addEventListener('change', function(e) {
    if (e.target && e.target.classList.contains('lang-toggle-input')) {
        const newLang = e.target.checked ? 'en' : 'de';
        localStorage.setItem('selectedLang', newLang);
        window.updateLanguage(newLang);
        
        // Sync the AI Bot language
        setTimeout(() => { 
            if(typeof window.updateChatUI === 'function') window.updateChatUI();
            if (!localStorage.getItem('san_chat_context')) {
                localStorage.removeItem('san_chat_html');
                if(typeof window.initChat === 'function') window.initChat();
            }
        }, 100);
    }
});


// --- 5. SAN LAXA AI BOT LOGIC ---
const CHAT_TEXTS = {
    en: { prompt: "Ask SAN Laxa", typing: "SAN Laxa is typing...", placeholder: "Ask a question...", disclaimer: "SAN Laxa provides general information and does not replace professional consultation.", welcome: "🙏🏽 I’m SAN Laxa, your AI assistant.<br>I can help you with SAN Suite, E-Commerce solutions, or your project enquiry." },
    de: { prompt: "Frag SAN Laxa", typing: "SAN Laxa tippt...", placeholder: "Stellen Sie eine Frage...", disclaimer: "SAN Laxa stellt allgemeine Informationen bereit und ersetzt keine professionelle Beratung.", welcome: "🙏🏽 Ich bin SAN Laxa, Ihr KI-Assistent.<br>Ich helfe Ihnen gerne bei Fragen zur SAN Suite, zu E-Commerce-Lösungen oder zu Ihrem Projekt." }
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

window.getContext = function() { return localStorage.getItem('san_chat_context') || ""; };
window.addToContext = function(role, text) { localStorage.setItem('san_chat_context', window.getContext() + `${role}: ${text}\n`); };

window.initChat = function() {
    window.updateChatUI();
    
    const savedHTML = localStorage.getItem('san_chat_html');
    const msgBox = document.getElementById('messages');
    if (!msgBox) return; 
    
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
    
    localStorage.removeItem('san_chat_html'); 
    localStorage.removeItem('san_chat_context');
    
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
    
    localStorage.setItem('san_chat_html', box.innerHTML);
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

// --- 6. PAGE LOAD COMMANDER ---
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inject HTML
    await injectComponent('san-header', 'components/header.html');
    await injectComponent('san-mobile-menu', 'components/mobile-menu.html');
    await injectComponent('san-footer', 'components/footer.html');
    await injectComponent('san-bot', 'components/bot.html');

    // 2. Wire UI
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', window.toggleMenu);

    if (localStorage.getItem("cookiesAccepted") === "true") {
        const banner = document.getElementById("cookieBanner");
        if(banner) banner.style.display = "none";
    }

    // 3. Init Translations from Global Script
    const savedLang = localStorage.getItem('selectedLang') || 'de';
    window.updateLanguage(savedLang);

    // 4. Init Bot
    window.initChat();
    setTimeout(() => {
        const widget = document.getElementById('chat-widget');
        if (widget) { widget.style.opacity = '1'; widget.style.pointerEvents = 'auto'; }
    }, 3000);
});
