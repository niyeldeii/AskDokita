import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline flex items-center gap-2 mb-6">
            ← Back to Chat
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About AskDokita</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Bridging the gap in healthcare access for underserved communities.
          </p>
        </div>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Why We Built It</h2>
            <p className="leading-relaxed">
              Many people, especially in rural areas, lack quick access to trustworthy health information.
              They face challenges like poor internet connectivity, limited availability of health workers,
              and language barriers. <strong>AskDokita</strong> helps close that gap by offering a friendly,
              reliable, and easy-to-use platform for learning about symptoms, prevention tips, and general health guidance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">How It Works</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Gemini API:</strong> Acts as the chatbot’s brain, understanding questions and generating clear responses.</li>
              <li><strong>Vector Database:</strong> Stores trusted health resources (WHO, CDC, etc.) for fact-checking.</li>
              <li><strong>Google Search Grounding:</strong> Adds safe, real-time web search when extra context is needed.</li>
              <li><strong>SMS (Twilio):</strong> Allows people in rural areas to use AskDokita via text message, accessible even with limited internet.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Impact</h2>
            <p className="leading-relaxed">
              AskDokita supports public health education and outreach programs by delivering verified information
              in a simple, conversational way. We aim to improve health literacy, increase early detection of diseases,
              and empower individuals to make safe health decisions across Nigeria and Africa.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Open Source Project •
              <a
                href="https://github.com/niyeldeii/AskDokita"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                View on GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
