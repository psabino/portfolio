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
    const img = document.createElement('img');
    img.src = p.thumb;
    img.alt = p.name;
    img.loading = 'lazy';
    a.append(img);
    li.append(a);
    return li;
  }));
}

// The clicked card morphs into the case study hero: just before leaving for a
// project, give its card the hero's view-transition-name. Cards have no names
// otherwise, so swapping them above (which can run mid page transition when
// the script loads late) never changes the transition's named elements;
// Chrome cancels a transition when those change.
addEventListener('pageswap', e => {
  const to = e.viewTransition && e.activation?.entry?.url;
  if (!to) return;
  const project = PROJECTS.find(p => p.href === new URL(to).pathname);
  const card = project && document.querySelector(`.more-projects a[href="${project.href}"]`);
  if (card) card.style.viewTransitionName = `project-${project.code}`;
});
// Coming back via the back/forward cache: clear the name again
addEventListener('pageshow', () => {
  document.querySelectorAll('.more-projects a').forEach(a => { a.style.viewTransitionName = ''; });
});
