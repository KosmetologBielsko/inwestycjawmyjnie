export const siteConfig = {
	name: 'Inwestycja w Myjnię',
	shortName: 'inwestycjawmyjnie.pl',
	description:
		'Inwestycja w myjnię bezdotykową: koszt budowy, opłacalność, działka, formalności, technologia, porównanie ofert producentów i analiza lokalizacji.',
	url: 'https://inwestycjawmyjnie.pl',
	email: 'analiza@inwestycjawmyjnie.pl',

	// WAŻNE:
	// false = strona ma noindex i Google jej nie indeksuje.
	// Po podpięciu domeny inwestycjawmyjnie.pl do Vercel zmienimy na true.
	indexingEnabled: true,

	// Możemy dodać później, gdy przygotujemy grafikę OG 1200x630.
	defaultOgImage: '',

	nav: [
		{
			label: 'Koszty',
			href: '/ile-kosztuje-myjnia-bezdotykowa/'
		},
		{
			label: 'Opłacalność',
			href: '/ile-zarabia-myjnia-bezdotykowa/'
		},
		{
			label: 'Działka',
			href: '/dzialka-pod-myjnie-bezdotykowa/'
		},
		{
			label: 'Budowa',
			href: '/budowa-myjni-bezdotykowej-krok-po-kroku/'
		},
		{
			label: 'Porównanie ofert',
			href: '/bezplatne-porownanie-ofert-myjni/'
		},
		{
			label: 'Poradnik',
			href: '/poradnik/'
		}
	]
};