const q = new URLSearchParams(location.search);
const currentId = q.get('proj');
const paths = { nav: 'navbar.html', data: 'projects.json' };
const dom = sel => document.querySelector(sel);

async function injectAds() {
	const slots = [...document.querySelectorAll('a.ad-slot, img.ad')];
	if (!slots.length) return;

	const ads = await fetch('/shared/ads.json').then(r => r.json()).catch(() => []);
	if (!ads.length) return;

	const picks = ads.sort(() => 0.5 - Math.random());

	slots.forEach((slot, i) => {
		const ad = picks[i % picks.length];
		const img = slot.tagName === 'IMG' ? slot
			: slot.querySelector('img') || document.createElement('img');

		img.src = ad.src;
		img.alt = 'Advertisement';

		const link = document.createElement('a');
		link.href = ad.href;
		link.target = '_blank';
		img.replaceWith(link);
		link.appendChild(img);
	});
}

window.addEventListener('DOMContentLoaded', async () => {
	await insertNavbar();
	await buildPage();
	injectAds();
	dom('#year').textContent = new Date().getFullYear();
});

async function insertNavbar() {
	const html = await fetch(paths.nav).then(r => r.text());
	dom('#navbar-container').innerHTML = html;
	dom('#search-form')?.addEventListener('submit', e => {
		e.preventDefault();
		const q = new FormData(e.target).get('q');
		if (q) {
			const base = location.pathname.includes('/shared/') ? '../' : '';
			location.href = `${base}search.html?q=${encodeURIComponent(q)}`;
		}
	});
}

// build the whole page from projects.json
async function buildPage() {
	const projs = await fetch(paths.data).then(r => r.json());
	const me = projs.find(g => g.id === currentId);
	if (!me) { dom('#proj-root').textContent = 'proj not found'; return; }

	document.title = me.title + ' | 67 corner';
	dom('#proj-title').textContent = me.title;
	const nav = dom('.nav-links');
	nav.innerHTML = projs.map(g => `<li><a href="/shared/page-frame.html?proj=${g.id}">
																 ${g.title}</a></li>`).join('');

	const frame = document.createElement('iframe');
	frame.src = `../projects/${me.id}/main.html`;
	frame.width = 750; frame.height = 384; frame.style.border = '0';
	dom('#proj-root').appendChild(frame);

	/* recommendations wip rn its just every other project */
	const rec = projs.filter(g => g.id !== me.id).slice(0, 6);
	dom('#rec-list').innerHTML = rec.map(g => `
		 <li>
		 	<a href="page-frame.html?proj=${g.id}">
				<img src="${g.thumb}" alt="">
				<div><strong>${g.title}</strong><br>${g.tags.join(', ')}</div>
			</a>
		 </li>`).join('');
}
