/* FYRVEK — main.js */
(function () {
  'use strict';

  /* Header: solid on scroll */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Mobile menu */
  var menuBtn = document.querySelector('.menu-btn');
  var navLinks = document.querySelector('.nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* Contact form: preselect service from ?service= */
  var select = document.getElementById('service');
  if (select) {
    var wanted = new URLSearchParams(window.location.search).get('service');
    if (wanted) {
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === wanted) { select.selectedIndex = i; break; }
      }
    }
  }

  /* Contact form: async submit to Web3Forms */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) { return; }
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending\u2026';
      status.className = 'form-status';
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form)
      }).then(function (r) { return r.json(); }).then(function (data) {
        if (data.success) {
          form.reset();
          status.textContent = 'Thanks, your message is in. I reply within 24 hours on working days.';
          status.className = 'form-status ok';
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      }).catch(function () {
        status.textContent = 'Something went wrong sending the form. Please email hello@fyrvek.com directly.';
        status.className = 'form-status err';
      }).finally(function () {
        btn.disabled = false;
        btn.textContent = 'Send message';
      });
    });
  }
  /* Carousels: arrows + counter */
  document.querySelectorAll('[data-carousel]').forEach(function (c) {
    var track = c.querySelector('.c-track');
    var slides = track.children;
    var count = c.querySelector('.c-count');
    var btns = c.querySelectorAll('.c-btn');
    function step() { return slides[0].getBoundingClientRect().width + 18; }
    function update() {
      var i = Math.round(track.scrollLeft / step());
      var visible = Math.max(1, Math.round(track.clientWidth / step()));
      count.textContent = Math.min(i + 1, slides.length) + ' / ' + slides.length;
      btns[0].disabled = track.scrollLeft < 4;
      btns[1].disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4 || i + visible >= slides.length;
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () { track.scrollBy({ left: step() * Number(b.dataset.dir), behavior: 'smooth' }); });
    });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();
