const EPOST = 'torstein.aam2@gmail.com';

document.querySelectorAll('[data-aar]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

const topp = document.querySelector('.topp');
const oppdaterTopp = () => topp?.classList.toggle('rullet', window.scrollY > 8);
oppdaterTopp();
window.addEventListener('scroll', oppdaterTopp, { passive: true });

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((oppforinger) => {
    oppforinger.forEach((o) => {
      if (o.isIntersecting) {
        o.target.classList.add('synlig');
        observer.unobserve(o.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.vis').forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll('.vis').forEach((el) => el.classList.add('synlig'));
}

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('video[autoplay]').forEach((v) => v.pause());
}

document.querySelectorAll('[data-kopier]').forEach((knapp) => {
  knapp.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(knapp.dataset.kopier);
      knapp.textContent = 'Kopiert';
    } catch {
      knapp.textContent = 'Kunne ikke kopiere';
    }
    setTimeout(() => { knapp.textContent = 'Kopier'; }, 2000);
  });
});

const skjema = document.querySelector('#kontaktskjema');
if (skjema) {
  const status = skjema.querySelector('.skjema-status');
  const sendKnapp = skjema.querySelector('button[type="submit"]');

  skjema.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!skjema.reportValidity()) return;

    const data = Object.fromEntries(new FormData(skjema));
    sendKnapp.disabled = true;
    status.className = 'skjema-status';
    status.textContent = 'Sender meldingen ...';

    try {
      const svar = await fetch(`https://formsubmit.co/ajax/${EPOST}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const resultat = await svar.json();
      if (!svar.ok || String(resultat.success) !== 'true') throw new Error(resultat.message);

      skjema.reset();
      status.classList.add('ok');
      status.textContent = 'Takk! Meldingen er sendt. Jeg svarer så fort jeg kan.';
    } catch {
      const emne = encodeURIComponent('Henvendelse fra nettsiden');
      const tekst = encodeURIComponent(`${data.melding || ''}\n\n${data.navn || ''}`);
      status.classList.add('feil');
      status.innerHTML = `Meldingen ble ikke sendt. Prøv igjen, eller <a href="mailto:${EPOST}?subject=${emne}&body=${tekst}">send den som vanlig e-post</a>.`;
    } finally {
      sendKnapp.disabled = false;
    }
  });
}
