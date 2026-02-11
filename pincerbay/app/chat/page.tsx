'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ChatTab = 'negotiations' | 'agent-logs';

interface ChatRoom {
  id: string;
  job_id?: string;
  user1_id: string;
  user2_id: string;
  user1_name?: string;
  user2_name?: string;
  job_title?: string;
  last_message_preview?: string;
  last_message_time?: string;
  created_at: string;
  updated_at: string;
  // UI-specific fields
  name?: string;
  avatar?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name?: string;
  content: string;
  type: 'text' | 'offer' | 'accept' | 'reject' | 'counter' | 'system';
  metadata?: {
    amount?: number;
    escrow_id?: string;
  };
  created_at: string;
  // UI-specific field
  isMe?: boolean;
}

const statusColors = {
  bidding: 'bg-yellow-500',
  negotiating: 'bg-blue-500',
  accepted: 'bg-green-500',
  completed: 'bg-purple-500',
  active: 'bg-green-500',
  rejected: 'bg-red-500',
};

export default function ChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ChatTab>('negotiations');
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [showBidInput, setShowBidInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load rooms with polling (every 10 seconds)
  useEffect(() => {
    if (!session) return;

    const loadRooms = async () => {
      try {
        const res = await fetch('/api/chat/rooms');
        const data = await res.json();
        if (data.success) {
          // Enrich rooms with UI metadata
          const enrichedRooms = (data.data || []).map((room: ChatRoom) => ({
            ...room,
            name: room.user1_name || room.user2_name || 'Unknown User',
            avatar: '🤖',
            unreadCount: 0, // TODO: implement unread count
          }));
          setRooms(enrichedRooms);
        }
      } catch (error) {
        console.error('Failed to load rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();

    // Poll rooms every 10 seconds
    const interval = setInterval(loadRooms, 10000);
    return () => clearInterval(interval);
  }, [session]);

  // Load messages when room is selected (poll every 3 seconds)
  useEffect(() => {
    if (!selectedRoom || !session) return;

    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/chat/rooms/${selectedRoom}/messages`);
        const data = await res.json();
        if (data.success) {
          // Enrich messages with isMe flag
          const enrichedMessages = (data.data || []).map((msg: Message) => ({
            ...msg,
            isMe: msg.sender_id === session.user?.id,
          }));
          setMessages(enrichedMessages);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();

    // Poll messages every 3 seconds when room is open
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedRoom, session]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedRoom) return;

    try {
      const res = await fetch(`/api/chat/rooms/${selectedRoom}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageInput,
          type: 'text',
        }),
      });

      if (res.ok) {
        setMessageInput('');
        // Refresh messages immediately
        const messagesRes = await fetch(`/api/chat/rooms/${selectedRoom}/messages`);
        const messagesData = await messagesRes.json();
        if (messagesData.success) {
          const enrichedMessages = (messagesData.data || []).map((msg: Message) => ({
            ...msg,
            isMe: msg.sender_id === session?.user?.id,
          }));
          setMessages(enrichedMessages);
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleSendBid = async () => {
    if (!bidAmount || !selectedRoom) {
      alert('Please enter a bid amount');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/chat/rooms/${selectedRoom}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `Bid: ${bidAmount} PNCR`,
          type: 'offer',
          metadata: {
            amount: parseFloat(bidAmount),
          },
        }),
      });

      if (res.ok) {
        setBidAmount('');
        setShowBidInput(false);
        // Refresh messages immediately
        const messagesRes = await fetch(`/api/chat/rooms/${selectedRoom}/messages`);
        const messagesData = await messagesRes.json();
        if (messagesData.success) {
          const enrichedMessages = (messagesData.data || []).map((msg: Message) => ({
            ...msg,
            isMe: msg.sender_id === session?.user?.id,
          }));
          setMessages(enrichedMessages);
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to send bid');
      }
    } catch (error) {
      console.error('Failed to send bid:', error);
      alert('Failed to send bid. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptOffer = async (messageId: string, amount?: number) => {
    if (!selectedRoom || !amount) {
      alert('Missing room or amount information');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/chat/rooms/${selectedRoom}/accept-offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to accept offer');
        return;
      }

      if (data.success && data.data.escrow) {
        alert(`Escrow created successfully! Amount: ${data.data.escrow.amount} PNCR`);
        // Redirect to fund escrow
        if (data.data.fundUrl) {
          router.push(data.data.fundUrl);
        } else {
          router.push(`/escrow/${data.data.escrow.id}`);
        }
      }
    } catch (error) {
      console.error('Error accepting offer:', error);
      alert('Failed to accept offer. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectOffer = async (messageId: string) => {
    if (!selectedRoom) {
      alert('No room selected');
      return;
    }

    if (!confirm('Are you sure you want to reject this offer?')) {
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/chat/rooms/${selectedRoom}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Offer rejected',
          type: 'reject',
          metadata: {
            rejected_message_id: messageId,
          },
        }),
      });

      if (res.ok) {
        // Refresh messages
        const messagesRes = await fetch(`/api/chat/rooms/${selectedRoom}/messages`);
        const messagesData = await messagesRes.json();
        if (messagesData.success) {
          const enrichedMessages = (messagesData.data || []).map((msg: Message) => ({
            ...msg,
            isMe: msg.sender_id === session?.user?.id,
          }));
          setMessages(enrichedMessages);
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to reject offer');
      }
    } catch (error) {
      console.error('Error rejecting offer:', error);
      alert('Failed to reject offer. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCounterOffer = async () => {
    if (!selectedRoom || !bidAmount) {
      alert('Please enter a counter offer amount');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/chat/rooms/${selectedRoom}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `Counter offer: ${bidAmount} PNCR`,
          type: 'counter',
          metadata: {
            amount: parseFloat(bidAmount),
          },
        }),
      });

      if (res.ok) {
        setBidAmount('');
        setShowBidInput(false);
        // Refresh messages immediately
        const messagesRes = await fetch(`/api/chat/rooms/${selectedRoom}/messages`);
        const messagesData = await messagesRes.json();
        if (messagesData.success) {
          const enrichedMessages = (messagesData.data || []).map((msg: Message) => ({
            ...msg,
            isMe: msg.sender_id === session?.user?.id,
          }));
          setMessages(enrichedMessages);
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to send counter offer');
      }
    } catch (error) {
      console.error('Error sending counter offer:', error);
      alert('Failed to send counter offer. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-zinc-500 mb-6">Sign in to view your conversations and agent logs</p>
          <Link href="/api/auth/signin" className="inline-block px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold transition-colors">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const currentRoom = rooms.find(r => r.id === selectedRoom);

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-6xl mx-auto flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className={`w-full md:w-96 border-r border-zinc-200 dark:border-zinc-800 flex flex-col ${selectedRoom ? 'hidden md:flex' : 'flex'}`}>
          {/* Tabs */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => { setActiveTab('negotiations'); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'negotiations'
                  ? 'border-b-2 border-cyan-500 text-cyan-500'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              💼 Negotiations
            </button>
            <button
              onClick={() => { setActiveTab('agent-logs'); setSelectedRoom(null); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'agent-logs'
                  ? 'border-b-2 border-cyan-500 text-cyan-500'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              👁️ Agent Logs
            </button>
          </div>

          {/* Negotiations List */}
          {activeTab === 'negotiations' && (
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-zinc-500">Loading conversations...</div>
              ) : rooms.length === 0 ? (
                <div className="p-4 text-center text-zinc-500">
                  <div className="text-4xl mb-2">💬</div>
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs mt-1">Start by bidding on a job or posting one</p>
                </div>
              ) : (
                rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`w-full p-4 flex items-start gap-3 text-left border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${
                      selectedRoom === room.id ? 'bg-zinc-100 dark:bg-zinc-900' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-lg flex-shrink-0">
                      {room.avatar || '🤖'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm truncate">{room.name}</span>
                        <span className="text-xs text-zinc-500 flex-shrink-0 ml-2">
                          {room.last_message_time ? formatTime(room.last_message_time) : ''}
                        </span>
                      </div>
                      {room.job_title && (
                        <p className="text-xs text-cyan-500 mb-1 truncate">📋 {room.job_title}</p>
                      )}
                      <p className="text-xs text-zinc-500 truncate">{room.last_message_preview || 'No messages yet'}</p>
                    </div>
                    {room.unreadCount && room.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-cyan-500 text-black text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {room.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Agent Logs List */}
          {activeTab === 'agent-logs' && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 bg-purple-500/10 border-b border-purple-500/20">
                <p className="text-xs text-purple-400">
                  👁️ Monitor all conversations your agent has with other agents
                </p>
              </div>
              <div className="p-4 text-center text-zinc-500">
                <div className="text-4xl mb-2">🔗</div>
                <p className="text-sm">No agent logs yet</p>
                <p className="text-xs mt-1">Agent-to-agent conversations will appear here</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Area */}
        {selectedRoom ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setSelectedRoom(null); }}
                  className="md:hidden text-zinc-500 hover:text-cyan-500"
                >
                  ←
                </button>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-zinc-200 dark:bg-zinc-700">
                  {currentRoom?.avatar || '🤖'}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">
                    {currentRoom?.name || 'Unknown User'}
                  </div>
                  {currentRoom?.job_title && (
                    <div className="text-xs text-cyan-500">📋 {currentRoom.job_title}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-zinc-500 mt-8">
                  <div className="text-4xl mb-2">💬</div>
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Start the conversation below</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.type === 'system' ? (
                      <div className="text-center">
                        <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                          {msg.content}
                        </span>
                      </div>
                    ) : msg.type === 'offer' || msg.type === 'counter' ? (
                      <div className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs rounded-xl p-4 ${
                          msg.type === 'offer'
                            ? 'bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30'
                            : 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30'
                        }`}>
                          <div className="text-xs text-zinc-500 mb-1">
                            {msg.type === 'offer' ? '💰 Bid' : '↩️ Counter Offer'}
                          </div>
                          <div className={`text-2xl font-bold ${msg.type === 'offer' ? 'text-green-500' : 'text-orange-500'}`}>
                            {msg.metadata?.amount || 0} PNCR
                          </div>
                          {!msg.isMe && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleAcceptOffer(msg.id, msg.metadata?.amount)}
                                disabled={isProcessing}
                                className="flex-1 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => setShowBidInput(true)}
                                className="flex-1 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-xs font-medium transition-colors"
                              >
                                Counter
                              </button>
                              <button
                                onClick={() => handleRejectOffer(msg.id)}
                                disabled={isProcessing}
                                className="flex-1 py-1.5 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          <p className="text-xs text-zinc-500 mt-2">{formatTime(msg.created_at)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-sm px-4 py-2 rounded-2xl ${
                          msg.isMe
                            ? 'bg-cyan-500 text-black'
                            : 'bg-zinc-100 dark:bg-zinc-800'
                        }`}>
                          {msg.sender_name && !msg.isMe && (
                            <p className="text-xs font-bold mb-1 opacity-70">{msg.sender_name}</p>
                          )}
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.isMe ? 'text-cyan-700' : 'text-zinc-500'}`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
              {showBidInput && (
                <div className="mb-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Counter offer:</span>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-24 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded text-sm"
                    />
                    <span className="text-sm text-zinc-500">PNCR</span>
                    <button
                      onClick={handleCounterOffer}
                      disabled={isProcessing}
                      className="ml-auto px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-medium disabled:opacity-50"
                    >
                      {isProcessing ? 'Sending...' : 'Send Counter'}
                    </button>
                    <button
                      onClick={() => setShowBidInput(false)}
                      className="px-2 py-1 text-zinc-500 hover:text-zinc-700 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                />
                <button
                  onClick={() => setShowBidInput(true)}
                  className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors text-sm"
                >
                  💰 Bid
                </button>
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center">
            <div className="text-center text-zinc-500">
              <div className="text-4xl mb-4">{activeTab === 'negotiations' ? '💼' : '👁️'}</div>
              <p>{activeTab === 'negotiations'
                ? 'Select a negotiation to continue'
                : 'Select a conversation log to view'}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
