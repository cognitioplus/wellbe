// src/App.tsx
import { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="font-[Roboto_Condensed]">
      {/* Header */}
      <header className="bg-[#c80ec9] border-b border-[#b425aa] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              🌱
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#f3e329] font-[Oswald]">Well-Be</h1>
              <p className="text-xs text-white">by Cognitio+</p>
            </div>
          </div>
          <button className="md:hidden text-white hover:bg-[#b425aa] p-2 rounded">
            ☰
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-900 to-pink-800 text-white text-center py-16 px-6">
        <h1 className="text-4xl font-bold font-[Oswald] mb-4">Be Well. Be Source.</h1>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Every mood you log is a step back to the Source — and a leap forward for humanity.
        </p>
        <button 
          onClick={() => setActiveTab('tracker')}
          className="bg-[#b425aa] hover:bg-[#b425aa]/90 font-[Montserrat] font-semibold px-8 py-3 rounded-md"
        >
          Start Your Journey
        </button>
      </section>

      {/* Dashboard Preview */}
      {activeTab === 'tracker' && (
        <section className="py-12 px-6 max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800 font-[Oswald]">
            Your Wellness Dashboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-[Oswald] text-[#c80ec9]">HRV Score</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-[#b425aa] h-2.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="mt-2 text-2xl font-bold">68</p>
              <p className="text-sm text-gray-500">Good recovery</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-[Oswald] text-blue-600">Sleep Quality</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '72%' }}></div>
              </div>
              <p className="mt-2 text-2xl font-bold">7.2 hrs</p>
              <p className="text-sm text-gray-500">Deep sleep improved</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-[Oswald] text-orange-600">Energy Level</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <p className="mt-2 text-2xl font-bold">60%</p>
              <p className="text-sm text-gray-500">Recharge with rest</p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="text-center py-8 text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} Cognitio+. Join the <strong>One Billion Returning</strong>.</p>
      </footer>
    </div>
  );
}
