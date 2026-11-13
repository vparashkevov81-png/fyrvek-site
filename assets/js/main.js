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
          var svc = (form.querySelector('#service') || {}).value;
          var msgs = {
            'free-audit': 'Thanks, your free audit request is in. I will sign up to your store and send you three written fixes within 5 working days.',
            'starter': 'Thanks, your request is in. Within 24 hours on working days you get a written quote with a fixed price, scope and dates.',
            'audit': 'Thanks, your Journey Audit request is in. Within 24 hours on working days I confirm the details and what access I need.'
          };
          try {
            var fd = new FormData(form);
            var nm = String(fd.get('name') || '').trim();
            var labels = {'free-audit':'a free email audit','starter':'a welcome flow and pop-up','audit':'a Journey Audit','retention':'a Retention Sprint','conversion':'a Conversion Sprint','creative':'Campaign Creative','launch':'a Launch Sprint','partnership':'monthly email work','unsure':'your project'};
            fetch('https://a.klaviyo.com/client/events/?company_id=UYKBJg', {
              method: 'POST',
              headers: {'Content-Type': 'application/json', 'revision': '2024-10-15'},
              body: JSON.stringify({data:{type:'event',attributes:{
                properties:{service: svc || 'unsure', service_label: labels[svc] || 'your project', store_url: String(fd.get('store_url') || '').replace(/^https?:\/\//,'').replace(/\/$/,''), source:'fyrvek.com contact form'},
                metric:{data:{type:'metric',attributes:{name:'Submitted Contact Form'}}},
                profile:{data:{type:'profile',attributes:{email: String(fd.get('email') || '').trim(), first_name: nm.split(/\s+/)[0] || undefined}}}
              }}})
            }).catch(function(){});
          } catch (err) {}
          form.reset();
          status.textContent = msgs[svc] || 'Thanks, your message is in. I reply within 24 hours on working days.';
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
  /* Mobile sticky CTA: show after the hero */
  var sticky = document.querySelector('.sticky-cta');
  if (sticky) {
    var onS = function () { sticky.classList.toggle('show', window.scrollY > 640); };
    window.addEventListener('scroll', onS, { passive: true });
    onS();
  }
})();

/* Scroll motion */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce)return;
  /* reveal with stagger */
  if('IntersectionObserver' in window){
    var sel='main .section-head h2, main .section-head p, main .shots > *, main .card, main .stats > div, main .pstep, main .work-item, main .checks li, main .faq details, main .review, main .c-slide, main .work-gallery figure';
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll(sel).forEach(function(el){
      if(el.closest('.hero-wall'))return;
      if(el.getBoundingClientRect().top<innerHeight*.9)return;
      var sib=Array.prototype.indexOf.call(el.parentNode.children,el);
      el.style.setProperty('--d',Math.min(sib,6)*0.08+'s');
      el.classList.add('reveal');io.observe(el);
    });
    /* count up */
    var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;cio.unobserve(e.target);
      var el=e.target,end=+el.dataset.count,suf=el.dataset.suffix||'',t0=null;
      function step(t){if(!t0)t0=t;var k=Math.min((t-t0)/1200,1);k=1-Math.pow(1-k,3);el.textContent=Math.round(end*k)+suf;if(k<1)requestAnimationFrame(step);}
      el.textContent='0'+suf;requestAnimationFrame(step);});},{threshold:.6});
    document.querySelectorAll('[data-count]').forEach(function(el){cio.observe(el);});
  }
  /* scroll-linked rails and gentle parallax */
  var rails=[].slice.call(document.querySelectorAll('.rail'));
  var par=[].slice.call(document.querySelectorAll('.shot img'));
  if(!rails.length&&!par.length)return;
  var ticking=false;
  function update(){
    ticking=false;var vh=innerHeight;
    rails.forEach(function(r){var b=r.getBoundingClientRect();if(b.bottom<-200||b.top>vh+200)return;
      var p=(b.top+b.height/2-vh/2)/vh;var dir=+r.dataset.dir;
      r.firstElementChild.style.transform='translate3d('+(dir*p*420-(dir<0?0:600))+'px,0,0)';});
    par.forEach(function(img){var b=img.getBoundingClientRect();if(b.bottom<0||b.top>vh)return;
      var p=(b.top+b.height/2-vh/2)/vh;img.style.objectPosition='50% '+(50+p*30)+'%';});
  }
  addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(update);}},{passive:true});
  addEventListener('resize',update);update();
})();
