import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import InventoryContext from "../context/InventoryContext";
import OrdersContext from "../context/OrdersContext";
import SuppliersContext from "../context/SuppliersContext";
import BomContext from "../context/BomContext";
import ProductionContext from "../context/ProductionContext";
import CustomerOrdersContext from "../context/CustomerOrdersContext";
import { answerQuery } from "../utils/assistant";

const SUGGESTIONS = [
  "Which materials are low?",
  "How many can we build?",
  "What's at risk?",
  "Which supplier is risky?",
  "What's the bottleneck?",
];

const Assistant = () => {
  const { products = [] } = useContext(InventoryContext);
  const { orders = [] } = useContext(OrdersContext);
  const { suppliers = [] } = useContext(SuppliersContext);
  const { boms = [] } = useContext(BomContext);
  const { productions = [] } = useContext(ProductionContext);
  const { customerOrders = [] } = useContext(CustomerOrdersContext);

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi, I'm the StockPro Assistant. Ask me about stock, production, risks, or suppliers. My answers come straight from your live data.",
    },
  ]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const data = { products, orders, suppliers, boms, productions, customerOrders };

  const send = (text) => {
    const query = text.trim();
    if (!query) return;
    let answer;
    try {
      answer = answerQuery(query, data);
    } catch (err) {
      console.error(err);
      answer = `Sorry, that answer failed: ${err.message}`;
    }
    setMessages((prev) => [...prev, { from: "user", text: query }, { from: "bot", text: answer }]);
    setInput("");
  };

  const location = useLocation();
  const autoSent = useRef(false);

  useEffect(() => {
    const q = location.state?.q;
    if (q && !autoSent.current) {
      autoSent.current = true;
      send(q);
      window.history.replaceState({}, "");
    }
  }, []);

  return (
    <section className="ai pg">
      <header className="pg-head">
        <div>
          <h1>AI Assistant</h1>
          <p>Ask questions about your operations. Answers come from real data, not guesses.</p>
        </div>
        <span className="pg-pill good">● Live data</span>
      </header>

      <div className="ai-shell">
        <div className="ai-chat" ref={chatRef}>
          {messages.map((m, i) => (
            <div key={i} className={`ai-msg ${m.from}`}>
              <span className="ai-av">{m.from === "bot" ? "AI" : "You"}</span>
              <div className="ai-bubble">{m.text}</div>
            </div>
          ))}
        </div>

        <div className="ai-chips">
          {SUGGESTIONS.map((s) => (
            <button type="button" key={s} onClick={() => send(s)}>{s}</button>
          ))}
        </div>

        <div className="ai-input">
          <input
            type="text"
            placeholder="Ask about stock, production, risk, suppliers..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
          />
          <button type="button" className="pg-primary" onClick={() => send(input)}>Send</button>
        </div>
      </div>
    </section>
  );
};

export default Assistant;