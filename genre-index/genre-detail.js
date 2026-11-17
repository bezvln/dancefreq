const genreNames={
  house:'House','afro-house':'Afro House','deep-house':'Deep House','tech-house':'Tech House',
  techno:'Techno','melodic-techno':'Melodic Techno','trance':'Trance','hard-trance':'Hard Trance',
  dubstep:'Dubstep','drum-and-bass':'Drum & Bass','hard-dance':'Hard Dance'
};
const slug=new URLSearchParams(location.search).get('genre')||'house';
const genreName=genreNames[slug]||slug.replace(/-/g,' ').replace(/\b\w/g,letter=>letter.toUpperCase());
document.title=`${genreName} — Genre Index — DanceFreq`;
document.getElementById('genre-title').textContent=genreName;
document.getElementById('genre-description').textContent=`A guide to the artists, tracks, connected sounds, and scenes that give ${genreName} its character.`;

const placeholderDjs=['Artist profile placeholder','Artist profile placeholder','Artist profile placeholder','Artist profile placeholder','Artist profile placeholder'];
document.getElementById('dj-grid').innerHTML=placeholderDjs.map((name,index)=>`<article class="dj-card"><div class="dj-image">PROFILE IMAGE<br>COMING SOON</div><h3>${name}</h3><p>${genreName} · Artist signal</p><span class="placeholder-tag">Placeholder</span></article>`).join('');

const placeholderTracks=['Track title placeholder','Track title placeholder','Track title placeholder','Track title placeholder','Track title placeholder'];
document.getElementById('track-list').innerHTML=placeholderTracks.map((title,index)=>`<div class="track-row"><span class="track-number">0${index+1}</span><div><strong>${title}</strong><small>Artist name placeholder · Label placeholder</small></div><span class="track-meta">${genreName}</span><span class="track-status">Coming soon</span></div>`).join('');

const connected={
  house:['Afro House','Deep House','Tech House','Progressive House'],
  techno:['Melodic Techno','Hard Techno','Minimal Techno','Acid Techno'],
  trance:['Progressive Trance','Uplifting Trance','Hard Trance','Psytrance'],
  dubstep:['Melodic Dubstep','Riddim','Future Bass','Color Bass'],
  'drum-and-bass':['Liquid Drum & Bass','Dancefloor D&B','Neurofunk','Jungle'],
  'hard-dance':['Hardstyle','Hard Trance','Rawstyle','Hardcore']
};
const related=(connected[slug]||[]).slice(0,5);
document.getElementById('related-genres').innerHTML=(related.length?related:['Connected sound placeholder','Adjacent sound placeholder','Subgenre placeholder','Scene connection placeholder','Related style placeholder']).slice(0,5).map((name,index)=>`<a class="related-card" href="./genre-detail.html?genre=${name.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}"><small>0${index+1} · Explore</small><strong>${name}</strong><span>Connected sound</span></a>`).join('');

const SUPABASE_URL='https://dkmssowizgbxfbhomkjf.supabase.co';
const SUPABASE_KEY='sb_publishable_KfOm1lrpl0R55BwzhNzGmg_i1V8zzUO';
async function loadMetricPreview(){
  try{
    const query=new URLSearchParams({select:'*',name:`eq.${genreName}`,limit:'1'});
    const response=await fetch(`${SUPABASE_URL}/rest/v1/latest_genre_trends?${query}`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`}});
    if(!response.ok) return;
    const trend=(await response.json())[0];
    if(!trend) return;
    const overall=Number(trend.overall_change_pct),confidence=Number(trend.confidence_score);
    if(Number.isFinite(overall)) document.getElementById('overall-score').textContent=`${overall>=0?'+':''}${overall.toFixed(1)}%`;
    if(Number.isFinite(trend.dj_change_pct)) document.getElementById('dj-score').textContent=`${trend.dj_change_pct>=0?'+':''}${Number(trend.dj_change_pct).toFixed(1)}%`;
    if(Number.isFinite(trend.listener_change_pct)) document.getElementById('listener-score').textContent=`${trend.listener_change_pct>=0?'+':''}${Number(trend.listener_change_pct).toFixed(1)}%`;
    if(Number.isFinite(confidence)) document.getElementById('confidence-score').textContent=`${confidence.toFixed(0)}%`;
  }catch(error){/* Placeholder metrics remain visible until data is available. */}
}
loadMetricPreview();
