import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900 selection:bg-teal-100 selection:text-teal-900">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300">
              AD
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-teal-700 transition-colors">AskDokita</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-teal-600 transition-colors">Features</a>
            <a href="#about" className="hover:text-teal-600 transition-colors">About</a>
            <Link
              href="/chat"
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Try Demo
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-20">
        <section className="relative px-6 py-24 md:py-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-teal-50/50 rounded-full blur-3xl -z-10 opacity-60"></div>
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-50/30 rounded-full blur-3xl -z-10 opacity-40"></div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Your Personal <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Health Assistant.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              AskDokita bridges the healthcare gap with AI-powered, medically grounded guidance for underserved communities.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link
                href="/chat"
                className="px-8 py-4 bg-teal-600 text-white text-lg font-semibold rounded-xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 hover:shadow-2xl hover:shadow-teal-600/30 transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Start Chatting
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <a
                href="#about"
                className="px-8 py-4 bg-white border border-gray-200 text-gray-700 text-lg font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md flex items-center justify-center"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 bg-white relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why AskDokita?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Built to be reliable, accessible, and secure for everyone, everywhere.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Verified Information",
                  desc: "All answers are grounded in data from trusted organizations like WHO and Africa CDC.",
                  icon: (
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  ),
                  color: "bg-teal-50"
                },
                {
                  title: "SMS & USSD Support",
                  desc: "Accessible on any device, even without internet, via our Africa's Talking integration.",
                  icon: (
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                  ),
                  color: "bg-blue-50"
                },
                {
                  title: "Private & Secure",
                  desc: "Your health queries are private. We prioritize user anonymity and data security.",
                  icon: (
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  ),
                  color: "bg-purple-50"
                }
              ].map((feature, i) => (
                <div key={i} className="group bg-gray-50 p-8 rounded-3xl hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section (Unified) */}
        <section id="about" className="py-24 px-6 bg-gray-900 text-white relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-900/20 rounded-full blur-3xl -z-10"></div>

          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Bridging the Healthcare Gap</h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  Many people, especially in rural areas, lack quick access to trustworthy health information.
                  They face challenges like poor internet connectivity, limited availability of health workers,
                  and language barriers.
                </p>
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-2">Open Source Project</h3>
                  <p className="text-gray-400 mb-4">
                    AskDokita is a community-driven initiative. We believe in open access to health technology.
                    Developers, doctors, and designers are welcome to contribute.
                  </p>
                  <a
                    href="https://github.com/niyeldeii/AskDokita"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-medium transition-colors"
                  >
                    Contribute on GitHub
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </a>
                </div>
              </div>

              <div className="bg-gray-800 rounded-3xl p-8 md:p-10 border border-gray-700 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">How It Works</h3>
                <ul className="space-y-6">
                  {[
                    { label: "Gemini API", text: "Acts as the chatbot’s brain, understanding questions and generating clear responses." },
                    { label: "Vector Database", text: "Stores trusted health resources (WHO, CDC, etc.) for fact-checking." },
                    { label: "Google Search", text: "Adds safe, real-time web search when extra context is needed." },
                    { label: "SMS Integration", text: "Allows people in rural areas to use AskDokita via text message." }
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                      </div>
                      <div>
                        <strong className="text-white block mb-1">{item.label}</strong>
                        <span className="text-gray-400 text-sm leading-relaxed">{item.text}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white py-12 px-6 border-t border-gray-100">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                AD
              </div>
              <span className="text-lg font-bold text-gray-900">AskDokita</span>
            </div>

            <div className="flex gap-8 text-sm font-medium text-gray-500">
              <a href="https://github.com/niyeldeii/AskDokita" target="_blank" rel="noopener noreferrer" className="hover:text-teal-600 transition-colors flex items-center gap-2">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                GitHub
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
            <p>© 2025 AskDokita. Not a substitute for professional medical advice.</p>
          </div>
        </footer>
    </div>
  );
}
