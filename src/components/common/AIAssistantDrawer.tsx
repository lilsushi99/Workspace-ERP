import React, { useState, useRef, useEffect } from 'react';

interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionCard?: {
    title: string;
    details: string[];
    type?: 'revenue' | 'booking' | 'expense' | 'client';
  };
}

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTo?: (page: string) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTo,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Good day. I am your Enterprise Operations & Financial Assistant. How may I assist with your general ledger, facility bookings, or CRM metrics today?',
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const suggestedPrompts = [
    'Show Hive Hub revenue for July',
    "Find Timothy's bookings",
    "Create today's fuel expense",
    'Show my top customers',
  ];

  const handleSendPrompt = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: AIMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Simulate AI response calculation
    setTimeout(() => {
      const lower = queryText.toLowerCase();
      let responseMsg: AIMessage;

      if (lower.includes('hive hub') || lower.includes('july') || lower.includes('revenue')) {
        responseMsg = {
          id: 'ai_' + Date.now(),
          sender: 'assistant',
          text: 'Here is the revenue breakdown for Hive Hub during July 2026:',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionCard: {
            title: 'July Revenue Summary: Hive Hub',
            details: [
              'Total Recognized Revenue: $14,250.00',
              'Total Facility Bookings: 28 Bookings',
              'Average Daily Usage: 6.4 Hours/Day',
              'Highest Yield Week: July 12 - July 18 ($4,800.00)',
            ],
            type: 'revenue',
          },
        };
      } else if (lower.includes('timothy')) {
        responseMsg = {
          id: 'ai_' + Date.now(),
          sender: 'assistant',
          text: 'Found 2 active reservations registered under Timothy (Acme Corp):',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionCard: {
            title: 'Client Reservations: Timothy',
            details: [
              'BK-9021: Hive Hub Executive Suite (Aug 4 - Aug 10) - Confirmed ($1,200)',
              'BK-8840: Innovation Pod B (Aug 15 - Aug 18) - Active ($450)',
              'Contact: timothy@acmecorp.io | +1 (555) 019-2831',
            ],
            type: 'booking',
          },
        };
      } else if (lower.includes('fuel') || lower.includes('expense')) {
        responseMsg = {
          id: 'ai_' + Date.now(),
          sender: 'assistant',
          text: 'I have drafted today\'s Generator & Logistics Fuel Expense voucher for verification:',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionCard: {
            title: 'Draft Expense Voucher #EXP-2026-089',
            details: [
              'Category: Operations & Logistics / Diesel Fuel',
              'Amount: $350.00',
              'Payment Mode: Bank Transfer (Corporate Account)',
              'Status: Approved for Posting to General Ledger',
            ],
            type: 'expense',
          },
        };
      } else if (lower.includes('top customers') || lower.includes('customer') || lower.includes('crm')) {
        responseMsg = {
          id: 'ai_' + Date.now(),
          sender: 'assistant',
          text: 'Top enterprise accounts ranked by total cumulative revenue in 2026:',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionCard: {
            title: 'Top Enterprise Accounts 2026',
            details: [
              '1. Acme Corporation - $42,800.00 (14 Bookings)',
              '2. TechCorp International - $38,500.00 (11 Bookings)',
              '3. Nexus Logistics Ltd - $27,400.00 (9 Bookings)',
              '4. Global Media Group - $19,200.00 (6 Bookings)',
            ],
            type: 'client',
          },
        };
      } else {
        responseMsg = {
          id: 'ai_' + Date.now(),
          sender: 'assistant',
          text: `I have analyzed your request: "${queryText}". You can track detailed analytics under Finance & Reports or search specifically by customer name, facility ID, or ledger voucher.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }

      setMessages((prev) => [...prev, responseMsg]);
      setIsTyping(false);
    }, 800);
  };

  const toggleMic = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setInputQuery('Show Hive Hub revenue for July');
        setIsListening(false);
      }, 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl z-10 flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-200">
        {/* Header - Enterprise Clean Style */}
        <div className="p-4 sm:p-5 border-b border-gray-200/80 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              <i className="fa-solid fa-user-tie text-xs"></i>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 font-heading">
                Enterprise Business Assistant
              </h2>
              <p className="text-[11px] text-gray-500 font-sans">
                Real-time operational queries & ledger intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Conversation Message Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F9FAFB]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none font-medium'
                    : 'bg-white border border-gray-200/80 text-gray-800 rounded-bl-none font-sans'
                }`}
              >
                <p>{msg.text}</p>

                {msg.actionCard && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <p className="font-bold font-heading text-gray-900 text-[11px] flex items-center gap-1.5">
                      <i className="fa-solid fa-chart-line text-blue-600"></i>
                      {msg.actionCard.title}
                    </p>
                    <ul className="space-y-1 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-[11px] text-gray-600 font-mono">
                      {msg.actionCard.details.map((d, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 p-3 bg-white border border-gray-200/80 rounded-2xl rounded-bl-none max-w-[120px]">
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></span>
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Section */}
        <div className="p-3 bg-white border-t border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-1">
            Suggested Business Queries
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(prompt)}
                className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 text-[11px] font-medium rounded-lg border border-gray-200/80 transition-colors cursor-pointer text-left truncate max-w-full"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Microphone Bar */}
        <div className="p-4 bg-white border-t border-gray-200/80 space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputQuery);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about revenue, bookings, clients, or expenses..."
                className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
              />
              <button
                type="button"
                onClick={toggleMic}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  isListening
                    ? 'text-red-600 bg-red-50 animate-pulse'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Voice Input"
              >
                <i className="fa-solid fa-microphone"></i>
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5 shadow-2xs"
            >
              <span>Send</span>
              <i className="fa-solid fa-paper-plane text-[10px]"></i>
            </button>
          </form>

          {/* Business AI Disclaimer as specified in prompt */}
          <div className="text-center">
            <p className="text-[10px] text-gray-400 font-sans">
              AI features are continuously improving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
