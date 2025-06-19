// components/SalesAssistant.tsx
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { queryChatbot } from '../../../services/api';

interface ChatMessage {
  type: 'user' | 'assistant' | 'error';
  message: string;
  data?: any;
  timestamp: Date;
}

const SalesAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWide, setIsWide] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([
    { 
      type: 'assistant', 
      message: "Hello! I'm your BranchSync assistant. Ask me about inventory, orders, or sales.", 
      timestamp: new Date() 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
  if (!message.trim() || isLoading) return;
  
  const userMessage = message.trim();
  setMessage('');
  setChat(prev => [...prev, {
    type: 'user',
    message: userMessage,
    timestamp: new Date()
  }]);
  setIsLoading(true);

  try {
    if (!user) throw new Error('Please log in to use the assistant');
    const branch = user.role === 'admin' ? (user.branchName || '') : user.branchName;
    const role = user.role;

    const response = await queryChatbot(userMessage, branch, role);
    
    setChat(prev => [...prev, {
      type: 'assistant',
      message: response.response,
      data: response.data,
      timestamp: new Date()
    }]);
  } catch (error) {
    setChat(prev => [...prev, {
      type: 'error',
      message: error.message || 'Failed to get response from assistant',
      timestamp: new Date()
    }]);
  } finally {
    setIsLoading(false);
  }
};

  const formatData = (data: any) => {
  if (!data) return null;
  
  // Format inventory data
  if (data.summary && data.topProducts) {
    return (
      <div className="mt-2 text-sm space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-50 p-2 rounded">
            <div className="font-medium">In Stock</div>
            <div>{data.summary.inStock}</div>
          </div>
          <div className="bg-yellow-50 p-2 rounded">
            <div className="font-medium">Low Stock</div>
            <div>{data.summary.lowStock}</div>
          </div>
          <div className="bg-red-50 p-2 rounded">
            <div className="font-medium">Out of Stock</div>
            <div>{data.summary.outOfStock}</div>
          </div>
          <div className="bg-blue-50 p-2 rounded">
            <div className="font-medium">Total Value</div>
            <div>${data.summary.totalValue.toFixed(2)}</div>
          </div>
        </div>
        
        {data.topProducts.length > 0 && (
          <div className="mt-2">
            <div className="font-medium">Top Products:</div>
            <ul className="space-y-1">
              {data.topProducts.map((p: any, i: number) => (
                <li key={i} className="flex justify-between">
                  <span>{p.name}</span>
                  <span>${(p.price * p.stock).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
  
  // Format order data
  if (data.summary && data.recentOrders) {
    return (
      <div className="mt-2 text-sm space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-50 p-2 rounded">
            <div className="font-medium">Orders</div>
            <div>{data.summary.totalOrders}</div>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <div className="font-medium">Revenue</div>
            <div>${data.summary.totalRevenue.toFixed(2)}</div>
          </div>
          <div className="bg-purple-50 p-2 rounded">
            <div className="font-medium">Avg. Order</div>
            <div>${data.summary.avgOrderValue.toFixed(2)}</div>
          </div>
        </div>
        
        {data.recentOrders.length > 0 && (
          <div className="mt-2">
            <div className="font-medium">Recent Orders:</div>
            <ul className="space-y-1">
              {data.recentOrders.map((o: any, i: number) => (
                <li key={i} className="flex justify-between">
                  <span>#{o.orderId}</span>
                  <span>${o.total.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
  
  // Format sales data
  if (data.period && data.trend) {
    return (
      <div className="mt-2 text-sm space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-50 p-2 rounded">
            <div className="font-medium">Total</div>
            <div>${data.totalSales.toFixed(2)}</div>
          </div>
          <div className="bg-blue-50 p-2 rounded">
            <div className="font-medium">Daily Avg.</div>
            <div>${data.dailyAverage.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="font-medium">Trend:</div>
          <ul className="space-y-1">
            {data.trend.map((s: any, i: number) => (
              <li key={i} className="flex justify-between">
                <span>{data.period} {s._id}</span>
                <span>${s.total.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  
  return <pre className="text-xs mt-2">{JSON.stringify(data, null, 2)}</pre>;
};

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className={`${isWide ? 'w-[600px]' : 'w-[300px] md:w-[400px]'} h-[500px] flex flex-col transition-all duration-300`}>
          <div className="p-4 border-b bg-primary text-primary-foreground flex justify-between items-center">
            <h3 className="font-semibold">BranchSync Assistant</h3>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsWide(!isWide)}
                className="text-primary-foreground hover:bg-primary/90"
              >
                {isWide ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary/90"
              >
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
                    : msg.type === 'error'
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-muted'
                }`}>
                  <div>{msg.message}</div>
                  {msg.data && formatData(msg.data)}
                  <div className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-2 bg-muted max-w-[80%]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t flex gap-2">
            <Textarea
              className="h-10 resize-none"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
            />
            <Button 
              size="icon" 
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </Card>
      ) : (
        <Button 
          className="rounded-full h-12 w-12 shadow-lg"
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