import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/siteConfig";
import { ArrowLeft, Code2, Terminal, Cpu, FileJson, Sparkles, Server, Key, Layers, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "B Villa Da Nang Developer Portal • API Docs, OpenAPI & MCP Server",
  description:
    "Developer portal and machine-readable interfaces for B Villa Da Nang. Explore the OpenAPI 3.1 specification, Model Context Protocol (MCP) server, and REST API documentation.",
  alternates: {
    canonical: "https://b-villa-dn.vercel.app/docs",
  },
  openGraph: {
    title: "B Villa Da Nang Developer Portal & API Documentation",
    description: "OpenAPI 3.1 spec, MCP server, and REST endpoints for AI agents and developers.",
    url: "https://b-villa-dn.vercel.app/docs",
  },
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#14171A]">
      {/* Top Header */}
      <header className="border-b border-[#EAE5DC] bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-neutral-600 hover:text-[#C2A476] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Trang Chủ</span>
          </Link>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8">
              <Image src="/images/logo.png" alt="B Villa Logo" fill className="object-contain" sizes="32px" />
            </div>
            <span className="font-extrabold tracking-widest uppercase text-sm">{siteConfig.name}</span>
          </Link>
          <a
            href="/openapi.json"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#14171A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#C2A476] transition-colors"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>OpenAPI JSON</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C2A476]/10 text-[#8A6B3D] text-xs font-bold uppercase tracking-[0.2em] mb-4">
          <Code2 className="w-3.5 h-3.5 text-[#C2A476]" />
          <span>Developer Resources • API &amp; Agent Interfaces</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight mb-6">
          B Villa Da Nang Developer Portal &amp; API Documentation
        </h1>

        <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-normal mb-10 border-l-4 border-[#C2A476] pl-5">
          Welcome to the official developer portal for B Villa Da Nang. We provide first-class interfaces for AI agents (Claude, ChatGPT, LangChain, Cursor), travel search engines, and software developers to programmatically discover villas, check availability, calculate seasonal rates, and initiate booking inquiries.
        </p>

        {/* Quick Resource Cards Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6 tracking-tight">
            1. Core Machine-Readable Specifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* OpenAPI Spec Card */}
            <div className="bg-white p-6 rounded-2xl border border-[#EAE5DC] shadow-xs hover:border-[#C2A476] transition-all">
              <FileJson className="w-6 h-6 text-[#C2A476] mb-3" />
              <h3 className="text-lg font-bold text-neutral-900 mb-1">OpenAPI 3.1 Specification</h3>
              <p className="text-xs text-neutral-500 mb-3">
                Full schema definitions for public endpoints: /api/app-data, /api/bookings, /api/prices.
              </p>
              <a
                href="/openapi.json"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C2A476] hover:underline"
              >
                <span>GET /openapi.json</span>
                <span>→</span>
              </a>
            </div>

            {/* MCP Server Card */}
            <div className="bg-white p-6 rounded-2xl border border-[#EAE5DC] shadow-xs hover:border-[#C2A476] transition-all">
              <Cpu className="w-6 h-6 text-[#C2A476] mb-3" />
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Model Context Protocol (MCP)</h3>
              <p className="text-xs text-neutral-500 mb-3">
                Live protocol handshake &amp; tools for AI models: list_villas, check_availability, calculate_price.
              </p>
              <a
                href="/.well-known/mcp"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C2A476] hover:underline"
              >
                <span>GET /.well-known/mcp</span>
                <span>→</span>
              </a>
            </div>

            {/* LLMs.txt Card */}
            <div className="bg-white p-6 rounded-2xl border border-[#EAE5DC] shadow-xs hover:border-[#C2A476] transition-all">
              <BookOpen className="w-6 h-6 text-[#C2A476] mb-3" />
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Agent Instructions (llms.txt)</h3>
              <p className="text-xs text-neutral-500 mb-3">
                Standardized agent discovery file with &quot;When to use this&quot; guidance and properties directory.
              </p>
              <a
                href="/llms.txt"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C2A476] hover:underline"
              >
                <span>GET /llms.txt</span>
                <span>→</span>
              </a>
            </div>

            {/* Markdown Negotiation Card */}
            <div className="bg-white p-6 rounded-2xl border border-[#EAE5DC] shadow-xs hover:border-[#C2A476] transition-all">
              <Terminal className="w-6 h-6 text-[#C2A476] mb-3" />
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Markdown Content Negotiation</h3>
              <p className="text-xs text-neutral-500 mb-3">
                Request Accept: text/markdown on any page to receive structured Markdown bodies with Vary: Accept.
              </p>
              <span className="text-xs font-mono text-neutral-700 font-semibold bg-neutral-100 px-2 py-1 rounded">
                Accept: text/markdown
              </span>
            </div>
          </div>
        </section>

        {/* Section 2: REST API Endpoints */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6 tracking-tight">
            2. REST API Endpoints Reference
          </h2>

          <div className="space-y-6">
            {/* GET /api/app-data */}
            <div className="bg-white p-6 rounded-2xl border border-[#EAE5DC]">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-black uppercase font-mono">
                  GET
                </span>
                <span className="text-sm font-mono font-bold text-neutral-900">/api/app-data</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 mb-3 leading-relaxed">
                Returns the complete public snapshot: all 4 luxury villas, live pricing overrides, calendar booking availability, and site contact details.
              </p>
              <div className="bg-neutral-950 text-neutral-100 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                <p className="text-neutral-400"># Example curl request</p>
                <p>curl -sS https://b-villa-dn.vercel.app/api/app-data</p>
              </div>
            </div>

            {/* POST /api/bookings */}
            <div className="bg-white p-6 rounded-2xl border border-[#EAE5DC]">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-black uppercase font-mono">
                  POST
                </span>
                <span className="text-sm font-mono font-bold text-neutral-900">/api/bookings</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 mb-3 leading-relaxed">
                Submit a new reservation inquiry for a specific villa and stay dates. Returns a confirmed booking ID and concierge follow-up details.
              </p>
              <div className="bg-neutral-950 text-neutral-100 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                <p className="text-neutral-400"># Payload structure</p>
                <p>{`{ "villaId": "b1-villa-4pn", "customerName": "John Doe", "customerPhone": "+84854252821", "checkIn": "2026-11-01", "checkOut": "2026-11-04", "guests": 8 }`}</p>
              </div>
            </div>

            {/* POST /.well-known/mcp */}
            <div className="bg-white p-6 rounded-2xl border border-[#EAE5DC]">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-xs font-black uppercase font-mono">
                  POST / GET
                </span>
                <span className="text-sm font-mono font-bold text-neutral-900">/.well-known/mcp</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 mb-3 leading-relaxed">
                Standard Model Context Protocol (MCP) endpoint supporting protocol handshake (initialize, tools/list, tools/call) and Streamable HTTP.
              </p>
              <div className="bg-neutral-950 text-neutral-100 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                <p className="text-neutral-400"># Initialize handshake</p>
                <p>{`curl -X POST https://b-villa-dn.vercel.app/.well-known/mcp \\`}</p>
                <p>{`  -H "Content-Type: application/json" \\`}</p>
                <p>{`  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{}}}'`}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Authentication & Security */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4 tracking-tight">
            3. Authentication &amp; Security Standards
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">
            All public discovery endpoints (<code className="bg-neutral-100 px-1 py-0.5 rounded text-xs font-mono">/api/app-data</code>, <code className="bg-neutral-100 px-1 py-0.5 rounded text-xs font-mono">/.well-known/mcp</code>, <code className="bg-neutral-100 px-1 py-0.5 rounded text-xs font-mono">/openapi.json</code>) are unauthenticated and openly accessible with rate limiting. Administrative mutation endpoints (<code className="bg-neutral-100 px-1 py-0.5 rounded text-xs font-mono">/api/prices</code>, <code className="bg-neutral-100 px-1 py-0.5 rounded text-xs font-mono">/api/maintenance</code>) require an authenticated session token via cookie or Bearer header.
          </p>
          <div className="bg-white p-6 rounded-2xl border border-[#EAE5DC]">
            <h3 className="text-base font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#C2A476]" />
              <span>Admin Session Headers</span>
            </h3>
            <p className="text-xs text-neutral-600 font-mono">
              Authorization: Bearer bvilla-jwt-secure-[token]
            </p>
          </div>
        </section>

        {/* Section 4: SDK Quickstart */}
        <section className="p-8 rounded-3xl bg-neutral-900 text-white shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
            TypeScript / Python Integration Example
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 mb-4 leading-relaxed">
            Quickly query all available villas and verify current pricing with any HTTP client:
          </p>
          <pre className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs overflow-x-auto text-emerald-400">
{`// TypeScript / JavaScript
const response = await fetch("https://b-villa-dn.vercel.app/api/app-data");
const { villas, prices } = await response.json();
console.log("Found", villas.length, "luxury villas in Da Nang");`}
          </pre>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAE5DC] bg-white py-8 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} B Villa Da Nang. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-[#C2A476]">Trang Chủ</Link>
            <Link href="/about" className="hover:text-[#C2A476]">Giới Thiệu</Link>
            <Link href="/contact" className="hover:text-[#C2A476]">Liên Hệ</Link>
            <Link href="/privacy" className="hover:text-[#C2A476]">Chính Sách Bảo Mật</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
