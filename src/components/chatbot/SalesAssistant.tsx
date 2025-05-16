
import { useState } from 'react';
import { MessageSquare, Send, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";

const SalesAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isWide, setIsWide] = useState(false);
  const [chat, setChat] = useState<{type: 'user' | 'assistant'; message: string}[]>([
    {type: 'assistant', message: "Hello! I'm your BranchSync sales assistant. How can I help you today?"}
  ]);
  
  const { user } = useAuth();

  const handleSend = () => {
    if (!message.trim()) return;
    
    // Add user message to chat
    setChat(prev => [...prev, {type: 'user', message: message.trim()}]);
    
    // Create bot response based on role and branch access
    const userMessage = message.trim().toLowerCase();
    let botResponse = "";
    
    if (!user) {
      botResponse = "Please log in to access the sales assistant.";
    } else if (user.role === "admin") {
      // Admin has access to all data
      if (userMessage.includes("branch 1") || userMessage.includes("branch1")) {
        botResponse = `Here's the information about Branch 1 you requested. (This is simulated - in a real app, this would fetch Branch 1 data)`;
      } else if (userMessage.includes("branch 2") || userMessage.includes("branch2")) {
        botResponse = `Here's the information about Branch 2 you requested. (This is simulated - in a real app, this would fetch Branch 2 data)`;
      } else if (userMessage.includes("sales") && userMessage.includes("trend")) {
        botResponse = "Based on the sales data across all branches, there's been a 15% increase in revenue this month compared to last month.";
      } else if (userMessage.includes("stock") || userMessage.includes("inventory")) {
        botResponse = "I can access inventory data for all branches. Currently there are 5 products with low stock levels across all branches.";
      } else if (userMessage.includes("absent") || userMessage.includes("attendance")) {
        botResponse = "There are currently 2 staff members absent in Branch 1 and 1 in Branch 2.";
      } else {
        botResponse = "I can provide information about all branches. What specific data would you like to know?";
      }
    } else if (user.role === "branch-manager") {
      // Branch managers can only access their own branch data
      const userBranch = user.branchName || "";
      const otherBranch = userBranch === "Branch 1" ? "Branch 2" : "Branch 1";
      
      if (userMessage.includes(otherBranch.toLowerCase()) || 
          (userBranch === "Branch 1" && (userMessage.includes("branch 2") || userMessage.includes("branch2"))) ||
          (userBranch === "Branch 2" && (userMessage.includes("branch 1") || userMessage.includes("branch1")))) {
        botResponse = `You do not have permission to access data for ${otherBranch}.`;
      } else if (userMessage.includes("sales") && userMessage.includes("today")) {
        botResponse = `Today's sales for ${userBranch} are $1,248.50 (This is simulated data for demonstration).`;
      } else if (userMessage.includes("low") && (userMessage.includes("stock") || userMessage.includes("inventory"))) {
        botResponse = `${userBranch} currently has 3 products with low stock levels: Wireless Keyboard, USB Hub, and Bluetooth Speaker.`;
      } else if (userMessage.includes("attendance") || userMessage.includes("staff")) {
        botResponse = `${userBranch} has 85% staff attendance today. 1 person has called in sick.`;
      } else {
        botResponse = `I can provide information about ${userBranch}. What would you like to know about your branch?`;
      }
    } else {
      // For cashiers or other roles
      botResponse = "I can help with basic sales information. What would you like to know?";
    }
    
    // Add bot response to chat with a small delay to simulate thinking
    setTimeout(() => {
      setChat(prev => [...prev, {type: 'assistant', message: botResponse}]);
    }, 800);
    
    setMessage('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className={`${isWide ? 'w-[600px]' : 'w-[300px] md:w-[400px]'} h-[500px] flex flex-col transition-all duration-300`}>
          <div className="p-4 border-b bg-primary text-primary-foreground flex justify-between items-center">
            <h3 className="font-semibold">Sales Assistant</h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsWide(!isWide)}>
                {isWide ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <span className="sr-only">Close chat</span>
                ✕
              </Button>
            </div>
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
            <Textarea
              className="h-10 resize-none"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            />
            <Button size="icon" onClick={handleSend}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </Card>
      ) : (
        <Button 
          className="rounded-full h-12 w-12"
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
