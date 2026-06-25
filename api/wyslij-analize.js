import formidable from 'formidable';
import nodemailer from 'nodemailer';
import fs from 'node:fs/promises';
import path from 'node:path';

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const allowedFileExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'docx', 'xlsx'];

export const config = {
	api: {
		bodyParser: false
	}
};

function getFirst(value) {
	if (Array.isArray(value)) {
		return value[0] ?? '';
	}

	return value ?? '';
}

function isChecked(fields, name) {
	const value = getFirst(fields[name]);

	return value === 'on' || value === 'true' || value === 'Tak' || value === 'yes';
}

function escapeHtml(value) {
	return String(value ?? '')
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

function parseForm(request) {
	const form = formidable({
		multiples: false,
		keepExtensions: true,
		allowEmptyFiles: true,
		maxFileSize: MAX_FILE_SIZE,
		maxTotalFileSize: MAX_FILE_SIZE
	});

	return new Promise((resolve, reject) => {
		form.parse(request, (error, fields, files) => {
			if (error) {
				reject(error);
				return;
			}

			resolve({ fields, files });
		});
	});
}

function buildRows(rows) {
	return rows
		.map(([label, value]) => {
			const safeValue = escapeHtml(value || 'â€”').replaceAll('\n', '<br />');

			return `
				<tr>
					<td style="padding:10px 12px;border-bottom:1px solid #e7edf5;color:#667085;font-weight:700;width:230px;vertical-align:top;">${escapeHtml(label)}</td>
					<td style="padding:10px 12px;border-bottom:1px solid #e7edf5;color:#111827;font-weight:600;vertical-align:top;">${safeValue}</td>
				</tr>
			`;
		})
		.join('');
}

function buildPlainText(rows) {
	return rows.map(([label, value]) => `${label}: ${value || 'â€”'}`).join('\n');
}

export default async function handler(request, response) {
	if (request.method !== 'POST') {
		response.status(405).json({
			ok: false,
			message: 'Metoda niedozwolona.'
		});
		return;
	}

	let uploadedFilePath = null;

	try {
		const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CONTACT_TO'];
		const missingEnv = requiredEnv.filter((key) => !process.env[key]);

		if (missingEnv.length > 0) {
			response.status(500).json({
				ok: false,
				message: `Brakuje konfiguracji wysyĹ‚ki: ${missingEnv.join(', ')}.`
			});
			return;
		}

		const { fields, files } = await parseForm(request);

		const name = getFirst(fields.name).trim();
		const phone = getFirst(fields.phone).trim();
		const email = getFirst(fields.email).trim();
		const businessForm = getFirst(fields.business_form).trim();
		const voivodeship = getFirst(fields.voivodeship).trim();
		const county = getFirst(fields.county).trim();
		const municipality = getFirst(fields.municipality).trim();
		const city = getFirst(fields.city).trim();
		const postalCode = getFirst(fields.postal_code).trim();
		const plotStatus = getFirst(fields.plot_status).trim();
		const washType = getFirst(fields.wash_type).trim();
		const stations = getFirst(fields.stations).trim();
		const openBay = getFirst(fields.open_bay).trim();
		const budget = getFirst(fields.budget).trim();
		const costAcceptance = getFirst(fields.cost_acceptance).trim();
		const financing = getFirst(fields.financing).trim();
		const message = getFirst(fields.message).trim();
		const pageUrl = getFirst(fields.page_url).trim();
		const sentAt = getFirst(fields.sent_at).trim();

		const requiredFields = [
			['ImiÄ™ i nazwisko', name],
			['Telefon', phone],
			['E-mail', email],
			['Forma dziaĹ‚alnoĹ›ci', businessForm],
			['WojewĂłdztwo', voivodeship],
			['Powiat', county],
			['Gmina', municipality],
			['Miasto / miejscowoĹ›Ä‡', city],
			['Kod pocztowy', postalCode],
			['Status dziaĹ‚ki', plotStatus],
			['Typ myjni', washType],
			['Liczba stanowisk', stations],
			['Stanowisko BUS/TIR', openBay],
			['BudĹĽet', budget],
			['Akceptacja kosztĂłw', costAcceptance],
			['Finansowanie', financing]
		];

		const missingFields = requiredFields.filter(([, value]) => !value).map(([label]) => label);

		if (missingFields.length > 0) {
			response.status(400).json({
				ok: false,
				message: `UzupeĹ‚nij wymagane pola: ${missingFields.join(', ')}.`
			});
			return;
		}

		const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

		if (!emailIsValid) {
			response.status(400).json({
				ok: false,
				message: 'Podaj poprawny adres e-mail.'
			});
			return;
		}

		const media = [
			isChecked(fields, 'media_water') ? 'Woda' : '',
			isChecked(fields, 'media_gas') ? 'Gaz' : '',
			isChecked(fields, 'media_power') ? 'PrÄ…d' : '',
			isChecked(fields, 'media_sewage') ? 'Kanalizacja' : '',
			isChecked(fields, 'media_rainwater') ? 'DeszczĂłwka / odwodnienie' : '',
			isChecked(fields, 'media_none') ? 'Brak / do sprawdzenia' : ''
		].filter(Boolean);

		const compare = [
			isChecked(fields, 'compare_price') ? 'Cena i zakres oferty' : '',
			isChecked(fields, 'compare_technology') ? 'Technologia myjni' : '',
			isChecked(fields, 'compare_service') ? 'Serwis i gwarancja' : '',
			isChecked(fields, 'compare_contract') ? 'Dokumentacja i umowa' : ''
		].filter(Boolean);

		if (media.length === 0) {
			response.status(400).json({
				ok: false,
				message: 'Zaznacz przynajmniej jednÄ… opcjÄ™ w sekcji mediĂłw.'
			});
			return;
		}

		if (compare.length === 0) {
			response.status(400).json({
				ok: false,
				message: 'Zaznacz przynajmniej jednÄ… opcjÄ™ w sekcji, co chcesz sprawdziÄ‡.'
			});
			return;
		}

		if (
			!isChecked(fields, 'contact_consent') ||
			!isChecked(fields, 'supplier_transfer_consent') ||
			!isChecked(fields, 'privacy_consent')
		) {
			response.status(400).json({
				ok: false,
				message: 'Zaznacz wszystkie wymagane zgody.'
			});
			return;
		}

		const offerFile = Array.isArray(files.offer_file) ? files.offer_file[0] : files.offer_file;
		const attachments = [];

		if (offerFile && offerFile.size > 0) {
			const originalFilename = offerFile.originalFilename || 'zalacznik';
			const extension = path.extname(originalFilename).replace('.', '').toLowerCase();

			if (!allowedFileExtensions.includes(extension)) {
				response.status(400).json({
					ok: false,
					message: 'ZaĹ‚Ä…cznik ma niedozwolony format.'
				});
				return;
			}

			if (offerFile.size > MAX_FILE_SIZE) {
				response.status(400).json({
					ok: false,
					message: 'ZaĹ‚Ä…cznik jest za duĹĽy. Maksymalny rozmiar pliku to 4 MB.'
				});
				return;
			}

			uploadedFilePath = offerFile.filepath;

			attachments.push({
				filename: originalFilename,
				path: offerFile.filepath,
				contentType: offerFile.mimetype || undefined
			});
		}

		const rows = [
			['Typ zapytania', getFirst(fields.typ_zapytania)],
			['ImiÄ™ i nazwisko', name],
			['Telefon', phone],
			['E-mail', email],
			['Forma dziaĹ‚alnoĹ›ci', businessForm],
			['WojewĂłdztwo', voivodeship],
			['Powiat', county],
			['Gmina', municipality],
			['Miasto / miejscowoĹ›Ä‡', city],
			['Kod pocztowy inwestycji', postalCode],
			['Status dziaĹ‚ki', plotStatus],
			['Media', media.join(', ')],
			['Typ myjni', washType],
			['Liczba stanowisk', stations],
			['Stanowisko niezadaszone BUS/TIR', openBay],
			['BudĹĽet orientacyjny', budget],
			['Akceptacja przybliĹĽonych kosztĂłw', costAcceptance],
			['Finansowanie', financing],
			['Co chce sprawdziÄ‡ inwestor', compare.join(', ')],
			['Opis / link / numer dziaĹ‚ki / oferta', message],
			['Zgoda kontaktowa', isChecked(fields, 'contact_consent') ? 'TAK' : 'NIE'],
			['Zgoda na przekazanie do dostawcĂłw', isChecked(fields, 'supplier_transfer_consent') ? 'TAK' : 'NIE'],
			['Zgoda RODO', isChecked(fields, 'privacy_consent') ? 'TAK' : 'NIE'],
			['Zgoda marketingowa', isChecked(fields, 'marketing_consent') ? 'TAK' : 'NIE'],
			['Administrator danych', getFirst(fields.administrator_danych)],
			['Cel przekazania danych', getFirst(fields.cel_przekazania_danych)],
			['ĹąrĂłdĹ‚o formularza', pageUrl || '/bezplatne-porownanie-ofert-myjni/'],
			['Data wysĹ‚ania', sentAt || new Date().toISOString()],
			['IP / proxy', request.headers['x-forwarded-for'] || 'â€”'],
			['User-Agent', request.headers['user-agent'] || 'â€”']
		];

		const html = `
			<div style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#111827;">
				<div style="max-width:860px;margin:0 auto;padding:28px;">
					<div style="padding:26px;border-radius:24px;background:#ffffff;border:1px solid #e7edf5;">
						<p style="margin:0 0 8px;color:#1268ff;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;">
							Nowe zgĹ‚oszenie z formularza
						</p>

						<h1 style="margin:0;color:#07111f;font-size:28px;line-height:1.1;">
							BezpĹ‚atna analiza i porĂłwnanie ofert myjni
						</h1>

						<p style="margin:12px 0 0;color:#667085;font-size:15px;line-height:1.6;">
							WiadomoĹ›Ä‡ zostaĹ‚a wysĹ‚ana ze strony inwestycjawmyjnie.pl. OdpowiadajÄ…c na tego maila,
							odpowiesz bezpoĹ›rednio do osoby, ktĂłra wypeĹ‚niĹ‚a formularz.
						</p>

						<table style="width:100%;border-collapse:collapse;margin-top:24px;font-size:14px;">
							${buildRows(rows)}
						</table>
					</div>
				</div>
			</div>
		`;

		const text = `Nowe zgĹ‚oszenie z formularza inwestycjawmyjnie.pl\n\n${buildPlainText(rows)}`;

		const transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT),
			secure: String(process.env.SMTP_SECURE ?? 'true') === 'true',
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS
			}
		});

		await transporter.sendMail({
			from: `"Formularz inwestycjawmyjnie.pl" <${process.env.SMTP_USER}>`,
			to: process.env.CONTACT_TO,
			replyTo: `"${name}" <${email}>`,
			subject: `Nowe zgĹ‚oszenie: ${city || voivodeship} â€” ${stations || 'myjnia'}`,
			text,
			html,
			attachments
		});

		response.status(200).json({
			ok: true,
			message: 'DziÄ™kujemy. Formularz zostaĹ‚ wysĹ‚any. OdpowiedĹş otrzymasz z adresu analiza@inwestycjawmyjnie.pl.'
		});
	} catch (error) {
		console.error('BĹ‚Ä…d wysyĹ‚ki formularza:', error);

		response.status(500).json({
			ok: false,
			message: 'Nie udaĹ‚o siÄ™ wysĹ‚aÄ‡ formularza. SprĂłbuj ponownie albo napisz bezpoĹ›rednio na analiza@inwestycjawmyjnie.pl.'
		});
	} finally {
		if (uploadedFilePath) {
			try {
				await fs.unlink(uploadedFilePath);
			} catch {
				// Plik tymczasowy mĂłgĹ‚ zostaÄ‡ juĹĽ usuniÄ™ty przez Ĺ›rodowisko.
			}
		}
	}
}
