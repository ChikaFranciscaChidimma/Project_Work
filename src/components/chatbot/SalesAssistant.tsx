
import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const SalesAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{type: 'user' | 'assistant'; message: string}[]>([
    {type: 'assistant', message: "Hello! I'm your BranchSync sales assistant. How can I help you today?"}
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setChat(prev => [...prev, {type: 'user', message: message.trim()}]);
    setChat(prev => [...prev, {
      type: 'assistant', 
      message: "Thank you for your message. A sales representative will get back to you shortly."
    }]);
    setMessage('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={100} minSize={30}>
            <Card className="w-[300px] md:w-[400px] h-[500px] flex flex-col shadow-lg">
              <div className="p-4 border-b bg-primary text-primary-foreground flex justify-between items-center">
                <h3 className="font-semibold">Sales Assistant</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}
                  className="text-primary-foreground hover:text-primary-foreground/90">
                  <span className="sr-only">Close chat</span>
                  ✕
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {chat.map((msg, i) => (
                  <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      msg.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSend}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <Button 
          className="rounded-full h-12 w-12 shadow-lg hover:shadow-xl transition-all duration-300"
          variant="default"
          size="icon"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
          <span className="sr-only">Open chat</span>
        </Button>
      )}
    </div>
  );
};

export default SalesAssistant;
