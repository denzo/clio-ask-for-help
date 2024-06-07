'use client'

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (input.trim() !== '') {
      setMessages([...messages, { text: input, sender: 'user' }]);

      const response = await fetch(`/api/getContext?question=${input}`);
      const data = await response.json();
      
      console.log(response);
      setTimeout(() => {
        setMessages((msgs) => [...msgs, { text: `${data.content}`, sender: 'ai' }]);
      }, 1000);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4">
          <div className="overflow-y-auto h-96">
            {messages.map((message, index) => (
              <div key={index} className={`p-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </span>
              </div>
            ))}
          </div>
          <div className="flex mt-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-2 border rounded-l-lg focus:outline-none bg-white text-black"
              placeholder="Ask something..."
              onKeyPress={(event) => event.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="bg-blue-500 text-white p-2 rounded-r-lg">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}