(function () {
  var P = window.PROYECTOS || [];

  var grilla = document.getElementById('grilla');
  var chipsBox = document.getElementById('chips');
  var buscar = document.getElementById('buscar');
  var vacio = document.getElementById('vacio');
  var contador = document.getElementById('contador');
  var visor = document.getElementById('visor');
  var frame = document.getElementById('v-frame');
  var vTitulo = document.getElementById('v-titulo');
  var vRubro = document.getElementById('v-rubro');
  var vAbrir = document.getElementById('v-abrir');
  var vCerrar = document.getElementById('v-cerrar');

  var esMovil = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  function sinAcentos(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  P.forEach(function (p) { p.busqueda = sinAcentos(p.titulo + ' ' + p.estudiante + ' ' + p.rubro + ' ' + p.bajada); });

  /* ---- chips ---- */
  var rubros = [];
  P.forEach(function (p) { if (rubros.indexOf(p.rubro) < 0) rubros.push(p.rubro); });
  rubros.sort();

  var actual = 'Todos';

  function crearChips() {
    var todos = ['Todos'].concat(rubros);
    chipsBox.innerHTML = '';
    todos.forEach(function (r) {
      var b = document.createElement('button');
      b.className = 'chip';
      b.type = 'button';
      b.textContent = r;
      b.setAttribute('aria-pressed', r === actual ? 'true' : 'false');
      b.addEventListener('click', function () {
        actual = r;
        Array.prototype.forEach.call(chipsBox.children, function (c) {
          c.setAttribute('aria-pressed', c.textContent === actual ? 'true' : 'false');
        });
        dibujar();
      });
      chipsBox.appendChild(b);
    });
  }

  /* ---- tarjetas ---- */
  function dibujar() {
    var q = sinAcentos(buscar.value.trim());
    var lista = P.filter(function (p) {
      var okRubro = actual === 'Todos' || p.rubro === actual;
      var okTexto = !q || p.busqueda.indexOf(q) >= 0;
      return okRubro && okTexto;
    });

    grilla.innerHTML = '';
    lista.forEach(function (p, i) {
      var a = document.createElement('a');
      a.className = 'card' + (p.ratio && p.ratio < 1.35 ? ' card--contain' : '');
      a.href = 'proyectos/' + p.slug + '.pdf';
      a.style.animationDelay = Math.min(i * 35, 350) + 'ms';
      a.innerHTML =
        '<div class="card__media">' +
          '<span class="card__num">' + String(P.indexOf(p) + 1).padStart(2, '0') + '</span>' +
          '<img src="covers/' + p.slug + '.webp" alt="Tapa del proyecto ' + esc(p.titulo) + '" loading="' + (i < 6 ? 'eager' : 'lazy') + '" decoding="async">' +
        '</div>' +
        '<div class="card__cuerpo">' +
          '<p class="card__rubro">' + esc(p.rubro) + '</p>' +
          '<h2 class="card__titulo">' + esc(p.titulo) + '</h2>' +
          '<p class="card__bajada">' + esc(p.bajada) + '</p>' +
          '<div class="card__pie">' +
            '<span class="card__autor">' + esc(p.estudiante) + '</span>' +
            '<span class="card__ver">Ver <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>' +
          '</div>' +
        '</div>';

      a.addEventListener('click', function (e) {
        if (esMovil) return; // en el celular se abre el PDF directo: mejor experiencia
        e.preventDefault();
        abrir(p);
      });
      grilla.appendChild(a);
    });

    vacio.hidden = lista.length > 0;
    contador.textContent = String(lista.length).padStart(2, '0');
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---- visor ---- */
  function abrir(p) {
    vTitulo.textContent = p.titulo;
    vRubro.textContent = p.rubro + ' · ' + p.estudiante;
    vAbrir.href = 'proyectos/' + p.slug + '.pdf';
    frame.src = 'proyectos/' + p.slug + '.pdf';
    visor.hidden = false;
    document.body.classList.add('bloqueado');
  }

  function cerrar() {
    visor.hidden = true;
    frame.src = 'about:blank';
    document.body.classList.remove('bloqueado');
  }

  vCerrar.addEventListener('click', cerrar);
  visor.addEventListener('click', function (e) { if (e.target === visor) cerrar(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !visor.hidden) cerrar();
  });

  /* ---- buscador ---- */
  var t;
  buscar.addEventListener('input', function () {
    clearTimeout(t);
    t = setTimeout(dibujar, 90);
  });

  /* ---- url corta en el pie ---- */
  var urlTexto = document.getElementById('url-texto');
  if (urlTexto) urlTexto.textContent = location.href.replace(/^https?:\/\//, '').replace(/index\.html$/, '').replace(/\/$/, '');

  crearChips();
  dibujar();
})();
