const paths = {
	nav : 'shared/navbar.html',
	data: 'shared/projects.json',
	ads : 'shared/ads.json'
};
const $ = sel => document.querySelector(sel);

async function injectAds () {
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
		link.href   = ad.href;
		link.target = '_blank';
		img.replaceWith(link);
		link.appendChild(img);
	});
}

window.addEventListener('DOMContentLoaded', async () => {
	const nav = await fetch(paths.nav).then(r => r.text());
	$('#navbar-container').innerHTML = nav;

	fixSearchFormPath();

	await injectAds();
	$('#year').textContent = new Date().getFullYear();

	const query = new URLSearchParams(location.search).get('q')?.trim()?.toLowerCase() || '';
	if (!query) {
		$('#results-head').textContent = 'Please type something first';
		return;
	}

	const data = await fetch(paths.data).then(r => r.json());
	const results = data.filter(p =>
		p.title.toLowerCase().includes(query) ||
		(p.tags ?? []).some(t => t.toLowerCase().includes(query))
	);

	$('#results-head').innerHTML = `Results for “<em>${query}</em>” (${results.length})`;

	if (!results.length) {
		$('#results-list').innerHTML =
			'<p style="padding:.5rem">No projects matched your search.</p>';
		return;
	}

	$('#results-list').innerHTML = results
		.map(p => `
			<li>
				<a href="shared/page-frame.html?proj=${p.id}">
					<img src="${p.thumb}" class="latest-thumb" alt="">
					<div class="latest-meta">
						<h3>${p.title}</h3>
						<div class="latest-tags">${p.tags.join(', ')}</div>
					</div>
				</a>
			</li>`)
		.join('');
});

function fixSearchFormPath () {
	const f = document.getElementById('search-form');
	if (!f) return;
	f.addEventListener('submit', e => {
		e.preventDefault();
		const q = new FormData(f).get('q').trim();
		location.href = `search.html?q=${encodeURIComponent(q)}`;
	});
}
