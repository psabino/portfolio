// "You can also check these projects" — fills .more-projects with up to
// MAX_SUGGESTIONS other projects in a random order on every visit.
// The cards written in each page's HTML stay as the fallback without JS.
//
// To add a project: add it here (and its card to index.html). Every case
// study picks it up automatically.
const PROJECTS = [
  { href: 'paw-puzzles.html',   code: 'pp', thumb: 'images/thumb-pp.png',      name: 'Paw Puzzles',   glow: 'shadow-blue' },
  { href: 'poker-nights.html',  code: 'pn', thumb: 'images/thumb-poker.png',   name: 'Poker Nights',  glow: 'shadow-purple' },
  { href: 'fashion-match.html', code: 'fm', thumb: 'images/thumb-fashion.png', name: 'Fashion Match', glow: 'shadow-pink' },
  { href: 'braspag-dash.html',  code: 'bd', thumb: 'images/thumb-braspag.png', name: 'Braspag Dash',  glow: 'shadow-blue' },
];
const MAX_SUGGESTIONS = 3;

const list = document.querySelector('.more-projects');
if (list) {
  const current = location.pathname.split('/').pop() || 'index.html';

  // Fisher–Yates shuffle of every project except the current page
  const picks = PROJECTS.filter(p => p.href !== current);
  for (let i = picks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [picks[i], picks[j]] = [picks[j], picks[i]];
  }

  list.replaceChildren(...picks.slice(0, MAX_SUGGESTIONS).map(p => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = `project-card project-card--mini ${p.glow}`;
    a.href = p.href;
    // Same name as the project's hero, so the card morphs into it
    a.style.viewTransitionName = `project-${p.code}`;
    const img = document.createElement('img');
    img.src = p.thumb;
    img.alt = p.name;
    img.loading = 'lazy';
    a.append(img);
    li.append(a);
    return li;
  }));
}
