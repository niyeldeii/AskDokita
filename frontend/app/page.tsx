import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            AD
          </div>
          <span className="text-2xl font-bold text-teal-900">AskDokita</span>
        </div>
        <nav className="hidden md:flex space-x-8 text-gray-600 font-medium">
          <a href="#features" className="hover:text-teal-600 transition-colors">Features</a>
          <a href="#about" className="hover:text-teal-600 transition-colors">About</a>
          <Link href="/chat" className="text-teal-600 hover:text-teal-700">Try Demo</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="px-6 py-20 md:py-32 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            Your AI Health Assistant for <span className="text-teal-600">Verified Answers</span>.
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            AskDokita provides accurate, grounded health information to underserved communities.
            Powered by AI, verified by global health standards.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/chat"
              className="px-8 py-4 bg-teal-600 text-white text-lg font-semibold rounded-full hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Chatting Now
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-gray-100 text-gray-700 text-lg font-semibold rounded-full hover:bg-gray-200 transition-all"
            >
              Learn More
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-gray-50 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">Why AskDokita?</h2>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Verified Information</h3>
                <p className="text-gray-600">All answers are grounded in data from trusted organizations like WHO and Africa CDC.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">SMS & USSD Support</h3>
                <p className="text-gray-600">Accessible on any device, even without internet, via our Africa's Talking integration.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Private & Secure</h3>
                <p className="text-gray-600">Your health queries are private. We prioritize user anonymity and data security.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-10 border-t border-gray-100 text-center text-gray-500 text-sm">
        <p>© 2025 AskDokita. All rights reserved.</p>
        <p className="mt-2">Not a substitute for professional medical advice.</p>
      </footer>
    </div>
  );
}
