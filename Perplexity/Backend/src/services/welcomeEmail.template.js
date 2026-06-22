/**
 * Generates a beautifully designed HTML welcome email for Nexora.
 * @param {string} username - The registered user's display name
 * @returns {{ subject: string, html: string, text: string }}
 */
export const getWelcomeEmailContent = (username) => {
  const subject = `Welcome to Nexora, ${username}! 🚀`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Nexora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', Arial, sans-serif;
      background-color: #0a0a0f;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }

    .wrapper {
      max-width: 620px;
      margin: 40px auto;
      background: #12121a;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid rgba(139, 92, 246, 0.25);
      box-shadow: 0 0 60px rgba(139, 92, 246, 0.12);
    }

    /* ── HEADER ── */
    .header {
      background: linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%);
      padding: 48px 40px 40px;
      text-align: center;
      position: relative;
      border-bottom: 1px solid rgba(139, 92, 246, 0.3);
    }

    .header::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.18) 0%, transparent 70%);
    }

    .logo-container {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .logo-icon {
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      box-shadow: 0 8px 24px rgba(139, 92, 246, 0.5);
    }

    .logo-text {
      font-size: 32px;
      font-weight: 800;
      background: linear-gradient(135deg, #a78bfa, #818cf8, #38bdf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.5px;
    }

    .header-tagline {
      position: relative;
      font-size: 14px;
      color: rgba(167, 139, 250, 0.8);
      letter-spacing: 2px;
      text-transform: uppercase;
      font-weight: 500;
      margin-top: 4px;
    }

    /* ── BODY ── */
    .body {
      padding: 44px 40px;
    }

    .greeting {
      font-size: 26px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 6px;
      line-height: 1.3;
    }

    .greeting span {
      background: linear-gradient(90deg, #a78bfa, #38bdf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .intro-text {
      font-size: 15px;
      color: #94a3b8;
      line-height: 1.75;
      margin-top: 16px;
      margin-bottom: 32px;
    }

    /* ── DIVIDER ── */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.4), transparent);
      margin: 32px 0;
    }

    /* ── FEATURES ── */
    .section-title {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #a78bfa;
      margin-bottom: 20px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 32px;
    }

    .feature-card {
      background: rgba(255,255,255,0.035);
      border: 1px solid rgba(139, 92, 246, 0.15);
      border-radius: 14px;
      padding: 20px 18px;
      transition: border-color 0.2s;
    }

    .feature-icon {
      font-size: 22px;
      margin-bottom: 10px;
      display: block;
    }

    .feature-title {
      font-size: 14px;
      font-weight: 600;
      color: #e2e8f0;
      margin-bottom: 5px;
    }

    .feature-desc {
      font-size: 12.5px;
      color: #64748b;
      line-height: 1.55;
    }

    /* ── FUTURE UPDATES ── */
    .updates-box {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(56, 189, 248, 0.07));
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 14px;
      padding: 22px 24px;
      margin-bottom: 32px;
    }

    .updates-box p {
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.75;
    }

    .updates-box p strong {
      color: #a5b4fc;
      font-weight: 600;
    }

    /* ── CTA BUTTON ── */
    .cta-wrapper {
      text-align: center;
      margin: 28px 0;
    }

    .cta-button {
      display: inline-block;
      padding: 14px 40px;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: #ffffff !important;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 12px;
      letter-spacing: 0.3px;
      box-shadow: 0 6px 24px rgba(124, 58, 237, 0.4);
    }

    /* ── SIGN-OFF ── */
    .signoff {
      margin-top: 36px;
    }

    .signoff p {
      font-size: 14px;
      color: #64748b;
      line-height: 1.7;
    }

    .signoff .team-name {
      font-weight: 700;
      font-size: 15px;
      color: #a78bfa;
      margin-top: 4px;
    }

    /* ── FOOTER ── */
    .footer {
      background: #0d0d16;
      border-top: 1px solid rgba(139, 92, 246, 0.12);
      padding: 24px 40px;
      text-align: center;
    }

    .footer p {
      font-size: 12px;
      color: #334155;
      line-height: 1.6;
    }

    .footer a {
      color: #6366f1;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">

    <!-- HEADER -->
    <div class="header">
      <div class="logo-container">
        <div class="logo-icon">✦</div>
        <span class="logo-text">Nexora</span>
      </div>
      <p class="header-tagline">AI · Powered · Intelligence</p>
    </div>

    <!-- BODY -->
    <div class="body">

      <h1 class="greeting">Hello, <span>${username}</span> 👋</h1>
      <p class="intro-text">
        Welcome to <strong style="color:#a78bfa;">Nexora</strong> — your all-in-one AI-powered workspace designed 
        to make you smarter, faster, and more productive. We're genuinely excited to have you on board.<br/><br/>
        You've just unlocked access to a platform built to answer your questions, spark your creativity, 
        assist with research, and help you accomplish more than ever before — all through the power of advanced AI.
      </p>

      <div class="divider"></div>

      <p class="section-title">⚡ What you can do with Nexora</p>

      <div class="features-grid">
        <div class="feature-card">
          <span class="feature-icon">🧠</span>
          <p class="feature-title">Smart AI Chat</p>
          <p class="feature-desc">Engage in rich, context-aware conversations powered by cutting-edge language models.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🌐</span>
          <p class="feature-title">Live Web Search</p>
          <p class="feature-desc">Ask anything and get real-time answers backed by up-to-date web search results.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🎙️</span>
          <p class="feature-title">Voice Mode</p>
          <p class="feature-desc">Have a natural, hands-free conversation with Nexora using your voice — anytime.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🗂️</span>
          <p class="feature-title">Chat History</p>
          <p class="feature-desc">All your conversations are saved and organized so you can pick up right where you left off.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🔍</span>
          <p class="feature-title">Deep Research</p>
          <p class="feature-desc">Dive deep into any topic with AI that synthesizes information from multiple sources.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">🚀</span>
          <p class="feature-title">Lightning Fast</p>
          <p class="feature-desc">Built for speed. Get accurate, concise responses in milliseconds — no waiting.</p>
        </div>
      </div>

      <div class="divider"></div>

      <!-- FUTURE UPDATES -->
      <div class="updates-box">
        <p>
          🔔 <strong>Stay tuned — exciting updates are coming your way!</strong><br/><br/>
          We're constantly improving Nexora with new features, smarter AI models, better integrations, 
          and a more personalized experience. As a valued member, <strong>you'll be the first to know</strong> 
          about every new release, feature drop, and improvement. Expect emails from us with all the latest news, 
          tips, and exclusive early access opportunities.
        </p>
      </div>

      <!-- CTA -->
      <div class="cta-wrapper">
        <a href="http://localhost:5173" class="cta-button">Open Nexora →</a>
      </div>

      <div class="divider"></div>

      <!-- SIGN-OFF -->
      <div class="signoff">
        <p>
          If you have any questions, feedback, or just want to say hi — we'd love to hear from you. 
          Our team is always here to help you get the most out of Nexora.
        </p>
        <br/>
        <p>With excitement & gratitude,</p>
        <p class="team-name">✦ The Nexora Team</p>
      </div>

    </div>

    <!-- FOOTER -->
    <div class="footer">
      <p>
        © ${new Date().getFullYear()} Nexora AI. All rights reserved.<br/>
        You received this email because you registered at Nexora.<br/>
        <a href="#">Unsubscribe</a> · <a href="#">Privacy Policy</a>
      </p>
    </div>

  </div>
</body>
</html>
  `;

  const text = `
Welcome to Nexora, ${username}!

Hello ${username},

Welcome to Nexora — your AI-powered workspace designed to make you smarter, faster, and more productive.

What you can do with Nexora:
• Smart AI Chat — Context-aware conversations with advanced AI
• Live Web Search — Real-time answers backed by web results
• Voice Mode — Hands-free AI conversations
• Chat History — All your sessions saved and organized
• Deep Research — Synthesized insights from multiple sources
• Lightning Fast — Accurate responses in milliseconds

Stay tuned — exciting updates are coming your way! We'll keep you in the loop with every new feature, improvement, and early access opportunity.

With excitement & gratitude,
The Nexora Team

© ${new Date().getFullYear()} Nexora AI. All rights reserved.
  `.trim();

  return { subject, html, text };
};
