// /assets/js/jobs.js
export async function loadJobs(){
  const res = await fetch('/data/jobs.json', { cache: 'no-store' });
  const data = await res.json();
  const all = (data.jobs || []).sort((a,b) => (b.postedAt||'').localeCompare(a.postedAt||''));
  const active = all.filter(j => (j.status||'').toLowerCase() === 'active');
  return { all, active };
}

export function filterJobs(list, q=''){
  const term = (q||'').trim().toLowerCase();
  if(!term) return list;
  return list.filter(j => [j.title,j.subtitle,j.subtitleDescription]
    .filter(Boolean)
    .some(t => t.toLowerCase().includes(term)));
}

export function pickRandom(list, n=3){
  const arr = [...list];
  for(let i=arr.length-1;i>0;i--){
    const k = Math.floor(Math.random()*(i+1));
    [arr[i],arr[k]] = [arr[k],arr[i]];
  }
  return arr.slice(0,n);
}

export function getBySlug(list, slug){
  return list.find(j => j.slug === slug);
}

export function jobCard(j){
  const url = `/job.html?slug=${encodeURIComponent(j.slug)}`;
  return `
    <a href="${url}" class="card" aria-label="${j.title}">
      <div class="badge">${j.status === 'active' ? 'Activa' : 'Cerrada'}</div>
      <h3>${j.title}</h3>
      ${j.subtitle ? `<p>${j.subtitle}</p>` : ''}
      ${j.subtitleDescription ? `<p class="muted">${j.subtitleDescription}</p>` : ''}
    </a>
  `;
}

export function jobJsonLd(j){
  const org = {
    '@type':'Organization',
    name:'PLAN-IT',
    sameAs:'https://plan-it.com.ar/'
  };
  const loc = j.jobLocationType === 'TELECOMMUTE' || /remoto|remote|tele/i.test(j.location||'')
    ? { jobLocationType:'TELECOMMUTE' }
    : (j.location ? { jobLocation: { '@type':'Place', address: j.location } } : {});

  return {
    '@context':'https://schema.org',
    '@type':'JobPosting',
    title: j.title,
    datePosted: j.postedAt,
    employmentType: j.employmentType || 'FULL_TIME',
    description: j.description,
    hiringOrganization: org,
    ...loc,
    validThrough: j.validThrough || undefined,
    applicantLocationRequirements: j.applicantLocationRequirements || undefined
  };
}