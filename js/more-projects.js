// "You can also check these projects" — fills .more-projects with up to
// MAX_SUGGESTIONS other projects in a random order on every visit.
// The cards written in each page's HTML stay as the fallback without JS.
//
// To add a project: add it here (and its card to the homepage). Every page
// with a .more-projects row picks it up automatically.
const PROJECTS = [
  { href: '/work/paw-puzzles/',   code: 'pp', thumb: '/images/thumbs/paw-puzzles.png',   name: 'Paw Puzzles',   glow: 'shadow-blue' },
  { href: '/work/poker-nights/',  code: 'pn', thumb: '/images/thumbs/poker-nights.png',  name: 'Poker Nights',  glow: 'shadow-purple' },
  { href: '/work/fashion-match/', code: 'fm', thumb: '/images/thumbs/fashion-match.png', name: 'Fashion Match', glow: 'shadow-pink' },
  { href: '/work/braspag-dash/',  code: 'bd', thumb: '/images/thumbs/braspag-dash.png',  name: 'Braspag Dash',  glow: 'shadow-blue' },
];
const MAX_SUGGESTIONS = 3;

const list = document.querySelector('.more-projects');
if (list) {
  // Current page as a folder path, e.g. /work/paw-puzzles/ (index.html dropped)
  const current = location.pathname.replace(/index\.html$/, '');

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
