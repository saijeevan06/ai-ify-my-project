// Builds the growth-plan deck from the slide PNGs exported at /deck (dev server).
//   1. npm run dev → open /deck → “Export slides”
//   2. npm run deck
// Outputs: public/plan/Growth-Plan.pdf (served by the site), deliverables/Growth-Plan.pdf + .pptx
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';
import PptxGenJS from 'pptxgenjs';

const slides = [];
for (let i = 1; existsSync(`deliverables/slides/slide-${i}.png`); i++) slides.push(`deliverables/slides/slide-${i}.png`);
if (!slides.length) {
  console.error('No slides found in deliverables/slides/. Export them from /deck first.');
  process.exit(1);
}

// PDF — 16:9 pages (960×540 pt), one full-bleed image per slide.
const pdf = await PDFDocument.create();
pdf.setTitle('AI-ify My Project — 7-day growth plan');
pdf.setSubject('500 final-year registrations in 7 days on ₹2,000');
for (const file of slides) {
  const img = await pdf.embedPng(readFileSync(file));
  const page = pdf.addPage([960, 540]);
  page.drawImage(img, { x: 0, y: 0, width: 960, height: 540 });
}
const bytes = await pdf.save();
mkdirSync('public/plan', { recursive: true });
writeFileSync('public/plan/Growth-Plan.pdf', bytes);
copyFileSync('public/plan/Growth-Plan.pdf', 'deliverables/Growth-Plan.pdf');

// PPTX — 13.33×7.5 in widescreen, same slides as full-bleed images.
const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.title = 'AI-ify My Project — 7-day growth plan';
for (const file of slides) {
  const s = pptx.addSlide();
  s.addImage({ data: `data:image/png;base64,${readFileSync(file).toString('base64')}`, x: 0, y: 0, w: 13.333, h: 7.5 });
}
await pptx.writeFile({ fileName: 'deliverables/Growth-Plan.pptx' });

console.log(`Built ${slides.length} slides → public/plan/Growth-Plan.pdf, deliverables/Growth-Plan.pdf, deliverables/Growth-Plan.pptx`);
