const fs = require('fs');
const path = require('path');
// We will use regex to find form fields instead of cheerio to avoid dependency issues
const htmlPath = path.join('c:/Users/tiend/Desktop/LadyStars/Bảng dữ liệu/Chuyển kho.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Match all label tags
const labels = new Set();
const labelRegex = /<label[^>]*>([\s\S]*?)<\/label>/gi;
let match;
while ((match = labelRegex.exec(html)) !== null) {
  // Strip inner HTML tags
  const text = match[1].replace(/<[^>]*>?/gm, '').trim();
  if (text) {
    labels.add(text);
  }
}

console.log('--- LABELS ---');
console.log(Array.from(labels).join('\n'));

// Let's also look for inputs and their placeholders
const placeholders = new Set();
const inputRegex = /<input[^>]*placeholder=["']([^"']*)["'][^>]*>/gi;
while ((match = inputRegex.exec(html)) !== null) {
  placeholders.add(match[1]);
}
console.log('\n--- PLACEHOLDERS ---');
console.log(Array.from(placeholders).join('\n'));
