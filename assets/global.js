// ==========================================================================
// SAN TECHNOLOGIES - COMPONENT INJECTOR ENGINE & GLOBAL LOGIC
// ==========================================================================

const CACHE_VERSION = 'v1.3';

// Auto-detect India domain (sanstechno.in) vs Germany domain (santechnologies.de)
const IS_INDIA = window.location.hostname.includes('sanstechno.in') || window.location.pathname.startsWith('/in/');
const DEFAULT_LANG = IS_INDIA ? 'en' : 'de';
const ALT_LANG = IS_INDIA ? 'ta' : 'en';

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
        'footer_country': 'Germany & India',
        'footer_header_contact': 'Contact & Founder',
        'footer_rep_by': 'Represented by:',
        'footer_disclaimer': 'Disclaimer: Despite careful content control, we assume no liability for the content of external links.',
        'footer_rights': 'All rights reserved.',
        'footer_privacy': 'Privacy Policy',
        'footer_impressum': 'Legal Notice',
        'cookie_text': 'We use cookies to improve your experience.',
        'cookie_btn': 'Accept'
    },
    'ta': {
        'nav_work': 'படைப்புகள்',
        'nav_products': 'தீர்வுகள்',
        'nav_services': 'சேவைகள்',
        'nav_about': 'குழு',
        'nav_back': 'முகப்புக்குத் திரும்பு',
        'nav_contact': 'தொடர்பு கொள்ள',
        'footer_header_san': 'SAN Technologies',
        'footer_country': 'ஜெர்மனி & இந்தியா',
        'footer_header_contact': 'தொடர்பு & நிறுவனர்',
        'footer_rep_by': 'நிறுவனர்:',
        'footer_disclaimer': 'பொறுப்புத் துறப்பு: வெளிப்புற இணையதள இணைப்புகளின் உள்ளடக்கத்திற்கு நாங்கள் பொறுப்பேற்க மாட்டோம்.',
        'footer_rights': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
        'footer_privacy': 'தனியுரிமைக் கொள்கை',
        'footer_impressum': 'சட்ட அறிவிப்பு',
        'cookie_text': 'உங்கள் அனுபவத்தை மேம்படுத்த நாங்கள் குக்கீகளைப் பயன்படுத்துகிறோம்.',
        'cookie_btn': 'ஏற்கவும்'
    }
};

// --- 2. COMPONENT INJECTOR ---
async function injectComponent(elementId, componentPath) {
    const target = document.getElementById(elementId);
    if (!target) return;

    const cacheKey = `san_comp_${IS_INDIA ? 'in' : 'de'}_${componentPath}_${CACHE_VERSION}`;
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
window.getLang = function() {
    const saved = localStorage.getItem('selectedLang');
    return [DEFAULT_LANG, ALT_LANG].includes(saved) ? saved : DEFAULT_LANG;
};

window.updateLanguage = function(lang) {
    const fallbackLang = IS_INDIA ? 'en' : 'de';

    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        let text = '';
        
        if (typeof translations !== 'undefined') {
            text = (translations[lang] && translations[lang][key]) 
                || (translations[fallbackLang] && translations[fallbackLang][key]) 
                || '';
        }
        if (!text) {
            text = (GLOBAL_TRANSLATIONS[lang] && GLOBAL_TRANSLATIONS[lang][key]) 
                || (GLOBAL_TRANSLATIONS[fallbackLang] && GLOBAL_TRANSLATIONS[fallbackLang][key]) 
                || '';
        }
        
        if (text) el.innerHTML = text;
    });

    document.querySelectorAll('[data-translate-meta]').forEach(el => {
        const key = el.getAttribute('data-translate-meta');
        let text = '';
        if (typeof translations !== 'undefined') {
            text = (translations[lang] && translations[lang][key]) 
                || (translations[fallbackLang] && translations[fallbackLang][key]) 
                || '';
        }
        if (text) el.setAttribute('content', text);
    });

    document.documentElement.lang = lang;

    document.querySelectorAll('.lang-toggle-input').forEach(t => {
        t.checked = (lang === ALT_LANG);
    });
};

document.addEventListener('change', function(e) {
    if (e.target && e.target.classList.contains('lang-toggle-input')) {
        const newLang = e.target.checked ? ALT_LANG : DEFAULT_LANG;
        localStorage.setItem('selectedLang', newLang);
        window.updateLanguage(newLang);
        
        setTimeout(() => { 
            if (typeof window.updateChatUI === 'function') window.updateChatUI();
            if (!localStorage.getItem('san_chat_context')) {
                localStorage.removeItem('san_chat_html');
                if (typeof window.initChat === 'function') window.initChat();
            }
        }, 100);
    }
});

// --- 5. SAN LAXA AI BOT LOGIC ---
const CHAT_TEXTS = {
    en: { prompt: "Ask SAN Laxa", typing: "SAN Laxa is typing...", placeholder: "Ask a question...", disclaimer: "SAN Laxa provides general information and does not replace professional consultation.", welcome: "🙏🏽 I’m SAN Laxa, your AI assistant.<br>I can help you with SAN Suite, E-Commerce solutions, or your project enquiry." },
    de: { prompt: "Frag SAN Laxa", typing: "SAN Laxa tippt...", placeholder: "Stellen Sie eine Frage...", disclaimer: "SAN Laxa stellt allgemeine Informationen bereit und ersetzt keine professionelle Beratung.", welcome: "🙏🏽 Ich bin SAN Laxa, Ihr KI-Assistent.<br>Ich helfe Ihnen gerne bei Fragen zur SAN Suite, zu E-Commerce-Lösungen oder zu Ihrem Projekt." },
    ta: { prompt: "SAN Laxa-விடம் கேளுங்கள்", typing: "SAN Laxa தட்டச்சு செய்கிறது...", placeholder: "உங்கள் கேள்வியைக் கேளுங்கள்...", disclaimer: "SAN Laxa பொதுவான தகவல்களை மட்டுமே வழங்குகிறது.", welcome: "🙏🏽 வணக்கம்! நான் SAN Laxa, உங்கள் AI உதவியாளர்.<br>SAN Suite (உணவக மென்பொருள்), E-Commerce அல்லது உங்கள் புதிய திட்டம் குறித்து கேளுங்கள்." }
};

window.updateChatUI = function() {
    const lang = window.getLang();
    const t = CHAT_TEXTS[lang] || CHAT_TEXTS.en;
    if (document.getElementById('prompt-text')) document.getElementById('prompt-text').textContent = t.prompt;
    if (document.getElementById('typing-indicator')) document.getElementById('typing-indicator').textContent = t.typing;
    if (document.getElementById('chat-input')) document.getElementById('chat-input').placeholder = t.placeholder;
    if (document.getElementById('disclaimer-text')) document.getElementById('disclaimer-text').textContent = t.disclaimer;
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
        const t = CHAT_TEXTS[lang] || CHAT_TEXTS.en;
        msgBox.innerHTML = `<div class="msg bot">${t.welcome}</div>`; 
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
    const t = CHAT_TEXTS[lang] || CHAT_TEXTS.en;
    document.getElementById('messages').innerHTML = `<div class="msg bot">${t.welcome}</div>`;
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
    await injectComponent('san-header', 'components/header.html');
    await injectComponent('san-mobile-menu', 'components/mobile-menu.html');
    await injectComponent('san-footer', 'components/footer.html');
    await injectComponent('san-bot', 'components/bot.html');

    const hamburgerBtn = document.getElementById('hamburgerBtn');
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', window.toggleMenu);

    if (localStorage.getItem("cookiesAccepted") === "true") {
        const banner = document.getElementById("cookieBanner");
        if (banner) banner.style.display = "none";
    }

    const savedLang = window.getLang();
    window.updateLanguage(savedLang);

    window.initChat();
    setTimeout(() => {
        const widget = document.getElementById('chat-widget');
        if (widget) { widget.style.opacity = '1'; widget.style.pointerEvents = 'auto'; }
    }, 3000);
});
