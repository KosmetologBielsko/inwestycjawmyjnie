const siteUrl = 'https://inwestycjawmyjnie.pl';

const pages = [
	{
		path: '/',
		priority: '1.0',
		changefreq: 'weekly'
	},
	{
		path: '/poradnik/',
		priority: '0.9',
		changefreq: 'weekly'
	},
	{
		path: '/ile-kosztuje-myjnia-bezdotykowa/',
		priority: '0.8',
		changefreq: 'monthly'
	},
	{
		path: '/ile-zarabia-myjnia-bezdotykowa/',
		priority: '0.8',
		changefreq: 'monthly'
	},
	{
		path: '/dzialka-pod-myjnie-bezdotykowa/',
		priority: '0.8',
		changefreq: 'monthly'
	},
	{
		path: '/jak-porownac-oferty-myjni-bezdotykowej/',
		priority: '0.8',
		changefreq: 'monthly'
	},
	{
		path: '/koszt-budowy-myjni-bezdotykowej/',
		priority: '0.8',
		changefreq: 'monthly'
	},
	{
		path: '/budowa-myjni-bezdotykowej-krok-po-kroku/',
		priority: '0.8',
		changefreq: 'monthly'
	},
	{
		path: '/najczestsze-bledy-przy-budowie-myjni/',
		priority: '0.8',
		changefreq: 'monthly'
	},
	{
		path: '/bezplatne-porownanie-ofert-myjni/',
		priority: '0.9',
		changefreq: 'weekly'
	},
    {
	path: '/mapa-strony/',
	priority: '0.4',
	changefreq: 'monthly'
},
	{
		path: '/polityka-prywatnosci/',
		priority: '0.3',
		changefreq: 'yearly'
	},
	{
		path: '/polityka-cookies/',
		priority: '0.3',
		changefreq: 'yearly'
	},
	{
		path: '/zasady-korzystania/',
		priority: '0.3',
		changefreq: 'yearly'
	}
];

const today = new Date().toISOString().split('T')[0];

export function GET() {
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
	.map((page) => {
		return `	<url>
		<loc>${siteUrl}${page.path}</loc>
		<lastmod>${today}</lastmod>
		<changefreq>${page.changefreq}</changefreq>
		<priority>${page.priority}</priority>
	</url>`;
	})
	.join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8'
		}
	});
}