/* 1. TETAPAN PEMILIK
   Isi nombor dengan kod negara tanpa +, ruang atau sengkang.
   Contoh format Malaysia: 60 diikuti nombor tanpa sifar awal.
   Biarkan kosong semasa menggunakan template. */
const nomborWhatsApp = '';
const masaPeralihan = 2000;
const nomborSah = /^[1-9]\d{7,14}$/.test(nomborWhatsApp);

/* 2. ELEMEN HALAMAN */
const pages = document.querySelectorAll('.page');
const curtain = document.getElementById('curtain');
const curtainText = document.getElementById('curtain-text');
const main = document.getElementById('main');
const dialog = document.getElementById('message-dialog');
const form = document.getElementById('booking-form');
const checkIn = document.getElementById('check-in');
const checkOut = document.getElementById('check-out');
let halamanAktif = 'utama';
let transitionTimer;

// Teks butang ikut sama ada nombor pemilik sudah dimasukkan atau belum.
if (nomborSah) {
  document.querySelector('#booking-form button[type="submit"]').innerHTML = 'Sediakan mesej WhatsApp <span>↗</span>';
  document.querySelector('#booking-form .draft-note').textContent = 'Pertanyaan akan dibuka dalam WhatsApp selepas anda menyemak mesej.';
}

/* 3. NAVIGASI — empat halaman dalam satu fail supaya mudah dibuka terus.
   Hash URL juga menyokong butang Back / Forward dalam browser. */
function bacaHalaman() {
  const id = window.location.hash.slice(1);
  return ['utama', 'ruang', 'aktiviti', 'hubungi'].includes(id) ? id : 'utama';
}

function paparHalaman(id, fokus = true) {
  pages.forEach(function (page) {
    page.hidden = page.id !== id;
  });

  document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach(function (link) {
    if (link.getAttribute('href') === '#' + id) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  halamanAktif = id;
  const nama = { utama: 'Utama', ruang: 'Ruang Rumah', aktiviti: 'Aktiviti', hubungi: 'Hubungi' };
  document.title = nama[id] + ' — Serambi Bonda';
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (fokus) document.getElementById('title-' + id).focus({ preventScroll: true });
}

function tukarHalaman(id, pembukaan = false) {
  clearTimeout(transitionTimer);
  curtainText.textContent = pembukaan ? 'Selamat datang ke serambi.' : 'Melangkah ke ruang seterusnya…';
  curtain.hidden = false;
  document.body.classList.add('transitioning');
  // Inert menghalang fokus papan kekunci pada kandungan di belakang loading.
  document.querySelector('.header').inert = true;
  document.querySelector('.mobile-nav').inert = true;
  document.querySelector('.footer').inert = true;
  main.inert = true;
  main.setAttribute('aria-busy', 'true');

  transitionTimer = setTimeout(function () {
    main.inert = false;
    document.querySelector('.header').inert = false;
    document.querySelector('.mobile-nav').inert = false;
    document.querySelector('.footer').inert = false;
    paparHalaman(id, !pembukaan);
    curtain.hidden = true;
    document.body.classList.remove('transitioning');
    main.removeAttribute('aria-busy');
    if (window.location.hash === '#kisah') document.getElementById('kisah').scrollIntoView();
    if (pembukaan) setTimeout(bukaTawaranPasang, 250);
  }, masaPeralihan);
}

window.addEventListener('hashchange', function () {
  const tujuan = bacaHalaman();
  if (tujuan !== halamanAktif || !curtain.hidden) tukarHalaman(tujuan);
});

paparHalaman(bacaHalaman(), false);
tukarHalaman(bacaHalaman(), true);
document.getElementById('year').textContent = new Date().getFullYear();

/* 4. GALERI FOTO — susunan ikut gambar yang diberi oleh keluarga. */
const tajukFoto = [
  'Bilik tidur bercadar biru', 'Ruang tamu dan televisyen',
  'Bilik tidur bercadar corak hati', 'Mesin basuh dan peti sejuk',
  'Sudut duduk', 'Bilik air', 'Almari dan meja solek',
  'Penyaman udara di bilik', 'Ruang pancuran mandi',
  'Pandangan hadapan rumah', 'Pandangan rumah dan halaman',
  'Ruang tamu dari sudut lain', 'Laluan kampung', 'Ruang dapur'
];

const galeri = document.getElementById('gallery');
const photoDialog = document.getElementById('photo-dialog');

tajukFoto.forEach(function (tajuk, index) {
  const nombor = String(index + 1).padStart(2, '0');
  const laluan = 'images/foto-' + nombor + '.jpg';
  const butang = document.createElement('button');
  const gambar = document.createElement('img');
  const kapsyen = document.createElement('span');

  butang.type = 'button';
  butang.className = 'gallery-item';
  butang.setAttribute('aria-label', 'Lihat foto: ' + tajuk);
  gambar.src = laluan;
  gambar.alt = tajuk;
  gambar.loading = 'lazy';
  kapsyen.textContent = tajuk;
  butang.append(gambar, kapsyen);
  galeri.append(butang);

  butang.addEventListener('click', function () {
    document.getElementById('large-photo').src = laluan;
    document.getElementById('large-photo').alt = tajuk;
    document.getElementById('photo-caption').textContent = tajuk;
    photoDialog.showModal();
  });
});

document.getElementById('close-photo').addEventListener('click', function () {
  photoDialog.close();
});

/* 5. TARIKH — guna tarikh tempatan, bukan tarikh UTC. */
function tarikhInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function kemasKiniTarikh() {
  checkIn.min = tarikhInput(new Date());
  const asas = checkIn.value || checkIn.min;
  const esok = new Date(asas + 'T12:00:00');
  esok.setDate(esok.getDate() + 1);
  checkOut.min = tarikhInput(esok);
  checkOut.setCustomValidity('');
  if (checkOut.value && checkOut.value < checkOut.min) {
    checkOut.setCustomValidity('Tarikh keluar mesti selepas tarikh masuk.');
  }
}

checkIn.addEventListener('change', kemasKiniTarikh);
checkOut.addEventListener('change', kemasKiniTarikh);
kemasKiniTarikh();

function tarikhCantik(value) {
  return new Date(value + 'T12:00:00').toLocaleDateString('ms-MY', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

/* 6. SEDIAKAN MESEJ — tiada tempahan atau pembayaran dihantar automatik. */
form.addEventListener('submit', function (event) {
  event.preventDefault();
  kemasKiniTarikh();
  if (!form.reportValidity()) return;

  const nama = document.getElementById('guest-name').value.trim();
  const nota = document.getElementById('note').value.trim();
  const tetamu = document.getElementById('guests').value;
  const mesej = [
    'Assalamualaikum Serambi Bonda!',
    nama ? 'Nama saya ' + nama + '.' : 'Saya berminat untuk menginap.',
    '',
    'Tarikh masuk: ' + tarikhCantik(checkIn.value),
    'Tarikh keluar: ' + tarikhCantik(checkOut.value),
    'Jumlah tetamu: ' + tetamu + ' orang',
    ...(nota ? ['Pertanyaan: ' + nota] : []),
    '',
    'Boleh saya tahu kekosongan dan harga penginapan? Terima kasih.'
  ].join('\n');

  document.getElementById('message-preview').value = mesej;
  document.getElementById('copy-status').textContent = '';
  const link = document.getElementById('whatsapp-link');
  link.hidden = !nomborSah;
  if (nomborSah) {
    link.href = 'https://wa.me/' + nomborWhatsApp + '?text=' + encodeURIComponent(mesej);
    document.getElementById('whatsapp-hint').textContent = 'Semak mesej ini, kemudian buka WhatsApp untuk menghantarnya kepada pemilik.';
  }
  dialog.showModal();
});

/* 7. PWA — service worker berfungsi di HTTPS atau localhost sahaja. */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./service-worker.js').catch(function (error) {
      console.warn('PWA tidak dapat didaftarkan:', error);
    });
  });
}

/* 8. PEMASANGAN — popup menawarkan aplikasi, tetapi pengguna tetap memilih sendiri. */
const installDialog = document.getElementById('install-dialog');
const installButton = document.getElementById('install-button');
const installSteps = document.getElementById('install-steps');
const installVisualGuide = document.getElementById('install-ios-guide');
const installDescription = document.getElementById('install-description');
const installReopen = document.getElementById('install-reopen');
let installPrompt = null;

function sudahDipasang() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

function kemasKiniTawaranPasang() {
  const telefonApple = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const telefonAndroid = /Android/i.test(navigator.userAgent);
  const safariMac = /Macintosh/.test(navigator.userAgent) &&
    /Safari/.test(navigator.userAgent) && !/Chrome|Chromium|Edg/.test(navigator.userAgent);
  installButton.hidden = !installPrompt || telefonApple;
  installVisualGuide.hidden = !telefonApple;
  installSteps.hidden = telefonApple;

  if (telefonApple) {
    installDescription.textContent = 'Add this website to your iPhone or iPad Home Screen and open it like an app.';
  } else if (telefonAndroid) {
    installSteps.textContent = 'Android: tap Install app below if the button appears. Otherwise, open the Chrome menu and choose Install app or Add to Home screen.';
  } else if (safariMac) {
    installSteps.textContent = 'Mac Safari: open the Share menu, choose Add to Dock, then select Add.';
  } else {
    installSteps.textContent = 'Computer: click Install app below if the button appears. Otherwise, use the install icon in the Chrome or Edge address bar or browser menu.';
  }
}

function bukaTawaranPasang(manual = false) {
  const lamanSelamat = location.protocol === 'https:' || location.hostname === 'localhost';
  if ((!lamanSelamat && !manual) || sudahDipasang() || installDialog.open) return;
  kemasKiniTawaranPasang();
  installDialog.showModal();
  document.getElementById('install-title').focus({ preventScroll: true });
}

window.addEventListener('beforeinstallprompt', function (event) {
  event.preventDefault();
  installPrompt = event;
  kemasKiniTawaranPasang();
});

installButton.addEventListener('click', async function () {
  if (!installPrompt) return;
  const prompt = installPrompt;
  installPrompt = null;
  installDialog.close();
  try {
    await prompt.prompt();
    await prompt.userChoice;
  } catch (error) {
    console.warn('Pilihan pemasangan tidak tersedia:', error);
  }
  kemasKiniTawaranPasang();
});

window.addEventListener('appinstalled', function () {
  installPrompt = null;
  if (installDialog.open) installDialog.close();
  installReopen.hidden = true;
});

installReopen.hidden = sudahDipasang();
installReopen.addEventListener('click', function () {
  bukaTawaranPasang(true);
});

document.getElementById('close-install').addEventListener('click', function () {
  installDialog.close();
});

document.getElementById('install-later').addEventListener('click', function () {
  installDialog.close();
});

document.getElementById('close-dialog').addEventListener('click', function () {
  dialog.close();
});

document.getElementById('copy-message').addEventListener('click', async function () {
  const preview = document.getElementById('message-preview');
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(preview.value);
    status.textContent = 'Mesej berjaya disalin.';
  } catch (error) {
    // Sesetengah browser menyekat clipboard apabila dibuka sebagai fail tempatan.
    preview.focus();
    preview.select();
    status.textContent = 'Pilih Salin pada peranti anda, atau tekan Ctrl+C / Command+C.';
  }
});
