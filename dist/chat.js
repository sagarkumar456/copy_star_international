/**
 * COPYSTAR International - Human-like Bilingual (English & Nepali) Live AI Chat
 * With direct owner email dispatch via EmailJS to Sandeep Das (Copystarnepal@hotmail.com)
 */
import { sendEnquiry } from './email-config.js';

(function initBilingualChatWidget() {
  if (typeof document === 'undefined') return;

  // Prevent double initialization
  if (document.getElementById('copystar-chat-widget')) return;

  let currentLang = 'en'; // 'en' | 'ne'
  let hasInitialized = false;
  let userProfile = {
    name: '',
    email: '',
    phone: '',
    messageHistory: []
  };

  // UI Strings dictionary for bilingual interface
  const UI = {
    en: {
      teaser: 'Chat with AI & Sandeep Das',
      headerTitle: 'COPYSTAR Support',
      headerSub: 'Active now · Sandeep Das Team',
      langLabel: 'Language / भाषा:',
      inputPlaceholder: 'Ask anything about copiers, parts, repairs in English or नेपाली...',
      sendBtnAria: 'Send message',
      waTooltip: 'Chat directly on WhatsApp',
      closeTooltip: 'Minimize chat',
      cardTitle: 'Send Enquiry to Sandeep Das',
      cardDesc: 'Leave your details below. This will be emailed directly to Sandeep Das via EmailJS for quick assistance.',
      nameLabel: 'Your Name *',
      namePlaceholder: 'e.g. Ramesh Shrestha',
      emailLabel: 'Email Address *',
      emailPlaceholder: 'you@example.com',
      phoneLabel: 'Phone Number (with country code)',
      phonePlaceholder: 'e.g. +977 98XXXXXXXX',
      reqLabel: 'Requirements / Machine Model / Note',
      reqPlaceholder: 'Specify machine model, toner, spare part or repair issue...',
      submitBtn: 'Send to Sandeep Das →',
      sendingBtn: 'Sending email... ⏳',
      retryBtn: 'Retry Sending →',
      footnote: 'Dispatched securely via EmailJS to Copystarnepal@hotmail.com',
      successTitle: '✓ Enquiry Sent to Owner!',
      successDesc: name => `Thank you, <b>${escapeHtml(name)}</b>! Your details and message have been emailed directly to Sandeep Das at <b>Copystarnepal@hotmail.com</b>. We will contact you shortly.`,
      callBtn: '📞 Call Directly (+977 9851122595)',
      waBtn: '💬 Chat on WhatsApp'
    },
    ne: {
      teaser: 'सन्दीप दास तथा AI सँग कुरा गर्नुहोस्',
      headerTitle: 'COPYSTAR सहायता',
      headerSub: 'उपलब्ध छ · सन्दीप दास टिम',
      langLabel: 'Language / भाषा:',
      inputPlaceholder: 'फोटोकपी मेसिन, मर्मत वा टोनरबारे नेपाली वा English मा सोध्नुहोस्...',
      sendBtnAria: 'सन्देश पठाउनुहोस्',
      waTooltip: 'ह्वाट्सएपमा सीधै कुरा गर्नुहोस्',
      closeTooltip: 'च्याट बन्द गर्नुहोस्',
      cardTitle: 'सन्दीप दासलाई सन्देश / विवरण पठाउनुहोस्',
      cardDesc: 'आफ्नो विवरण भर्नुहोस्। यो EmailJS मार्फत सीधै प्रोप्राइटर सन्दीप दासको इमेलमा पठाइनेछ।',
      nameLabel: 'तपाईंको नाम *',
      namePlaceholder: 'जस्तै: रमेश श्रेष्ठ',
      emailLabel: 'इमेल ठेगाना *',
      emailPlaceholder: 'तपाईंको@gmail.com',
      phoneLabel: 'सम्पर्क फोन नम्बर',
      phonePlaceholder: 'जस्तै: +977 98XXXXXXXX',
      reqLabel: 'मेसिनको मोडल वा आवश्यकता',
      reqPlaceholder: 'मेसिनको मोडल, टोनर, पार्टस् वा समस्या खुलाउनुहोस्...',
      submitBtn: 'सन्दीप दासलाई पठाउनुहोस् →',
      sendingBtn: 'इमेल पठाउँदैछ... ⏳',
      retryBtn: 'पुनः प्रयास गर्नुहोस् →',
      footnote: 'EmailJS मार्फत Copystarnepal@hotmail.com मा सुरक्षित रूपमा पठाइन्छ',
      successTitle: '✓ सन्देश सफलतापूर्वक पठाइयो!',
      successDesc: name => `धन्यवाद, <b>${escapeHtml(name)}</b> जी! तपाईंको विवरण र सन्देश सन्दीप दासलाई <b>Copystarnepal@hotmail.com</b> मा पठाइएको छ। हामी तुरुन्तै सम्पर्क गर्नेछौँ।`,
      callBtn: '📞 सीधै फोन गर्नुहोस् (+977 9851122595)',
      waBtn: '💬 ह्वाट्सएपमा कुरा गर्नुहोस्'
    }
  };

  // Helper to escape HTML safely
  function escapeHtml(str) {
    return String(str || '').replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // 1. Build & Inject Widget HTML
  const widgetContainer = document.createElement('div');
  widgetContainer.className = 'chat-widget-container';
  widgetContainer.id = 'copystar-chat-widget';

  widgetContainer.innerHTML = `
    <div class="chat-launcher-wrap">
      <div class="chat-teaser-pill" id="chat-teaser" title="Open Support Chat">
        <span class="teaser-dot"></span>
        <span id="chat-teaser-text">Chat with AI & Sandeep Das</span>
      </div>
      <button class="chat-launcher-btn" id="chat-toggle-btn" type="button" aria-label="Toggle Live Chat" aria-expanded="false">
        <span class="chat-launcher-icon">
          <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/><path d="M7 9h10v2H7zm0-3h10v2H7z"/></svg>
        </span>
        <span class="chat-launcher-close">
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </span>
      </button>
    </div>

    <div class="chat-window" id="chat-window" role="dialog" aria-label="Customer Support Chat">
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-header-avatar">
            <span>🧑‍💼</span>
            <span class="chat-avatar-status"></span>
          </div>
          <div class="chat-header-title">
            <h3 id="chat-header-title">COPYSTAR Support <span class="chat-badge-verified">OFFICIAL</span></h3>
            <p id="chat-header-sub">Active now · Sandeep Das Team</p>
          </div>
        </div>
        <div class="chat-header-actions">
          <a href="https://wa.me/9779851122595" target="_blank" rel="noopener noreferrer" class="chat-header-btn wa-btn" id="chat-wa-header-link" title="Chat on WhatsApp" aria-label="WhatsApp">
            💬
          </a>
          <button class="chat-header-btn" id="chat-close-btn" type="button" title="Minimize Chat" aria-label="Close Chat">
            ✕
          </button>
        </div>
      </div>

      <!-- Language Toggle Bar -->
      <div class="chat-lang-bar">
        <span class="chat-lang-label" id="chat-lang-label">Language / भाषा:</span>
        <div class="chat-lang-switch" role="group" aria-label="Select language">
          <button type="button" class="chat-lang-btn active" id="lang-btn-en" data-lang="en">🇬🇧 English</button>
          <button type="button" class="chat-lang-btn" id="lang-btn-ne" data-lang="ne">🇳🇵 नेपाली</button>
        </div>
      </div>

      <div class="chat-messages" id="chat-messages" tabindex="0">
        <!-- Message bubbles dynamically populated -->
      </div>

      <div class="chat-typing-indicator" id="chat-typing" style="display: none;">
        <span class="chat-typing-dot"></span>
        <span class="chat-typing-dot"></span>
        <span class="chat-typing-dot"></span>
      </div>

      <form class="chat-footer" id="chat-input-form">
        <input type="text" id="chat-input" class="chat-input" placeholder="Ask anything in English or नेपाली..." autocomplete="off" aria-label="Chat message">
        <button type="submit" id="chat-send" class="chat-send-btn" aria-label="Send message">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(widgetContainer);

  // 2. Element Selectors
  const toggleBtn = document.getElementById('chat-toggle-btn');
  const teaserPill = document.getElementById('chat-teaser');
  const teaserText = document.getElementById('chat-teaser-text');
  const closeBtn = document.getElementById('chat-close-btn');
  const messagesBox = document.getElementById('chat-messages');
  const typingIndicator = document.getElementById('chat-typing');
  const chatForm = document.getElementById('chat-input-form');
  const chatInput = document.getElementById('chat-input');
  const langBtnEn = document.getElementById('lang-btn-en');
  const langBtnNe = document.getElementById('lang-btn-ne');
  const headerTitle = document.getElementById('chat-header-title');
  const headerSub = document.getElementById('chat-header-sub');

  // Format Time
  function getTimeString() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Scroll
  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesBox.scrollTop = messagesBox.scrollHeight;
    });
  }

  // Typing indicator
  function showTyping(show) {
    if (show) {
      typingIndicator.style.display = 'flex';
      messagesBox.appendChild(typingIndicator);
      scrollToBottom();
    } else {
      typingIndicator.style.display = 'none';
    }
  }

  // Append Message Bubble
  function appendMessage(text, sender = 'bot', customHtml = null) {
    const row = document.createElement('div');
    row.className = `chat-msg-row ${sender}`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-msg-bubble';

    if (customHtml) {
      bubble.innerHTML = customHtml;
    } else {
      // Preserve line breaks
      bubble.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
    }

    const time = document.createElement('div');
    time.className = 'chat-msg-time';
    time.textContent = getTimeString();
    bubble.appendChild(time);

    row.appendChild(bubble);
    messagesBox.appendChild(row);
    scrollToBottom();
    return row;
  }

  // Append Interactive Chips
  function appendChips(chips) {
    const container = document.createElement('div');
    container.className = 'chat-chips-container';

    chips.forEach(chip => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat-chip';
      btn.innerHTML = `${chip.icon} <span>${chip.label}</span>`;
      btn.addEventListener('click', () => {
        container.remove();
        handleUserMessage(chip.query || chip.label);
      });
      container.appendChild(btn);
    });

    messagesBox.appendChild(container);
    scrollToBottom();
  }

  // Append In-Chat EmailJS Contact Form Card
  function appendContactCard(prefilledEmail = '', prefilledPhone = '', reason = '') {
    const card = document.createElement('div');
    card.className = 'chat-contact-card';
    const t = UI[currentLang];

    const defaultReason = reason || (currentLang === 'ne' ? 'फोटोकपी मेसिन/टोनर/मर्मत सम्बन्धी सोधपुछ' : 'General enquiry for Sandeep Das');

    card.innerHTML = `
      <div class="chat-card-header">
        <span>✉️</span>
        <div>${t.cardTitle}</div>
      </div>
      <p style="margin: 0; font-size: 11px; color: #555;">
        ${t.cardDesc}
      </p>
      <div class="chat-card-field">
        <label>${t.nameLabel}</label>
        <input type="text" class="card-name" placeholder="${t.namePlaceholder}" value="${escapeHtml(userProfile.name)}" required>
      </div>
      <div class="chat-card-field">
        <label>${t.emailLabel}</label>
        <input type="email" class="card-email" placeholder="${t.emailPlaceholder}" value="${escapeHtml(prefilledEmail || userProfile.email)}" required>
      </div>
      <div class="chat-card-field">
        <label>${t.phoneLabel}</label>
        <input type="tel" class="card-phone" placeholder="${t.phonePlaceholder}" value="${escapeHtml(prefilledPhone || userProfile.phone)}">
      </div>
      <div class="chat-card-field">
        <label>${t.reqLabel}</label>
        <textarea class="card-message" rows="2" placeholder="${t.reqPlaceholder}">${escapeHtml(defaultReason)}</textarea>
      </div>
      <button type="button" class="chat-card-submit">
        <span>${t.submitBtn}</span>
      </button>
      <p class="chat-card-footnote">${t.footnote}</p>
    `;

    const nameInput = card.querySelector('.card-name');
    const emailInput = card.querySelector('.card-email');
    const phoneInput = card.querySelector('.card-phone');
    const messageInput = card.querySelector('.card-message');
    const submitBtn = card.querySelector('.chat-card-submit');

    submitBtn.addEventListener('click', async () => {
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();
      const message = messageInput.value.trim();

      if (!name) {
        alert(currentLang === 'ne' ? 'कृपया आफ्नो नाम लेख्नुहोस्।' : 'Please enter your name.');
        nameInput.focus();
        return;
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert(currentLang === 'ne' ? 'कृपया सही इमेल ठेगाना लेख्नुहोस्।' : 'Please enter a valid email address.');
        emailInput.focus();
        return;
      }

      userProfile.name = name;
      userProfile.email = email;
      userProfile.phone = phone;

      // Disable button during sending
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>${t.sendingBtn}</span>`;

      // Compose full message payload with chat history
      const chatSummary = userProfile.messageHistory.length
        ? `\n\n--- Customer Chat Context ---\n${userProfile.messageHistory.slice(-5).join('\n')}`
        : '';
      const fullMessage = `${message}${chatSummary}\n\nSubmitted from: COPYSTAR AI Live Chat Widget (${currentLang.toUpperCase()})`;

      try {
        await sendEnquiry({ name, email, phone }, fullMessage);
        const waText = encodeURIComponent(
          currentLang === 'ne'
            ? `नमस्ते सन्दीप दास जी, मैले भर्खर वेबसाइटबाट सन्देश पठाएँ। मेरो नाम ${name} (${phone || email}) हो। आवश्यकता: ${message}`
            : `Hello Sandeep Das, I just sent an enquiry via COPYSTAR live chat. My name is ${name} (${phone || email}). Requirements: ${message}`
        );

        card.innerHTML = `
          <div class="chat-success-box">
            <div class="chat-success-title">${t.successTitle}</div>
            <p class="chat-success-desc">
              ${t.successDesc(name)}
            </p>
            <div class="chat-direct-actions">
              <a href="https://wa.me/9779851122595?text=${waText}" target="_blank" rel="noopener noreferrer" class="chat-direct-btn wa">
                ${t.waBtn}
              </a>
              <a href="tel:+9779851122595" class="chat-direct-btn call">
                ${t.callBtn}
              </a>
            </div>
          </div>
        `;
        scrollToBottom();
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>${t.retryBtn}</span>`;
        alert(`Notice: ${err.message}`);

        const fallbackText = encodeURIComponent(`Hi Sandeep Das, I wanted to enquire: ${message}. From: ${name}, Email: ${email}, Phone: ${phone}`);
        const fallbackBox = document.createElement('div');
        fallbackBox.style.cssText = 'font-size: 11px; color: #b91c1c; margin-top: 6px;';
        fallbackBox.innerHTML = `
          Could not confirm delivery via EmailJS. You can connect directly:
          <div class="chat-direct-actions" style="margin-top: 6px;">
            <a href="https://wa.me/9779851122595?text=${fallbackText}" target="_blank" class="chat-direct-btn wa">Open WhatsApp</a>
            <a href="mailto:Copystarnepal@hotmail.com?subject=COPYSTAR Chat Enquiry&body=${fallbackText}" class="chat-direct-btn call">Draft Email</a>
          </div>
        `;
        card.appendChild(fallbackBox);
        scrollToBottom();
      }
    });

    messagesBox.appendChild(card);
    scrollToBottom();
  }

  // Welcome Conversation
  function initWelcomeConversation() {
    showTyping(true);
    setTimeout(() => {
      showTyping(false);

      if (currentLang === 'ne') {
        appendMessage(
          "नमस्ते! 🙏 COPYSTAR International मा स्वागत छ।\nम सन्दीप दासको टिमबाट तपाईंलाई सहयोग गर्न यहाँ छु। फोटोकपी मेसिन, ओरिजिनल टोनर कार्ट्रिज, स्पेयर पार्टस् वा प्राविधिक मर्मत सेवा बारे के जानकारी चाहिन्छ, ढुक्क भएर सोध्नुहोस्!"
        );
        appendChips([
          { icon: '💰', label: 'मूल्य / कोटेशन', query: 'मलाई फोटोकपी मेसिन र टोनरको मूल्य/कोटेशन चाहियो।' },
          { icon: '🖨️', label: 'फोटोकपी मेसिन', query: 'हामीलाई Xerox र Canon का मेसिनहरू बारे जानकारी दिनुहोस्।' },
          { icon: '📦', label: 'टोनर र पार्टस्', query: 'Xerox र Canon का ओरिजिनल टोनर तथा स्पेयर पार्टस् उपलब्ध छ?' },
          { icon: '🛠️', label: 'मर्मत सेवा (Repair)', query: 'मेरो फोटोकपी मेसिन मर्मत तथा सर्भिसिङ गराउनु थियो।' },
          { icon: '✉️', label: 'सन्दीप दासलाई सन्देश', query: 'म सन्दीप दासलाई आफ्नो नम्बर र विवरण पठाउन चाहन्छु।' }
        ]);
      } else {
        appendMessage(
          "Namaste & Hello! 👋 Welcome to COPYSTAR International.\nI am your assistant from Sandeep Das's team. How can I help you today with photocopier machines, genuine toner supplies, spare parts, or repair services in Kathmandu?"
        );
        appendChips([
          { icon: '💰', label: 'Price Quotation', query: 'I want a price quotation for machines and supplies.' },
          { icon: '🖨️', label: 'Xerox & Canon Copiers', query: 'Tell me about available Xerox and Canon photocopier machines.' },
          { icon: '📦', label: 'Toner & Spare Parts', query: 'What toner cartridges and spare parts do you supply?' },
          { icon: '🛠️', label: 'Book Repair Service', query: 'I need technician repair or maintenance for my copier.' },
          { icon: '✉️', label: 'Message Sandeep Das', query: 'I want to send my contact details to Sandeep Das.' }
        ]);
      }
    }, 400);
  }

  // Switch Language
  function setLanguage(lang, triggerGreeting = false) {
    currentLang = lang;
    const t = UI[lang];

    // Update buttons
    langBtnEn.classList.toggle('active', lang === 'en');
    langBtnNe.classList.toggle('active', lang === 'ne');

    // Update text placeholders
    teaserText.textContent = t.teaser;
    headerTitle.innerHTML = `${t.headerTitle} <span class="chat-badge-verified">OFFICIAL</span>`;
    headerSub.textContent = t.headerSub;
    chatInput.placeholder = t.inputPlaceholder;

    if (triggerGreeting) {
      appendMessage(
        lang === 'ne'
          ? "भाषा परिवर्तन भयो: नेपाली 🇳🇵\nनमस्ते! म कसरी सहयोग गर्न सक्छु?"
          : "Language switched to English 🇬🇧\nHow can I help you today?",
        'bot'
      );
      if (lang === 'ne') {
        appendChips([
          { icon: '💰', label: 'मूल्य / कोटेशन', query: 'मलाई फोटोकपी मेसिन र टोनरको मूल्य चाहियो।' },
          { icon: '🖨️', label: 'फोटोकपी मेसिन', query: 'मेसिनहरू बारे जानकारी दिनुहोस्।' },
          { icon: '🛠️', label: 'मर्मत सेवा', query: 'मेसिन मर्मत गराउनु थियो।' }
        ]);
      } else {
        appendChips([
          { icon: '💰', label: 'Price Quote', query: 'I need a price quotation.' },
          { icon: '🖨️', label: 'Copier Machines', query: 'Tell me about Xerox & Canon machines.' },
          { icon: '🛠️', label: 'Repair Service', query: 'I need technician repair for my copier.' }
        ]);
      }
    }
  }

  langBtnEn.addEventListener('click', () => setLanguage('en', true));
  langBtnNe.addEventListener('click', () => setLanguage('ne', true));

  // Auto-detect Language from user input
  function detectLanguage(text) {
    // Devanagari script (Nepali/Hindi)
    if (/[\u0900-\u097F]/.test(text)) {
      return 'ne';
    }
    // Common Romanized Nepali keywords
    const nepaliRomanRegex = /\b(namaste|namaskar|tapai|tapaiko|tapain|hajur|mero|hamro|cha|chha|hoina|kati|parcha|hunchha|huncha|pasal|dokan|banauna|bigriyo|dinus|pathaidinus|kasto|kinna|kinne|kaile|nepal|kathmandu|sanchai|sandeepji)\b/i;
    if (nepaliRomanRegex.test(text)) {
      return 'ne';
    }
    return currentLang; // keep current language if ambiguous
  }

  // Human-like Bilingual Conversational Engine
  function generateHumanAIResponse(query) {
    const raw = query.trim();
    const q = raw.toLowerCase();

    // Check if user is typing in Nepali
    const detected = detectLanguage(raw);
    if (detected !== currentLang) {
      currentLang = detected;
      setLanguage(detected, false);
    }

    const isNepali = currentLang === 'ne';

    // 1. Check for email address or phone number in query
    const emailMatch = raw.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = raw.match(/(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/) || raw.match(/\b\d{7,14}\b/);

    if (emailMatch || phoneMatch) {
      const email = emailMatch ? emailMatch[0] : '';
      const phone = phoneMatch ? phoneMatch[0] : '';
      return {
        reply: isNepali
          ? "धेरै धेरै धन्यवाद! मैले तपाईंको सम्पर्क विवरण सुरक्षित गरेको छु। सन्दीप दासलाई तुरुन्तै इमेल पुगोस् भन्नको लागि कृपया तल एकपटक पुष्टि गरी पठाउनुहोस्:"
          : "Thank you so much! I've noted down your contact details. Please confirm them in the card below so I can dispatch your message straight to Sandeep Das via EmailJS:",
        action: 'show_card',
        prefilledEmail: email,
        prefilledPhone: phone,
        chips: isNepali
          ? [
              { icon: '💬', label: 'ह्वाट्सएपमा कुरा गर्नुहोस्', query: 'म ह्वाट्सएपमा सीधै कुरा गर्न चाहन्छु।' },
              { icon: '📞', label: 'सीधै फोन नम्बर', query: 'तपाईंको फोन नम्बर के हो?' }
            ]
          : [
              { icon: '💬', label: 'Chat on WhatsApp', query: 'Can I chat directly on WhatsApp?' },
              { icon: '📞', label: 'Call COPYSTAR', query: 'What is your phone number?' }
            ]
      };
    }

    // 2. Owner / Send message / Contact Details
    if (q.includes('owner') || q.includes('sandeep') || (q.includes('send') && (q.includes('email') || q.includes('detail') || q.includes('number'))) ||
        q.includes('मालिक') || q.includes('सन्दीप') || q.includes('नम्बर') || q.includes('इमेल') || q.includes('सम्पर्क')) {
      return {
        reply: isNepali
          ? "अवश्य! तपाईं सीधै प्रोप्राइटर सन्दीप दाससँग सम्पर्क गर्न सक्नुहुन्छ। तलको फाराम भर्नुभयो भने EmailJS मार्फत तुरुन्तै Copystarnepal@hotmail.com मा इमेल पुग्नेछ:"
          : "Certainly! You can send your contact details and requirements straight to proprietor Sandeep Das using our EmailJS form below. An email notification will be delivered immediately to Copystarnepal@hotmail.com:",
        action: 'show_card',
        chips: isNepali
          ? [
              { icon: '💬', label: 'सन्दीप दाससँग ह्वाट्सएप', query: 'सन्दीप दाससँग ह्वाट्सएपमा कुरा गर्छु' },
              { icon: '🖨️', label: 'फोटोकपी मेसिन हेर्ने', query: 'Xerox र Canon का मेसिनहरू बारे जानकारी दिनुहोस्।' }
            ]
          : [
              { icon: '💬', label: 'WhatsApp Sandeep Das', query: 'Connect with Sandeep Das on WhatsApp' },
              { icon: '🖨️', label: 'Explore Copiers', query: 'Tell me about Xerox & Canon machines' }
            ]
      };
    }

    // 3. Price / Cost / Rate / Quotation / Discount
    if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('quote') || q.includes('quotation') || q.includes('discount') ||
        q.includes('मूल्य') || q.includes('रेट') || q.includes('कति') || q.includes('पैसा') || q.includes('सस्तो') || q.includes('kati') || q.includes('parcha')) {
      return {
        reply: isNepali
          ? "हामी Xerox तथा Canon का डिजिटल मेसिन, ओरिजिनल टोनर र स्पेयर पार्टस् होलसेल र रिटेल दुवै दररेटमा उपलब्ध गराउँछौँ। मेसिनको मोडल र तपाईंको अर्डर परिमाण अनुसार सन्दीप दासले सिधै विशेष छुटसहित कोटेशन दिनुहुन्छ। तल आफ्नो नम्बर छाड्नुहोस्, हामी तुरुन्तै कोटेशन पठाउँछौँ:"
          : "We provide competitive wholesale and retail pricing for Xerox and Canon copiers, genuine toners, and parts across Nepal. Because pricing depends on your exact model and order volume, Sandeep Das provides custom quotes. Please share your details below to receive an official quote:",
        action: 'show_card',
        chips: isNepali
          ? [
              { icon: '📦', label: 'होलसेल टोनर कोटेशन', query: 'मलाई टोनरको होलसेल कोटेशन चाहियो' },
              { icon: '🖨️', label: 'मेसिनको मूल्य', query: 'फोटोकपी मेसिनको मूल्य कति पर्छ?' }
            ]
          : [
              { icon: '📦', label: 'Bulk Toner Quote', query: 'I need bulk toner cartridges' },
              { icon: '🖨️', label: 'Machine Quote', query: 'I need a quotation for a commercial copier' }
            ]
      };
    }

    // 4. Copier Machines (Xerox, Canon, buying, models)
    if (q.includes('copier') || q.includes('machine') || q.includes('xerox') || q.includes('canon') || q.includes('printer') || q.includes('buy') ||
        q.includes('मेसिन') || q.includes('फोटोकपी') || q.includes('क्यानन') || q.includes('जेरोक्स') || q.includes('किन्न') || q.includes('kinna')) {
      return {
        reply: isNepali
          ? "हामीसँग Xerox (WorkCentre, VersaLink) र Canon (imageRUNNER) का उच्च गुणस्तरका डिजिटल फोटोकपी मेसिनहरू उपलब्ध छन्। यसमा हेभी ड्युटी डकुमेन्ट फिडर (ADF), दुवैतर्फ छिटो प्रिन्ट तथा स्क्यान र कम खर्चमा सफा प्रिन्ट आउँछ। तपाईंलाई फोटोकपी पसलको लागि हेभी मेसिन चाहियो कि अफिसको लागि?"
          : "We supply brand-new and certified commercial multifunction digital copiers from Xerox (WorkCentre & VersaLink) and Canon (imageRUNNER). Key features include heavy-duty dual-sided scanning, duplex printing, fast PPM speed, and low cost-per-page. Are you looking for a heavy-duty commercial machine for a shop or an office copier?",
        chips: isNepali
          ? [
              { icon: '💰', label: 'मेसिन कोटेशन माग्नुहोस्', query: 'मलाई मेसिनको मूल्य र कोटेशन चाहियो।' },
              { icon: '🛠️', label: 'मेसिन सर्भिसिङ', query: 'मेरो मेसिन मर्मत गराउनु थियो।' }
            ]
          : [
              { icon: '💰', label: 'Request Machine Quote', query: 'I want a price quote for a Xerox or Canon machine' },
              { icon: '🛠️', label: 'Book Technician', query: 'I need servicing for my existing copier' }
            ]
      };
    }

    // 5. Toner / Cartridge / Ink / Powder
    if (q.includes('toner') || q.includes('cartridge') || q.includes('cmyk') || q.includes('ink') || q.includes('powder') ||
        q.includes('टोनर') || q.includes('कार्ट्रिज') || q.includes('मसी') || q.includes('कलर')) {
      return {
        reply: isNepali
          ? "हामी Xerox, Canon तथा अन्य प्रमुख ब्रान्डका १००% ओरिजिनल Black र CMYK कलर टोनरहरू उपलब्ध गराउँछौँ। हाम्रा टोनरले उच्च पृष्ठ संख्या (High Page Yield) र गाढा, सफा प्रिन्ट दिन्छन् जसले मेसिनको ड्रम पनि बिग्रिन दिँदैन। तपाईंको मेसिन कुन मोडलको हो?"
          : "We supply 100% genuine black and CMYK color toner cartridges with high page yield, sharp resolution, and zero drum damage. Compatible with all popular Xerox and Canon digital copiers. Are you looking for a single cartridge or bulk wholesale supply?",
        chips: isNepali
          ? [
              { icon: '📦', label: 'टोनर अर्डर कोटेशन', query: 'मलाई टोनरको अर्डर गर्नुछ, मूल्य बताउनुहोस्।' },
              { icon: '✉️', label: 'सन्दीप दाससँग कुरा', query: 'सन्दीप दासलाई मेरो नम्बर पठाउनुहोस्।' }
            ]
          : [
              { icon: '📦', label: 'Request Bulk Toner Quote', query: 'Send me a bulk toner price quotation' },
              { icon: '✉️', label: 'Contact Owner', query: 'I want to send an enquiry to Sandeep Das' }
            ]
      };
    }

    // 6. Spare Parts / Gears / Rollers / Drum / Pickup
    if (q.includes('part') || q.includes('spare') || q.includes('gear') || q.includes('roller') || q.includes('drum') || q.includes('fuser') || q.includes('adf') || q.includes('tray') ||
        q.includes('पार्टस्') || q.includes('रोलर') || q.includes('गियर') || q.includes('ड्रम') || q.includes('पार्ट')) {
      return {
        reply: isNepali
          ? "हामीसँग फ्युजर रोलर (Upper/Lower), प्रेसर रोलर, पेपर फिड रोलर, ड्राइभ गियर, ड्रम युनिट लगायतका ओरिजिनल स्पेयर पार्टस् काठमाडौंमा स्टक उपलब्ध छन्। १००% फिटिङ सुनिश्चित गर्नको लागि आफ्नो मेसिनको मोडल नम्बर भन्नुहोस् है!"
          : "We stock OEM spare parts: fuser heat rollers, lower pressure rollers, paper pickup & feed rollers, drive gears, ADF glass assemblies, and drum cleaning blades. To ensure 100% compatibility, please tell us your machine model number!",
        chips: isNepali
          ? [
              { icon: '⚙️', label: 'रोलर र गियर बुझ्ने', query: 'फ्युजर रोलर र गियर उपलब्ध छ?' },
              { icon: '✉️', label: 'पार्टस् कोटेशन', query: 'मलाई स्पेयर पार्टस् को मूल्य चाहियो।' }
            ]
          : [
              { icon: '⚙️', label: 'Fuser Rollers & Gears', query: 'Do you have fuser rollers and gears in stock?' },
              { icon: '✉️', label: 'Inquire by Model', query: 'I want to ask if a specific part fits my machine' }
            ]
      };
    }

    // 7. Repair / Maintenance / Jam / Fault / Error / Fixing
    if (q.includes('repair') || q.includes('service') || q.includes('maintenance') || q.includes('technician') || q.includes('jam') || q.includes('fault') || q.includes('error') || q.includes('fix') ||
        q.includes('मर्मत') || q.includes('बिग्रियो') || q.includes('जाम') || q.includes('सर्भिस') || q.includes('बनाउन') || q.includes('समस्या') || q.includes('bigriyo') || q.includes('banauna')) {
      return {
        reply: isNepali
          ? "मेसिन बिग्रिँदा काम रोकिन्छ, म बुझ्न सक्छु! सन्दीप दासको नेतृत्वमा हाम्रा दक्ष प्राविधिकहरूले पेपर जाम हुने, प्रिन्ट धमिलो आउने वा कालो धर्का देखिने, कोड एरर आउने समस्या तुरुन्तै समाधान गर्छन्। काठमाडौंमा तुरुन्तै अन-साइट सेवा उपलब्ध छ। तल आफ्नो नम्बर लेख्नुहोस् वा प्राविधिक बोलाउनुहोस्:"
          : "I understand how troublesome machine breakdowns can be! Our technician team led by Sandeep Das handles all types of copier faults: paper jams, faded prints, black lines, code errors, and routine preventive care. We provide quick on-site service in Kathmandu and support across Nepal. Would you like to book a service visit?",
        action: 'show_card',
        chips: isNepali
          ? [
              { icon: '🛠️', label: 'मर्मत समय मिलाउनुहोस्', query: 'मेरो मेसिन मर्मत गर्न प्राविधिक पठाइदिनुहोस्।' },
              { icon: '📞', label: 'सीधै कल गर्नुहोस्', query: 'म अहिले नै फोन गर्न चाहन्छु।' }
            ]
          : [
              { icon: '🛠️', label: 'Book Service Visit', query: 'I want to book a service visit for my machine' },
              { icon: '📞', label: 'Call Technician', query: 'Give me your phone number to call right away' }
            ]
      };
    }

    // 8. Software / Driver Download
    if (q.includes('download') || q.includes('driver') || q.includes('software') || q.includes('zip') || q.includes('setup') ||
        q.includes('डाउनलोड') || q.includes('ड्राइभर') || q.includes('सफ्टवेयर')) {
      return {
        reply: isNepali
          ? "तपाईं यही वेबसाइटको 'Software Downloads' सेक्सनबाट Xerox, Canon, Konica Minolta र Ricoh का आधिकारिक सफ्टवेयर र ड्राइभरहरू सिधै डाउनलोड गर्न सक्नुहुन्छ! यदि इन्स्टलेसनमा मद्दत चाहिन्छ भने हाम्रा प्राविधिकले सहयोग गर्नेछन्।"
          : "You can download official software and printer driver packages directly on this page under the 'Software Downloads' section! We provide driver packages for Xerox, Canon, Konica Minolta, and Ricoh. Let us know if you need installation help!",
        chips: isNepali
          ? [
              { icon: '↓', label: 'सफ्टवेयर डाउनलोड हेर्ने', query: 'सफ्टवेयर डाउनलोड कहाँ छ?' },
              { icon: '🛠️', label: 'इन्स्टलेसन सहयोग', query: 'मलाई ड्राइभर इन्स्टल गर्न सहयोग चाहियो।' }
            ]
          : [
              { icon: '↓', label: 'Go to Downloads', query: 'Where can I find the download button?' },
              { icon: '🛠️', label: 'Need Installation Help', query: 'I need technician assistance installing drivers' }
            ]
      };
    }

    // 9. Contact / Address / Location / Kathmandu / Phone
    if (q.includes('contact') || q.includes('phone') || q.includes('number') || q.includes('address') || q.includes('location') || q.includes('where') || q.includes('whatsapp') ||
        q.includes('ठेगाना') || q.includes('फोन') || q.includes('कहाँ') || q.includes('काठमाडौं') || q.includes('कता') || q.includes('pasal') || q.includes('dokan') || q.includes('kata')) {
      return {
        reply: isNepali
          ? "COPYSTAR International को सम्पर्क विवरण:\n📍 ठेगाना: काठमाडौं, नेपाल\n👤 प्रोप्राइटर: सन्दीप दास (Sandeep Das)\n📞 फोन / ह्वाट्सएप: +977 9851122595\n✉️ इमेल: Copystarnepal@hotmail.com\n\nतपाईं तलको फारामबाट सीधै सन्दीप दासलाई सन्देश पठाउन पनि सक्नुहुन्छ!"
          : "Here are COPYSTAR International's official contact details:\n📍 Head Office: Kathmandu, Nepal\n👤 Proprietor: Sandeep Das\n📞 Phone & WhatsApp: +977 9851122595\n✉️ Email: Copystarnepal@hotmail.com\n\nYou can also leave your requirements right here, and Sandeep Das will receive it in his inbox via EmailJS!",
        chips: isNepali
          ? [
              { icon: '✉️', label: 'सन्देश पठाउनुहोस्', query: 'सन्दीप दासलाई मेरो सन्देश पठाउनुहोस्।' },
              { icon: '💬', label: 'ह्वाट्सएप खोल्नुहोस्', query: 'सन्दीप दाससँग ह्वाट्सएपमा कुरा गर्छु' }
            ]
          : [
              { icon: '✉️', label: 'Send Details via EmailJS', query: 'Send my enquiry to Sandeep Das' },
              { icon: '💬', label: 'Chat on WhatsApp', query: 'Open WhatsApp with Sandeep Das' }
            ]
      };
    }

    // 10. Greetings (Hello, Hi, Namaste, K cha, Sanchai)
    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('namaste') || q.includes('namaskar') || q.includes('good') ||
        q.includes('नमस्ते') || q.includes('नमस्कार') || q.includes('सन्चै') || q.includes('के छ') || q.includes('sanchai') || q.includes('k cha')) {
      return {
        reply: isNepali
          ? "नमस्ते! 🙏 आरामै हुनुहुन्छ? COPYSTAR International मा स्वागत छ। म सन्दीप दासको टिमबाट उपस्थित छु। नयाँ फोटोकपी मेसिन, ओरिजिनल टोनर, स्पेयर पार्टस् वा मर्मत सेवा सम्बन्धी के सहयोग गरौँ?"
          : "Namaste & Hello! 🙏 Welcome to COPYSTAR International. I'm here from Sandeep Das's team. How can I assist you today with copier machines, genuine toner supplies, spare parts, or repairs in Kathmandu?",
        chips: isNepali
          ? [
              { icon: '💰', label: 'मूल्य / कोटेशन', query: 'मलाई फोटोकपी मेसिन र टोनरको मूल्य चाहियो।' },
              { icon: '🖨️', label: 'फोटोकपी मेसिन', query: 'मेसिनहरू बारे जानकारी दिनुहोस्।' },
              { icon: '✉️', label: 'सन्दीप दासलाई सम्पर्क', query: 'सन्दीप दासलाई मेरो नम्बर पठाउनुहोस्।' }
            ]
          : [
              { icon: '💰', label: 'Get a Quote', query: 'I want a price quotation' },
              { icon: '📦', label: 'Toner Cartridges', query: 'Tell me about toner cartridges' },
              { icon: '✉️', label: 'Contact Owner', query: 'I want to send an enquiry to Sandeep Das' }
            ]
      };
    }

    // Default friendly human-like response
    return {
      reply: isNepali
        ? "तपाईंको सन्देशको लागि धन्यवाद! म यसमा पक्कै सहयोग गर्नेछु। कृपया आफ्नो मेसिनको ब्रान्ड वा मोडल (Xerox वा Canon) र आवश्यक पार्टस्/समस्या अलिकति खुलाइदिनुहोस् न। अथवा तल आफ्नो सम्पर्क नम्बर छाड्नुभयो भने सन्दीप दासले सीधै कल गर्नुहुनेछ:"
        : "Thank you for reaching out! I would love to help you. Could you please share your machine brand/model (e.g. Xerox or Canon) or the specific parts/services you need? You can also leave your contact details below and Sandeep Das will contact you directly:",
      action: 'show_card',
      chips: isNepali
        ? [
            { icon: '✉️', label: 'विवरण पठाउनुहोस्', query: 'सन्दीप दासलाई मेरो आवश्यकता पठाउन चाहन्छु।' },
            { icon: '💬', label: 'ह्वाट्सएपमा कुरा', query: 'ह्वाट्सएपमा सीधै कुरा गर्न चाहन्छु।' }
          ]
        : [
            { icon: '✉️', label: 'Email Requirements', query: 'I want to email my requirements to Sandeep Das' },
            { icon: '💬', label: 'Chat on WhatsApp', query: 'Let me chat on WhatsApp (+977 9851122595)' }
          ]
    };
  }

  // Handle User Input Submission
  function handleUserMessage(text) {
    const cleanText = text.trim();
    if (!cleanText) return;

    // Record user message in history
    userProfile.messageHistory.push(`Customer: ${cleanText}`);
    appendMessage(cleanText, 'user');
    chatInput.value = '';

    // Show AI typing and reply
    showTyping(true);
    const delay = Math.min(900, Math.max(350, cleanText.length * 18));

    setTimeout(() => {
      showTyping(false);
      const res = generateHumanAIResponse(cleanText);
      userProfile.messageHistory.push(`AI: ${res.reply}`);

      appendMessage(res.reply, 'bot');

      if (res.action === 'show_card') {
        appendContactCard(res.prefilledEmail || '', res.prefilledPhone || '', cleanText);
      }

      if (res.chips && res.chips.length) {
        appendChips(res.chips);
      }
    }, delay);
  }

  // Toggle Chat Window
  function toggleChat(open) {
    const shouldOpen = open !== undefined ? open : !widgetContainer.classList.contains('is-open');
    if (shouldOpen) {
      widgetContainer.classList.add('is-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      if (!hasInitialized) {
        initWelcomeConversation();
        hasInitialized = true;
      }
      setTimeout(() => chatInput.focus(), 200);
    } else {
      widgetContainer.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }

  toggleBtn.addEventListener('click', () => toggleChat());
  teaserPill.addEventListener('click', () => toggleChat(true));
  closeBtn.addEventListener('click', () => toggleChat(false));

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleUserMessage(chatInput.value);
  });

  // Global helper to open chat from page elements
  window.openCopystarChat = function(topic = '', lang = null) {
    if (lang && (lang === 'en' || lang === 'ne')) {
      setLanguage(lang, false);
    }
    toggleChat(true);
    if (topic) {
      handleUserMessage(topic);
    }
  };
})();
