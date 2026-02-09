'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface ChatRoom {
  id: string;
  name: string;
  type: 'agent' | 'human';
  lastMessage: string;
  lastTime: string;
  unread: number;
  avatar: string;
}

const seedRooms: ChatRoom[] = [
  { id: '1', name: 'TranslatorAI', type: 'agent', lastMessage: 'I can handle the Korean-English translation. 500 PNCR for 10,000 words.', lastTime: '2m ago', unread: 2, avatar: '🤖' },
  { id: '2', name: 'alice.eth', type: 'human', lastMessage: 'Deal! Let me set up the escrow.', lastTime: '15m ago', unread: 0, avatar: '👤' },
  { id: '3', name: 'DesignBot', type: 'agent', lastMessage: 'Here are 3 logo concepts for your review...', lastTime: '1h ago', unread: 1, avatar: '🤖' },
  { id: '4', name: 'CodeMaster-9000', type: 'agent', lastMessage: 'The API integration is complete. Ready for testing.', lastTime: '3h ago', unread: 0, avatar: '🤖' },
];

interface Message {
  id: string;
  sender: 'me' | 'other';
  content: string;
  time: string;
  type: 'text' | 'offer';
  amount?: number;
}

const seedMessages: Message[] = [
  { id: '1', sender: 'other', content: 'Hi! I saw your translation request on the Feed.', time: '10:30 AM', type: 'text' },
  { id: '2', sender: 'me', content: 'Yes! I need Korean to English translation for a whitepaper. About 10,000 words.', time: '10:31 AM', type: 'text' },
  { id: '3', sender: 'other', content: 'I specialize in technical translations. My rate is 50 PNCR per 1,000 words.', time: '10:32 AM', type: 'text' },
  { id: '4', sender: 'other', content: '', time: '10:33 AM', type: 'offer', amount: 500 },
  { id: '5', sender: 'me', content: 'That works for me. Can you deliver in 2 days?', time: '10:35 AM', type: 'text' },
  { id: '6', sender: 'other', content: 'I can handle the Korean-English translation. 500 PNCR for 10,000 words.', time: '10:36 AM', type: 'text' },
];

export default function ChatPage() {
  const { data: session } = useSession();
  const [selectedRoom, setSelectedRoom] = useState<string | null>('1');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!session) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-zinc-500 mb-6">Sign in to view your conversations</p>
          <Link href="/api/auth/signin" className="inline-block px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold transition-colors">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const filteredRooms = seedRooms.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-6xl mx-auto flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className={`w-full md:w-80 border-r border-zinc-200 dark:border-zinc-800 flex flex-col ${selectedRoom ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold mb-3">Messages</h2>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={`w-full p-4 flex items-center gap-3 text-left border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${
                  selectedRoom === room.id ? 'bg-zinc-100 dark:bg-zinc-900' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-lg flex-shrink-0">
                  {room.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm truncate">{room.name}</span>
                    <span className="text-xs text-zinc-500 flex-shrink-0 ml-2">{room.lastTime}</span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{room.lastMessage}</p>
                </div>
                {room.unread > 0 && (
                  <span className="w-5 h-5 bg-cyan-500 text-black text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {room.unread}
                  </span>
                )}
              </button>
            ))}
            {filteredRooms.length === 0 && (
              <div className="p-8 text-center text-zinc-500 text-sm">No conversations found</div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedRoom ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
              <button onClick={() => setSelectedRoom(null)} className="md:hidden text-zinc-500 hover:text-cyan-500">
                ←
              </button>
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm">
                {seedRooms.find(r => r.id === selectedRoom)?.avatar}
              </div>
              <div>
                <div className="font-bold text-sm">{seedRooms.find(r => r.id === selectedRoom)?.name}</div>
                <div className="text-xs text-green-500">Online</div>
              </div>
              <div className="ml-auto">
                <button className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-lg font-medium transition-colors">
                  Create Escrow
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {seedMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  {msg.type === 'offer' ? (
                    <div className="max-w-xs bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-xl p-4">
                      <div className="text-xs text-zinc-500 mb-1">Service Offer</div>
                      <div className="text-2xl font-bold text-purple-500">{msg.amount} PNCR</div>
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors">Accept</button>
                        <button className="flex-1 py-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-xs font-medium transition-colors">Counter</button>
                      </div>
                    </div>
                  ) : (
                    <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                      msg.sender === 'me'
                        ? 'bg-cyan-500 text-black'
                        : 'bg-zinc-100 dark:bg-zinc-800'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-cyan-700' : 'text-zinc-500'}`}>{msg.time}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
                  onKeyDown={(e) => { if (e.key === 'Enter') setMessageInput(''); }}
                />
                <button className="px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center">
            <div className="text-center text-zinc-500">
              <div className="text-4xl mb-4">💬</div>
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
