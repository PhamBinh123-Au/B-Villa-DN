import fs from 'node:fs';
import path from 'node:path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('B VILLA DA NANG - AGENT READINESS VERIFICATION SUITE');
console.log('====================================================\n');

// -----------------------------------------------------------------------------
// Check 1: Agent-Friendly 404s Markdown Generator & Middleware
// -----------------------------------------------------------------------------
console.log('1. Checking Agent-Friendly 404s & Markdown error body...');
const agentMarkdownContent = fs.readFileSync('src/lib/agentMarkdown.ts', 'utf8');
assert(agentMarkdownContent.includes('export const NOT_FOUND_MARKDOWN'), 'NOT_FOUND_MARKDOWN is exported');
assert(agentMarkdownContent.includes('404 Not Found'), 'NOT_FOUND_MARKDOWN contains 404 Not Found header');
assert(agentMarkdownContent.includes('llms.txt'), 'NOT_FOUND_MARKDOWN links to llms.txt');
assert(agentMarkdownContent.includes('sitemap.xml'), 'NOT_FOUND_MARKDOWN links to sitemap.xml');
assert(agentMarkdownContent.includes('/docs'), 'NOT_FOUND_MARKDOWN links to docs');

const notFoundBody = agentMarkdownContent.match(/export const NOT_FOUND_MARKDOWN = `([\s\S]*?)`;/)?.[1] || '';
assert(notFoundBody.length >= 20, `Markdown 404 error body has ${notFoundBody.length} chars (requirement >= 20 chars)`);

const middlewareContent = fs.readFileSync('src/middleware.ts', 'utf8');
assert(middlewareContent.includes("status: 404"), 'Middleware handles 404 status for text/markdown');
assert(middlewareContent.includes("'Content-Type': 'text/markdown; charset=utf-8'"), 'Middleware sets Content-Type text/markdown for 404');
assert(middlewareContent.includes("'Vary': 'Accept'"), 'Middleware sets Vary: Accept on 404');

// -----------------------------------------------------------------------------
// Check 2: Content Available Without JavaScript & Sequential Headings
// -----------------------------------------------------------------------------
console.log('\n2. Checking Homepage Content without JS & Content Ratio...');
const indexHtml = fs.readFileSync('.next/server/app/index.html', 'utf8');
const textOnly = indexHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                          .replace(/<[^>]+>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim();

assert(textOnly.length >= 500, `Text content has ${textOnly.length} chars (requirement >= 500 chars)`);
const ratio = (textOnly.length / indexHtml.length) * 100;
assert(ratio >= 5.0, `Content ratio is ${ratio.toFixed(2)}% (requirement >= 5.0%)`);

const h1Match = indexHtml.match(/<h1\b[^>]*>(.*?)<\/h1>/i);
assert(!!h1Match, `Clear H1 found: "${h1Match?.[1]?.replace(/<[^>]+>/g, '').trim()}"`);

const headings = [];
const headingRegex = /<h([1-6])\b[^>]*>(.*?)<\/h\1>/gi;
let hm;
while ((hm = headingRegex.exec(indexHtml)) !== null) {
  headings.push({ level: parseInt(hm[1], 10), text: hm[2].replace(/<[^>]+>/g, '').trim() });
}
assert(headings.length > 10, `Found ${headings.length} structured headings`);
assert(headings[0].level === 1, `First heading is H1`);

// Check sequential progression (never skip a level, e.g. H1 -> H3 is invalid)
let sequential = true;
let previousLevel = 0;
for (const h of headings) {
  if (previousLevel > 0 && h.level > previousLevel + 1) {
    sequential = false;
    console.error(`  Heading level skipped from H${previousLevel} to H${h.level}: ${h.text}`);
  }
  previousLevel = h.level;
}
assert(sequential, 'Heading levels are strictly sequential (no skipped levels)');

// -----------------------------------------------------------------------------
// Check 3: Markdown Content Negotiation (acceptmarkdown.com)
// -----------------------------------------------------------------------------
console.log('\n3. Checking Markdown Content Negotiation (Homepage & Public Pages)...');
assert(middlewareContent.includes("wantsMarkdown"), 'Middleware detects Accept: text/markdown');
assert(middlewareContent.includes("HOMEPAGE_MARKDOWN"), 'Middleware returns HOMEPAGE_MARKDOWN for /');
assert(middlewareContent.includes("'Vary': 'Accept'"), 'Middleware sets Vary: Accept on Markdown responses');
assert(middlewareContent.includes("response.headers.set('Vary'"), 'Middleware sets Vary header including Accept on HTML responses');

// -----------------------------------------------------------------------------
// Check 4 & 6: JSON-LD Structured Data & Organization Schema Completeness
// -----------------------------------------------------------------------------
console.log('\n4 & 6. Checking JSON-LD Structured Data & Organization Completeness...');
const jsonLdMatch = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
assert(!!jsonLdMatch, 'JSON-LD script tag present in homepage HTML head');

let parsedLd = null;
try {
  parsedLd = JSON.parse(jsonLdMatch[1]);
  assert(true, 'JSON-LD is valid JSON');
} catch (e) {
  assert(false, `JSON-LD failed to parse: ${e.message}`);
}

if (parsedLd) {
  const graph = Array.isArray(parsedLd['@graph']) ? parsedLd['@graph'] : [parsedLd];
  const org = graph.find(item => item['@type'] === 'Organization');
  const lodging = graph.find(item => item['@type'] === 'LodgingBusiness');

  assert(!!org, 'Organization entity present in JSON-LD');
  assert(!!lodging, 'LodgingBusiness entity present in JSON-LD');

  if (org) {
    assert(!!org.name, `Organization name present: "${org.name}"`);
    assert(!!org.url, `Organization url present: "${org.url}"`);
    assert(!!org.address, 'Organization address present');
    assert(org.address['@type'] === 'PostalAddress', 'Organization address is PostalAddress');
    assert(!!org.address.streetAddress, `Street address present: "${org.address.streetAddress}"`);
    assert(!!org.contactPoint && org.contactPoint.length > 0, 'Organization contactPoint present');
    const cp = org.contactPoint[0];
    assert(!!cp.telephone, `contactPoint telephone: "${cp.telephone}"`);
    assert(!!cp.contactType, `contactPoint contactType: "${cp.contactType}"`);
    assert(!!org.sameAs && org.sameAs.length > 0, `Organization sameAs present (${org.sameAs.length} channels)`);
  }

  if (lodging) {
    assert(!!lodging.hasOfferCatalog, 'LodgingBusiness contains hasOfferCatalog with villas');
    assert(lodging.hasOfferCatalog.itemListElement.length === 4, 'All 4 villas present in OfferCatalog');
  }
}

// -----------------------------------------------------------------------------
// Check 5: Agent Instruction / When-to-use (llms.txt)
// -----------------------------------------------------------------------------
console.log('\n5. Checking llms.txt & Agent Instruction Guidance...');
assert(fs.existsSync('public/llms.txt'), 'public/llms.txt exists');
const llmsContent = fs.readFileSync('public/llms.txt', 'utf8');
assert(llmsContent.includes('# B Villa Da Nang'), 'llms.txt has standard H1 title');
assert(llmsContent.includes('## When to Use This'), 'llms.txt contains "When to Use This" section');
assert(llmsContent.includes('Best-Fit Use Cases'), 'llms.txt specifies best-fit use cases');
assert(llmsContent.includes('When NOT to Use'), 'llms.txt specifies when not to use');
assert(llmsContent.includes('How an Agent Should Call This Service'), 'llms.txt specifies how agents should call');
assert(llmsContent.includes('.well-known/mcp'), 'llms.txt links to MCP server endpoint');
assert(fs.existsSync('public/llms-full.txt'), 'public/llms-full.txt exists');
assert(fs.existsSync('public/agent-instructions.txt'), 'public/agent-instructions.txt exists');

// -----------------------------------------------------------------------------
// Check 7: Trust Anchor Pages (/about, /contact, /privacy)
// -----------------------------------------------------------------------------
console.log('\n7. Checking Trust Anchor Pages (/about, /contact, /privacy)...');
const aboutHtml = fs.readFileSync('.next/server/app/about.html', 'utf8');
const aboutText = aboutHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                           .replace(/<[^>]+>/g, ' ')
                           .replace(/\s+/g, ' ')
                           .trim();
assert(aboutText.length >= 500, `/about page has ${aboutText.length} text chars (requirement >= 500)`);

const contactHtml = fs.readFileSync('.next/server/app/contact.html', 'utf8');
const contactText = contactHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                               .replace(/<[^>]+>/g, ' ')
                               .replace(/\s+/g, ' ')
                               .trim();
assert(contactText.length >= 500, `/contact page has ${contactText.length} text chars (requirement >= 500)`);

const privacyHtml = fs.readFileSync('.next/server/app/privacy.html', 'utf8');
const privacyText = privacyHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                               .replace(/<[^>]+>/g, ' ')
                               .replace(/\s+/g, ' ')
                               .trim();
assert(privacyText.length >= 500, `/privacy page has ${privacyText.length} text chars (requirement >= 500)`);

// -----------------------------------------------------------------------------
// Check 8: Developer Resource Discoverability
// -----------------------------------------------------------------------------
console.log('\n8. Checking Developer Resource Discoverability...');
assert(fs.existsSync('public/openapi.json'), 'public/openapi.json exists');
assert(fs.existsSync('src/app/docs/page.tsx'), 'src/app/docs/page.tsx exists');
const docsHtml = fs.readFileSync('.next/server/app/docs.html', 'utf8');
assert(docsHtml.includes('B Villa Da Nang Developer Portal'), 'Developer portal has branded title & headings');
assert(docsHtml.includes('OpenAPI 3.1'), 'Developer portal mentions OpenAPI 3.1');
assert(docsHtml.includes('Model Context Protocol'), 'Developer portal mentions MCP');
assert(indexHtml.includes('/docs'), 'Homepage footer links to /docs');
assert(indexHtml.includes('/openapi.json'), 'Homepage footer links to /openapi.json');
assert(indexHtml.includes('/.well-known/mcp'), 'Homepage footer links to /.well-known/mcp');

// -----------------------------------------------------------------------------
// Check 9: Metadata Completeness (Homepage)
// -----------------------------------------------------------------------------
console.log('\n9. Checking Metadata Completeness (canonical, lang, og:image, og:type)...');
assert(indexHtml.includes('<link rel="canonical" href="https://b-villa-dn.vercel.app"/>') || indexHtml.includes('rel="canonical"'), 'Canonical URL link present');
assert(indexHtml.includes('lang="vi"'), 'HTML lang attribute present');
assert(indexHtml.includes('property="og:image"'), 'og:image meta tag present');
assert(indexHtml.includes('property="og:type" content="website"'), 'og:type website meta tag present');

// -----------------------------------------------------------------------------
// Check 10: MCP Server & Manifest Handshake
// -----------------------------------------------------------------------------
console.log('\n10. Checking MCP Server & Manifest Handshake Implementation...');
assert(fs.existsSync('src/app/.well-known/mcp/route.ts'), 'src/app/.well-known/mcp/route.ts exists');
const mcpRouteContent = fs.readFileSync('src/app/.well-known/mcp/route.ts', 'utf8');
assert(mcpRouteContent.includes('export async function GET'), 'MCP route exports GET (manifest & SSE)');
assert(mcpRouteContent.includes('export async function POST'), 'MCP route exports POST (JSON-RPC handshake)');
assert(mcpRouteContent.includes("'initialize'"), 'MCP route implements "initialize" method');
assert(mcpRouteContent.includes("'tools/list'"), 'MCP route implements "tools/list" method');
assert(mcpRouteContent.includes("'tools/call'"), 'MCP route implements "tools/call" method');
assert(mcpRouteContent.includes('text/event-stream'), 'MCP route supports streamable HTTP (text/event-stream)');
assert(fs.existsSync('public/.well-known/mcp/manifest.json'), 'public/.well-known/mcp/manifest.json exists');

console.log('\n====================================================');
console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
