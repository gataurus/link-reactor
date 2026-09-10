var currentLang = 'en';
var REACTOR_API_URL = 'https://bitcoins-mining.net/link-reactor-api';

function detectLang() {
    var saved = localStorage.getItem('reactor_lang');
    if (saved && FORGE_TRANSLATIONS[saved]) return saved;
    
    var browserLang = (navigator.language || navigator.userLanguage || 'en').substring(0, 2);
    var supported = { en: 'en', ru: 'ru', de: 'de', fr: 'fr', es: 'es', it: 'it', zh: 'zh', ja: 'ja', pt: 'pt', ko: 'ko' };
    
    return supported[browserLang] || 'en';
}

function applyTranslations(lang) {
    var t = FORGE_TRANSLATIONS[lang] || FORGE_TRANSLATIONS['en'];
    currentLang = lang;
    localStorage.setItem('reactor_lang', lang);
    document.documentElement.lang = lang;
    
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        if (t[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.type === 'submit' || el.type === 'button') {
                    el.value = t[key];
                } else {
                    el.placeholder = t[key];
                }
            } else {
                el.textContent = t[key];
            }
        }
    });
    
    document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
        var key = el.getAttribute('data-i18n-html');
        if (t[key]) {
            el.innerHTML = t[key];
        }
    });
}

function changeLang(lang) {
    var sel = document.getElementById('lang-select');
    if (sel) sel.value = lang;
    applyTranslations(lang);
}

/* ================================================================
   PAYMENT
   ================================================================ */

var selectedPlan = 'lifetime';

function buy(plan) {
    selectedPlan = 'lifetime';
    var t = FORGE_TRANSLATIONS[currentLang] || FORGE_TRANSLATIONS['en'];
    var planName = t.plan_name || 'Lifetime PRO';
    var currency = t.price_currency || '$';
    var amount = t.price_lifetime || '49';
    
    var planEl = document.getElementById('modal-plan-name');
    var priceEl = document.getElementById('modal-price');
    if (planEl) planEl.textContent = planName;
    if (priceEl) priceEl.textContent = currency + amount + ' — Link Reactor PRO';
    
    var modal = document.getElementById('payment-modal');
    if (modal) modal.classList.add('open');
    var emailInput = document.getElementById('email');
    if (emailInput) emailInput.focus();
}

function closeModal() {
    var modal = document.getElementById('payment-modal');
    if (modal) modal.classList.remove('open');
}

async function submitPayment(e) {
    e.preventDefault();
    var emailInput = document.getElementById('email');
    var email = emailInput ? emailInput.value : '';
    var btn = e.target.querySelector('button');
    var originalText = btn.textContent;
    if (!email) return;
    
    btn.textContent = 'Processing...';
    btn.disabled = true;
    
    try {
        var apiUrl = REACTOR_API_URL + '/create-payment.php';
        
        var response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, plan: 'lifetime' })
        });
        
        var data = await response.json();
        
        if (data.success && data.payment_url) {
            window.location.href = data.payment_url;
        } else {
            alert('Payment error: ' + (data.message || 'Unknown error'));
            btn.textContent = originalText;
            btn.disabled = false;
        }
    } catch (err) {
        console.error('Payment error:', err);
        alert('Network error. Please try again later.');
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

/* ================================================================
   INIT
   ================================================================ */

document.addEventListener('DOMContentLoaded', function() {
    var modal = document.getElementById('payment-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });
    
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var href = this.getAttribute('href');
            if (href === '#') return;
            var target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    var lang = detectLang();
    var langSelect = document.getElementById('lang-select');
    if (langSelect) langSelect.value = lang;
    applyTranslations(lang);
});
