// Script único del sitio, sin dependencias (reemplaza jQuery y sus plugins).
(function () {
	'use strict';

	// ---------- Pantalla de carga ----------
	function ocultarLoader() {
		var loader = document.querySelector('.fh5co-loader');
		if (!loader) { return; }
		loader.classList.add('oculto');
		setTimeout(function () { loader.remove(); }, 500);
	}

	// ---------- Animaciones de entrada al hacer scroll ----------
	function animarAlEntrar() {
		var cajas = document.querySelectorAll('.animate-box');
		var efectos = ['fadeIn', 'fadeInLeft', 'fadeInRight'];

		function mostrar(el, retraso) {
			var efecto = el.dataset.animateEffect;
			if (efectos.indexOf(efecto) === -1) { efecto = 'fadeInUp'; }
			setTimeout(function () {
				el.classList.add(efecto, 'animated-fast');
			}, retraso);
		}

		if (!('IntersectionObserver' in window)) {
			cajas.forEach(function (el) { mostrar(el, 0); });
			return;
		}

		var observador = new IntersectionObserver(function (entradas) {
			var orden = 0;
			entradas.forEach(function (entrada) {
				if (!entrada.isIntersecting) { return; }
				observador.unobserve(entrada.target);
				// Los que aparecen juntos entran escalonados.
				mostrar(entrada.target, Math.min(orden, 5) * 150);
				orden++;
			});
		}, { rootMargin: '0px 0px -10% 0px' });

		cajas.forEach(function (el) { observador.observe(el); });
	}

	// ---------- Botón "volver arriba" ----------
	function botonArriba() {
		var contenedor = document.querySelector('.js-top');
		var enlace = document.querySelector('.js-gotop');
		if (!contenedor || !enlace) { return; }

		enlace.addEventListener('click', function (evento) {
			evento.preventDefault();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});

		function revisar() {
			contenedor.classList.toggle('active', window.scrollY > 200);
		}
		window.addEventListener('scroll', revisar, { passive: true });
		revisar();
	}

	// ---------- Visor de fotos de la galería ----------
	function visorDeFotos() {
		var visor = document.getElementById('visor');
		var enlaces = Array.prototype.slice.call(document.querySelectorAll('#fh5co-gallery-list a'));
		// Sin <dialog> los enlaces simplemente abren la foto.
		if (!visor || !visor.showModal || !enlaces.length) { return; }

		var imagen = visor.querySelector('img');
		var leyenda = visor.querySelector('figcaption');
		var actual = 0;

		function mostrar(indice) {
			actual = (indice + enlaces.length) % enlaces.length;
			var enlace = enlaces[actual];
			var titulo = enlace.querySelector('h2');
			var texto = titulo ? titulo.textContent.trim() : '';
			imagen.src = enlace.href;
			imagen.alt = texto;
			leyenda.textContent = texto;
		}

		enlaces.forEach(function (enlace, indice) {
			enlace.addEventListener('click', function (evento) {
				evento.preventDefault();
				mostrar(indice);
				visor.showModal();
			});
		});

		visor.querySelector('.visor-cerrar').addEventListener('click', function () { visor.close(); });
		visor.querySelector('.visor-anterior').addEventListener('click', function () { mostrar(actual - 1); });
		visor.querySelector('.visor-siguiente').addEventListener('click', function () { mostrar(actual + 1); });

		// Clic fuera de la foto cierra el visor.
		visor.addEventListener('click', function (evento) {
			if (evento.target === visor || evento.target.tagName === 'FIGURE') { visor.close(); }
		});
		visor.addEventListener('keydown', function (evento) {
			if (evento.key === 'ArrowLeft') { mostrar(actual - 1); }
			if (evento.key === 'ArrowRight') { mostrar(actual + 1); }
		});
		visor.addEventListener('close', function () { imagen.removeAttribute('src'); });
	}

	// ---------- Contador de tiempo transcurrido ----------
	function contador() {
		// 10 de febrero de 2025, 16:26 (hora local del visitante).
		var fechaInicio = new Date(2025, 1, 10, 16, 26, 0);
		var vistaActual = 'normal';

		var botones = document.querySelectorAll('.btn-tiempo');
		var vistaNormal = document.getElementById('vista-normal');
		var vistaUnica = document.getElementById('vista-unica');
		var valorUnico = document.getElementById('valor-unico');
		var etiquetaUnica = document.getElementById('etiqueta-unica');
		if (!vistaNormal || !vistaUnica) { return; }

		var campos = {};
		['anos', 'meses', 'dias', 'horas', 'minutos', 'segundos'].forEach(function (id) {
			campos[id] = document.getElementById(id);
		});

		function formatearNumero(numero, decimales) {
			return numero.toLocaleString('es-CL', {
				minimumFractionDigits: decimales,
				maximumFractionDigits: decimales
			});
		}

		// Años decimales reales: años calendario completos + fracción del año en curso
		// (usa la duración real de ese año entre aniversarios, respetando bisiestos).
		function anosDecimales(inicio, fin) {
			var years = fin.getFullYear() - inicio.getFullYear();
			var aniv = new Date(inicio);
			aniv.setFullYear(inicio.getFullYear() + years);
			if (aniv > fin) {
				years--;
				aniv = new Date(inicio);
				aniv.setFullYear(inicio.getFullYear() + years);
			}
			var siguienteAniv = new Date(inicio);
			siguienteAniv.setFullYear(inicio.getFullYear() + years + 1);
			return years + (fin - aniv) / (siguienteAniv - aniv);
		}

		// Meses decimales reales: meses calendario completos + fracción del mes en curso
		// (usa la duración real de ese mes, sin promedios).
		function mesesDecimales(inicio, fin) {
			var totalMeses = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());
			var aniv = new Date(inicio);
			aniv.setMonth(inicio.getMonth() + totalMeses);
			if (aniv > fin) {
				totalMeses--;
				aniv = new Date(inicio);
				aniv.setMonth(inicio.getMonth() + totalMeses);
			}
			var siguienteAniv = new Date(inicio);
			siguienteAniv.setMonth(inicio.getMonth() + totalMeses + 1);
			return totalMeses + (fin - aniv) / (siguienteAniv - aniv);
		}

		function actualizar() {
			var ahora = new Date();
			var diferenciaMs = ahora - fechaInicio;

			if (vistaActual === 'normal') {
				var anos = ahora.getFullYear() - fechaInicio.getFullYear();
				var meses = ahora.getMonth() - fechaInicio.getMonth();
				var dias = ahora.getDate() - fechaInicio.getDate();
				var horas = ahora.getHours() - fechaInicio.getHours();
				var minutos = ahora.getMinutes() - fechaInicio.getMinutes();
				var segundos = ahora.getSeconds() - fechaInicio.getSeconds();

				if (segundos < 0) { segundos += 60; minutos--; }
				if (minutos < 0) { minutos += 60; horas--; }
				if (horas < 0) { horas += 24; dias--; }
				if (dias < 0) {
					// Días del mes anterior al actual.
					dias += new Date(ahora.getFullYear(), ahora.getMonth(), 0).getDate();
					meses--;
				}
				if (meses < 0) { meses += 12; anos--; }

				campos.anos.textContent = anos;
				campos.meses.textContent = meses;
				campos.dias.textContent = dias;
				campos.horas.textContent = horas;
				campos.minutos.textContent = minutos;
				campos.segundos.textContent = segundos;
				return;
			}

			var valor;
			var etiqueta;
			switch (vistaActual) {
				case 'anos':
					valor = formatearNumero(anosDecimales(fechaInicio, ahora), 5);
					etiqueta = 'años';
					break;
				case 'meses':
					valor = formatearNumero(mesesDecimales(fechaInicio, ahora), 5);
					etiqueta = 'meses';
					break;
				case 'dias':
					valor = formatearNumero(Math.floor(diferenciaMs / 86400000), 0);
					etiqueta = 'días';
					break;
				case 'horas':
					valor = formatearNumero(Math.floor(diferenciaMs / 3600000), 0);
					etiqueta = 'horas';
					break;
				default:
					valor = formatearNumero(Math.floor(diferenciaMs / 1000), 0);
					etiqueta = 'segundos';
			}
			valorUnico.textContent = valor;
			etiquetaUnica.textContent = etiqueta;
		}

		function mostrarVista(vista) {
			vistaActual = vista;
			vistaNormal.hidden = vista !== 'normal';
			vistaUnica.hidden = vista === 'normal';
			botones.forEach(function (boton) {
				var activo = boton.dataset.vista === vista;
				boton.classList.toggle('activo', activo);
				boton.setAttribute('aria-pressed', activo ? 'true' : 'false');
			});
			actualizar();
		}

		botones.forEach(function (boton) {
			boton.addEventListener('click', function () { mostrarVista(boton.dataset.vista); });
		});

		mostrarVista('normal');
		setInterval(actualizar, 1000);
	}

	function iniciar() {
		// Cada parte se aísla para que un fallo no deje la página en blanco.
		[contador, animarAlEntrar, botonArriba, visorDeFotos].forEach(function (fn) {
			try { fn(); } catch (error) { console.error(error); }
		});
		ocultarLoader();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', iniciar);
	} else {
		iniciar();
	}
}());
