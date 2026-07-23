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
          status.textContent = 'Received. You will hear back within one business day with a real reply, written by the person who read your message.';
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
})();
