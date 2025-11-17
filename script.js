// Games data - add or edit items here
const gamesKey = 'games.portfolio.v1';
const defaultGames = [
  {
    title: 'Orbit Breaker',
    description: 'A tiny arcade-style space shooter. Use arrow keys and space to fire.',
    playUrl: 'https://orbit-breaker.vercel.app/',
    sourceUrl: 'https://github.com/yourname/space-blaster',
    thumbnail: 'ob.png'
  },
  {
    title: 'Hello, There.',
    description: 'A short puzzle game.',
    playUrl: 'https://hello-there-pearl.vercel.app',
    sourceUrl: '',
    thumbnail: 'ht.png'
  },
   {
    title: 'Tower Defense Extreme',
    description: 'Tower defense game with extreme difficulty.',
    playUrl: 'https://defenseio.vercel.app/',
    sourceUrl: '',
    thumbnail: 'tv.png'
  },
];

function loadGames(){
  try{
    const raw = localStorage.getItem(gamesKey);
    if(!raw) return defaultGames.slice();
    const parsed = JSON.parse(raw);
    if(Array.isArray(parsed) && parsed.length) return parsed;
  }catch(e){console.warn('Failed to load games from storage', e)}
  return defaultGames.slice();
}

function saveGames(g){
  try{localStorage.setItem(gamesKey, JSON.stringify(g))}catch(e){console.warn('Failed to save games', e)}
}

function createCard(game){
  const template = document.getElementById('game-card-template');
  const el = template.content.cloneNode(true);
  const art = el.querySelector('.card');
  const img = el.querySelector('.thumb');
  const title = el.querySelector('.game-title');
  const desc = el.querySelector('.game-desc');
  const play = el.querySelector('.play-btn');
  const src = el.querySelector('.source-btn');

  title.textContent = game.title || 'Untitled';
  desc.textContent = game.description || '';
  play.href = game.playUrl || '#';
  src.href = game.sourceUrl || '#';
  if(!game.sourceUrl) src.style.display = 'none';

  if(game.thumbnail){
    img.src = game.thumbnail;
  } else {
    // generate a lightweight SVG placeholder data URL with the first letter
    const letter = (game.title||' ').trim().charAt(0).toUpperCase() || '?';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='400'>
      <defs><linearGradient id='g' x1='0' x2='1'><stop offset='0' stop-color='%23071b2b'/><stop offset='1' stop-color='%230b1220'/></linearGradient></defs>
      <rect width='100%' height='100%' fill='url(%23g)' />
      <text x='50%' y='50%' font-family='Segoe UI, Roboto, Arial' font-size='120' fill='rgba(255,255,255,0.08)' dominant-baseline='middle' text-anchor='middle'>${letter}</text>
    </svg>`;
    img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  return art;
}

function render(games){
  const container = document.getElementById('games-grid');
  container.innerHTML = '';
  games.forEach(game => container.appendChild(createCard(game)));
}

// Add game form handling
function setupForm(games){
  const form = document.getElementById('add-game-form');
  const resetBtn = document.getElementById('reset-btn');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const playUrl = document.getElementById('playUrl').value.trim();
    const sourceUrl = document.getElementById('sourceUrl').value.trim();
    const thumbnail = document.getElementById('thumbnail').value.trim();
    const description = document.getElementById('description').value.trim();
    if(!title || !playUrl) return alert('Please provide a title and a play URL.');
    const newGame = {title, playUrl, sourceUrl, thumbnail, description};
    games.unshift(newGame); // add to front
    saveGames(games);
    render(games);
    form.reset();
  });
  resetBtn.addEventListener('click', ()=>form.reset());

  // Remove game section
  const removeSection = document.createElement('hr');
  removeSection.style.margin = '20px 0';
  form.parentNode.insertBefore(removeSection, form.nextSibling);

  const removeDiv = document.createElement('div');
  removeDiv.style.marginTop = '20px';
  removeDiv.innerHTML = `
    <h3 style="margin-top: 0; font-size: 1rem;">Remove a game</h3>
    <div style="display: flex; gap: 8px;">
      <input id="remove-index" type="number" min="0" placeholder="Game index (0 is first)" style="flex: 1; padding: 8px;" />
      <button id="remove-btn" class="btn" type="button" style="white-space: nowrap;">Remove</button>
    </div>
    <div id="remove-list" style="margin-top: 12px; font-size: 0.9rem; color: #888;"></div>
  `;
  form.parentNode.insertBefore(removeDiv, form.nextSibling.nextSibling);

  // Update remove list
  function updateRemoveList(){
    const list = document.getElementById('remove-list');
    list.innerHTML = '<strong>Current games:</strong><br>' + games.map((g, i) => `${i}: ${g.title}`).join('<br>');
  }

  document.getElementById('remove-btn').addEventListener('click', () => {
    const idx = parseInt(document.getElementById('remove-index').value);
    if(isNaN(idx) || idx < 0 || idx >= games.length){
      return alert(`Invalid index. Must be 0–${games.length - 1}`);
    }
    const removed = games[idx];
    games.splice(idx, 1);
    saveGames(games);
    render(games);
    document.getElementById('remove-index').value = '';
    updateRemoveList();
    alert(`Removed: "${removed.title}"`);
  });

  updateRemoveList();
}

// Load and initialize
function setupSecretPanel(){
  const secret = 'unbound';
  let buffer = '';
  const maxLen = secret.length;
  const panel = document.getElementById('add-game-panel');
  const form = document.getElementById('add-game-form');

  // ensure panel starts hidden (in case HTML/CSS changed)
  if(panel){
    panel.classList.add('hidden');
    panel.setAttribute('aria-hidden','true');

    // add close button handler (in case button added via JS)
    const closeBtn = document.getElementById('close-add-panel');
    if(closeBtn){
      closeBtn.addEventListener('click', ()=>{
        panel.classList.remove('visible');
        panel.classList.add('hidden');
        panel.setAttribute('aria-hidden','true');
      });
    }
  }

  function showPanel(){
    if(!panel) return;
    panel.classList.remove('hidden');
    // force reflow then add visible for transition
    void panel.offsetWidth;
    panel.classList.add('visible');
    panel.setAttribute('aria-hidden','false');
    // focus first input for convenience
    const first = panel.querySelector('input, textarea, select');
    if(first) first.focus();
  }

  function hidePanel(){
    if(!panel) return;
    panel.classList.remove('visible');
    panel.classList.add('hidden');
    panel.setAttribute('aria-hidden','true');
  }

  // listen for typed secret (ignore when focused in inputs)
  window.addEventListener('keydown', (ev)=>{
    // close on Escape if panel visible
    if(ev.key === 'Escape'){
      if(panel && panel.classList.contains('visible')){
        hidePanel();
      }
      return;
    }

    const active = document.activeElement;
    if(active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
    if(ev.ctrlKey || ev.metaKey || ev.altKey) return; // ignore combos

    const k = ev.key;
    if(k.length === 1){
      buffer += k.toLowerCase();
      if(buffer.length > maxLen) buffer = buffer.slice(-maxLen);
      if(buffer === secret){
        // reveal
        showPanel();
        buffer = '';
      }
    }
  }, {passive:true});
}


document.addEventListener('DOMContentLoaded', ()=>{
  const games = loadGames();
  render(games);
  setupForm(games);
  setupSecretPanel();
});


