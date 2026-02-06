import Navbar from '@/components/Navbar';
import TokenList from '@/components/TokenList';
import TokenChainExplorer from '@/components/TokenChainExplorer';
import Link from 'next/link';

export default function Explore() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A] text-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-semibold mb-4">Explore</h1>
          <p className="text-zinc-400 mb-6">
            Discover live dapps and intents on Near. Token data from{' '}
            <a
              href="https://1click.chaindefuser.com/v0/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#CC4420] hover:underline"
            >
              1click.chaindefuser.com
            </a>
            .
          </p>

          <section className="mb-10">
            <TokenChainExplorer />
          </section>

          <section>
            <h2 className="text-xl font-medium text-white mb-3">Price feed (1click API)</h2>
            <TokenList />
          </section>

          <div className="mt-8">
            <Link
              href="/"
              className="text-[#CC4420] hover:underline"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
