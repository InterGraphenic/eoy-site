const paths = {
	nav: './shared/navbar.html',
	data: './shared/projects.json'
};
const $ = sel => document.querySelector(sel);


async function injectAds() {
	const slots = [...document.querySelectorAll('a.ad-slot, img.ad')];
	if (!slots.length) return;

	const ads = await fetch('./shared/ads.json').then(r => r.json()).catch(() => []);
	if (!ads.length) return;

	const picks = ads.sotrt(() => 0.5 - Math.random());

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
	const navHTML = await fetch(paths.nav).then(r => r.text());
	$('#navbar-container').innerHTML = navHTML;
	await injectAds(); // idk what await does but it works so im not complaining
	// in case this lasts until the big 26 the year is updated automatically
	$('#year').textContent = new Date().getFullYear();

	const projs = await fetch(paths.data).then(r => r.json());

	// first in order of newness (no fancy system i just put the newest ones at the top of the json file)
	const latest = projs.slice(0, 9);
	const list = $('#latest-list');
	list.innerHTML = latest.map(g => `
		<li>
			<a href="./shared/page-frame.html?proj=${g.id}">
				<img src="${g.thumb}" class="latest-thumb" alt="">
				<div class="latest-meta">
					<h3>${g.title}</h3>
					<div class="latest-tags">${g.tags.join(', ')}</div>
				</div>
			</a>
		</li>
	`).join('');
});
