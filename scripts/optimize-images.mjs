import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const imageDir = path.join(process.cwd(), 'public', 'images');

const jobs = [
['hero-01-analiza-360-mobile.webp', 960, 76],
['hero-02-oplacalnosc-mobile.webp', 960, 76],
['hero-03-inwestycja-w-myjnie-mobile.webp', 960, 76],
['hero-04-proces-inwestycji-mobile.webp', 960, 76],

['hero-01-analiza-360-desktop.webp', 1500, 78],
['hero-02-oplacalnosc-desktop.webp', 1500, 78],
['hero-03-inwestycja-w-myjnie-desktop.webp', 1500, 78],
['hero-04-proces-inwestycji-desktop.webp', 1500, 78],

	['hero-analiza-360-inwestycjawmyjnie.webp', 960, 76],
	['hero-analiza-360-panorama-full-inwestycjawmyjnie.webp', 1500, 78],

	// HERO PODSTRON
	['hero-dzialka-pod-myjnie-pion.webp', 900, 76],
	['hero-dzialka-pod-myjnie-poziom.webp', 1500, 78],
	['hero-koszt-myjni-zakres-pion.webp', 900, 76],
	['hero-koszt-myjni-zakres-poziom.webp', 1500, 78],
	['hero-poradnik-inwestora-pion.webp', 900, 76],
	['hero-poradnik-inwestora-poziom.webp', 1500, 78],
	['hero-porownanie-ofert-pion.webp', 900, 76],
	['hero-porownanie-ofert-poziom.webp', 1500, 78],
	['hero-zarabia-myjnia-wynik-pion.webp', 900, 76],
	['hero-zarabia-myjnia-wynik-poziom.webp', 1500, 78],

	['logo-inwestycjawmyjnie-poziome.webp', 700, 82],
	['logo-inwestycjawmyjnie-kolo.webp', 180, 82],
['logo-inwestycjawmyjnie-symbol.webp', 180, 82],

['audience-01-dzialka-potencjal.webp', 760, 76],
['audience-02-koszty-inwestycji.webp', 760, 76],
['audience-03-porownanie-ofert.webp', 760, 76],

['temat-koszt-inwestycji-myjni.webp', 1000, 76],
['temat-oplacalnosc-myjni.webp', 1000, 76],
['temat-lokalizacja-dzialki-pod-myjnie.webp', 1000, 76],
['temat-porownanie-ofert-producentow.webp', 1000, 76],

['audyt-lokalizacji-pion.webp', 760, 76],
['audyt-lokalizacji-panorama.webp', 1400, 76],

['blad-01-wybor-najtanszego-rozwiazania.webp', 900, 76],
['blad-02-niedopasowanie-myjni-do-lokalizacji.webp', 900, 76],
['blad-03-brak-konsultacji-finansowo-podatkowej.webp', 900, 76],
['blad-04-porownywanie-ofert-tylko-po-cenie.webp', 900, 76],
['blad-05-zbieranie-ofert-przed-analiza-dzialki.webp', 900, 76],
['blad-06-slaby-projekt-lub-brak-kontroli-technicznej.webp', 900, 76],

['blad-zbieranie-ofert-pion.webp', 760, 76],
['blad-zbieranie-ofert-poziom.webp', 1200, 76],

['proces-inwestycji-01-sprawdz-dzialke.webp', 900, 76],
['proces-inwestycji-02-okresl-budzet.webp', 900, 76],
['proces-inwestycji-03-skontaktuj-sie-z-projektantem.webp', 900, 76],
['proces-inwestycji-04-porownaj-oferty.webp', 900, 76],
['proces-inwestycji-05-podejmij-decyzje.webp', 900, 76],

['koszt-budowy-budzet-inwestora.webp', 900, 76],
['proces-od-dzialki-do-uruchomienia.webp', 900, 76],
['ryzyko-bledy-inwestora.webp', 900, 76]
];

function kb(bytes) {
return `${Math.round(bytes / 1024)} KB`;
}

for (const [fileName, width, quality] of jobs) {
const inputPath = path.join(imageDir, fileName);

try {
const originalBuffer = await fs.readFile(inputPath);
const beforeSize = originalBuffer.length;

const optimizedBuffer = await sharp(originalBuffer, {
limitInputPixels: false
})
.resize({
width,
withoutEnlargement: true
})
.webp({
quality,
effort: 6
})
.toBuffer();

if (optimizedBuffer.length < beforeSize) {
await fs.writeFile(inputPath, optimizedBuffer);
console.log(`OK   ${fileName}: ${kb(beforeSize)} -> ${kb(optimizedBuffer.length)}`);
} else {
console.log(`SKIP ${fileName}: ${kb(beforeSize)} zostaje, nowy byl wiekszy`);
}
} catch (error) {
console.log(`BLAD ${fileName}: ${error.message}`);
}
}
