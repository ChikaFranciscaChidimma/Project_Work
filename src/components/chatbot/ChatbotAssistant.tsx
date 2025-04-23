
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, Maximize2, Minimize2 } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const ChatbotAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your BranchSync sales assistant. How can I help you today?',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);

  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Mock response based on user input
  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('price') || input.includes('cost') || input.includes('pricing')) {
      return "Our pricing plans start at $29/month for small businesses. Would you like me to send you our full pricing details?";
    }
    
    if (input.includes('demo') || input.includes('trial')) {
      return "I'd be happy to set up a free 14-day trial for you! You can also schedule a personalized demo with our team. Would you like me to help with either option?";
    }
    
    if (input.includes('feature') || input.includes('can it') || input.includes('what does')) {
      return "BranchSync offers inventory management, POS, sales analytics, and multi-branch coordination. Which feature would you like to learn more about?";
    }
    
    if (input.includes('thank')) {
      return "You're welcome! Let me know if you have any other questions.";
    }
    
    return "I'm here to help with any questions about BranchSync! You can ask about our features, pricing, or schedule a demo.";
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages([...messages, userMessage]);
    setMessage('');
    
    // Simulate assistant response after a short delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(message),
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (isMinimized) setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary shadow-lg hover:bg-primary/90 z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 shadow-xl transition-all duration-300 z-50 border-border
      ${isMinimized ? 'w-72 h-16' : 'w-80 sm:w-96 h-[500px] max-h-[80vh]'}`}
    >
      <CardHeader className="p-4 border-b flex flex-row justify-between items-center">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 bg-primary">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
          </Avatar>
          <CardTitle className="text-md">Sales Assistant</CardTitle>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-8 w-8 p-0">
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleChatbot} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <>
          <ScrollArea className="flex-1 p-4 h-[380px]" ref={scrollAreaRef}>
            <CardContent className="p-0 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </ScrollArea>
          
          <CardFooter className="p-4 border-t">
            <form onSubmit={handleSend} className="flex w-full space-x-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default ChatbotAssistant;
