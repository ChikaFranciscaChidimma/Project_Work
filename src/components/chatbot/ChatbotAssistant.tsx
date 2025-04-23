
import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    text: "Hello! I'm your BranchSync Sales Assistant. How can I help you today?",
    sender: "bot",
    timestamp: new Date(),
  },
];

const ChatbotAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    
    // Simulate bot response after delay
    setTimeout(() => {
      const botResponses = [
        "I can help you with sales reports and inventory management.",
        "Would you like to see today's sales overview?",
        "Need help with a specific product or branch?",
        "I can assist with customer information and order history.",
        "Let me know if you need help processing a transaction."
      ];
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage: Message = {
        id: Date.now().toString(),
        text: randomResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <>
      {/* Chatbot toggle button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
      >
        <MessageCircle className={cn("h-6 w-6", isOpen && "hidden")} />
        <X className={cn("h-6 w-6", !isOpen && "hidden")} />
      </Button>
      
      {/* Chatbot window */}
      <Card
        className={cn(
          "fixed bottom-24 right-6 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-10rem)] flex flex-col shadow-xl transform transition-all duration-300 ease-in-out z-40",
          isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 bg-primary-foreground text-primary">
              <AvatarFallback>BS</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-sm">Sales Assistant</h3>
              <p className="text-xs opacity-80">BranchSync</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setIsOpen(false)} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </>
  );
};

export default ChatbotAssistant;
