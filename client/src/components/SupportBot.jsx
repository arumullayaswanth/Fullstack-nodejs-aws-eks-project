import React, { useMemo, useState } from "react";

const suggested = [
  "Hi",
  "What books are available?",
  "How can I buy a book?",
  "Do you have discounts?",
  "How to contact support?",
];

const botReply = (text) => {
  const q = text.toLowerCase().trim();

  if (!q) return "Please type a question so I can help.";
  if (q === "hi" || q === "hello" || q.includes("hey")) {
    return "Hi! I am Yash Academic Support Bot. I can help with books, pricing, checkout, and support.";
  }
  if (q.includes("book") && (q.includes("available") || q.includes("list") || q.includes("have"))) {
    return "Available highlights: MultiCloud, DevOps, AWS Fundamentals, Kubernetes Starter, Cloud Security Basics, and CI/CD Handbook.";
  }
  if (q.includes("buy") || q.includes("purchase") || q.includes("order")) {
    return "Open a book card and click Buy now. You can also add items to cart and continue checkout from there.";
  }
  if (q.includes("price") || q.includes("cost")) {
    return "Book prices are shown on each card. You can sort by price from the catalog controls.";
  }
  if (q.includes("discount") || q.includes("offer") || q.includes("coupon")) {
    return "Seasonal discounts are announced on the catalog page. For bulk purchase discounts, contact support.";
  }
  if (q.includes("delivery") || q.includes("ship")) {
    return "After order confirmation, delivery timelines depend on your location and shipping method.";
  }
  if (q.includes("payment") || q.includes("upi") || q.includes("card")) {
    return "We support secure online payments during checkout. If payment fails, retry once and contact support.";
  }
  if (q.includes("refund") || q.includes("cancel")) {
    return "Refund and cancellation depend on order status. Please contact support with your order ID.";
  }
  if (q.includes("contact") || q.includes("support") || q.includes("help")) {
    return "Use the social links section for LinkedIn, GitHub, Medium, and YouTube, or message us from this bot.";
  }
  if (q.includes("thanks") || q.includes("thank you")) {
    return "You are welcome. I am here if you need anything else.";
  }

  return "I can answer basic questions about available books, pricing, buying, discounts, delivery, payments, refunds, and support.";
};

const SupportBot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    {
      role: "bot",
      text: "Welcome to Yash Academic Support Bot. Ask me about books and support.",
    },
  ]);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  const ask = (value) => {
    const question = value.trim();
    if (!question) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: question },
      { role: "bot", text: botReply(question) },
    ]);
    setInput("");
  };

  return (
    <>
      <button className="support-fab" onClick={() => setOpen((v) => !v)} aria-label="Open support bot">
        {open ? "x" : "Chat"}
      </button>

      {open && (
        <section className="support-panel" role="dialog" aria-label="Yash Academic Support Bot">
          <header className="support-head">
            <div>
              <div className="support-title">Yash Academic Support Bot</div>
              <div className="support-sub">Instant help for common questions</div>
            </div>
            <button className="support-close" onClick={() => setOpen(false)} aria-label="Close support bot">
              x
            </button>
          </header>

          <div className="support-suggested">
            {suggested.map((item) => (
              <button key={item} className="support-chip" onClick={() => ask(item)}>
                {item}
              </button>
            ))}
          </div>

          <div className="support-body">
            {messages.map((m, idx) => (
              <div key={`${m.role}-${idx}`} className={`support-msg ${m.role}`}>
                {m.text}
              </div>
            ))}
          </div>

          <form
            className="support-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <input
              className="support-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
            />
            <button className="btn primary support-send" type="submit" disabled={!canSend}>
              Send
            </button>
          </form>
        </section>
      )}
    </>
  );
};

export default SupportBot;

