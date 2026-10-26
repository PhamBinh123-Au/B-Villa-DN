const fs = require('fs');

const html = fs.readFileSync('.next/server/app/index.html', 'utf8');

const text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                 .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                 .replace(/<[^>]+>/g, ' ')
                 .replace(/\s+/g, ' ')
                 .trim();

console.log('Total HTML length:', html.length);
console.log('Text content length:', text.length);
console.log('Content ratio:', ((text.length / html.length) * 100).toFixed(2) + '%');

const villasSection = html.split('id="villas"')[1]?.split('</section>')[0] || '';
const villasText = villasSection.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
console.log('Villas section HTML length:', villasSection.length);
console.log('Villas section text length:', villasText.length);

const faqSection = html.split('id="faq"')[1]?.split('</section>')[0] || '';
const faqText = faqSection.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
console.log('FAQ section HTML length:', faqSection.length);
console.log('FAQ section text length:', faqText.length);
