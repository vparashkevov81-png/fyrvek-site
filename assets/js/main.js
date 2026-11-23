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
  var BG = document.documentElement.lang === 'bg';
  if (form) {
    var status = document.getElementById('form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) { return; }
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = BG ? 'Изпращане\u2026' : 'Sending\u2026';
      status.className = 'form-status';
      var payload = new FormData(form);
      var selEl = form.querySelector('#service');
      var svcName = selEl && selEl.selectedIndex > -1 ? selEl.options[selEl.selectedIndex].text : '';
      var whoName = String(payload.get('name') || '').trim().replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      if (svcName) { payload.set('service', svcName); }
      var svcShort = svcName.replace(/\s*\(.*\)$/, '');
      payload.set('subject', (selEl && selEl.value !== 'unsure' && svcShort ? svcShort + ' request' : 'New enquiry') + ' from ' + (whoName || 'fyrvek.com') + (BG ? ' [BG]' : ''));
      payload.set('from_name', 'FYRVEK website');
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: payload
      }).then(function (r) { return r.json(); }).then(function (data) {
        if (data.success) {
          var svc = (form.querySelector('#service') || {}).value;
          var msgs = BG ? {
            'free-audit': 'Благодаря, заявката ви за безплатен одит е получена. До 5 работни дни ще получите три писмени препоръки за имейлите си.',
            'starter': 'Благодаря, заявката ви е получена. До 24 часа в работни дни ще получите писмена оферта с фиксирана цена, обхват и срокове.',
            'audit': 'Благодаря, заявката ви за Пълен одит е получена. До 24 часа в работни дни ще потвърдя подробностите и какъв достъп ми трябва.'
          } : {
            'free-audit': 'Thanks, your free audit request is in. Within 5 working days you get three written fixes for your emails.',
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
                properties:{service: svc || 'unsure', service_label: labels[svc] || 'your project', store_url: String(fd.get('store_url') || '').replace(/^https?:\/\//,'').replace(/\/$/,''), source:'fyrvek.com contact form', lang: BG ? 'bg' : 'en'},
                metric:{data:{type:'metric',attributes:{name:'Submitted Contact Form'}}},
                profile:{data:{type:'profile',attributes:{email: String(fd.get('email') || '').trim(), first_name: nm.split(/\s+/)[0] || undefined}}}
              }}})
            }).catch(function(){});
          } catch (err) {}
          form.reset();
          status.textContent = msgs[svc] || (BG ? 'Благодаря, съобщението ви е получено. Отговарям до 24 часа в работни дни.' : 'Thanks, your message is in. I reply within 24 hours on working days.');
          status.className = 'form-status ok';
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      }).catch(function () {
        status.textContent = BG ? 'Нещо се обърка при изпращането. Моля, пишете ми директно на hello@fyrvek.com.' : 'Something went wrong sending the form. Please email hello@fyrvek.com directly.';
        status.className = 'form-status err';
      }).finally(function () {
        btn.disabled = false;
        btn.textContent = BG ? 'Изпратете' : 'Send message';
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

/* Ad lab: hooks by awareness level */
(function(){
  var lab=document.querySelector('.adlab');if(!lab)return;
  var ads=[
    {tx:'Turn your protein tub around. If the label says “proprietary blend”, you have no idea how much of anything is inside.',h:'Every dose on the front of the label',c:'Learn more'},
    {tx:'25 g of whey isolate per scoop. Low carbs, no added sugar, and every dose printed on the front. Third-party tested for banned substances.',h:'Whey Isolate, nothing hidden',c:'Shop now'},
    {tx:'Still thinking about HALDEN? Take 15% off your first order with WELCOME15. Not for you? Your money back within 30 days.',h:'15% off your first order',c:'Get 15% off'}
  ];
  var els={tx:lab.querySelector('[data-ad="tx"]'),h:lab.querySelector('[data-ad="h"]'),c:lab.querySelector('[data-ad="c"]')};
  var btns=[].slice.call(lab.querySelectorAll('.hook')),cur=0,timer=null,user=false;
  function show(i){if(i===cur)return;cur=i;
    btns.forEach(function(b,k){var on=k===i;b.classList.toggle('on',on);b.setAttribute('aria-selected',on?'true':'false');});
    Object.keys(els).forEach(function(k){els[k].classList.add('is-swap');});
    setTimeout(function(){Object.keys(els).forEach(function(k){els[k].textContent=ads[i][k];els[k].classList.remove('is-swap');});},220);}
  btns.forEach(function(b,k){b.addEventListener('click',function(){user=true;clearInterval(timer);show(k);});});
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting&&!user&&!timer){timer=setInterval(function(){show((cur+1)%3);},4200);}
      if(!e.isIntersecting&&timer){clearInterval(timer);timer=null;}});},{threshold:.4});
    io.observe(lab);
  }
})();

/* Funnel checklist */
(function(){
  var f=document.querySelector('.funnel');if(!f)return;
  var boxes=[].slice.call(f.querySelectorAll('input[type=checkbox]')),cnt=f.querySelector('.fn-count'),msg=f.querySelector('.fn-msg');
  function upd(){var n=boxes.filter(function(b){return b.checked;}).length;
    var miss=boxes.map(function(b){return b.checked?null:b.closest('label').querySelector('b').textContent;}).filter(Boolean);
    var bg=document.documentElement.lang==='bg';
    cnt.textContent=n+(bg?' от 6':' of 6');
    if(n===0)msg.textContent=bg?'Отметнете какво имате, за да видите какво липсва.':'Tick the flows you have to see what is missing.';
    else if(n===6)msg.textContent=bg?'И шестте етапа са покрити. Безплатният одит проверява колко добре работи всеки от тях.':'All six stages covered. The free audit checks how well each one actually works.';
    else msg.textContent=(bg?'Липсват: ':'Missing: ')+miss.join(', ')+(bg?'. Безплатният одит показва кое да оправите първо.':'. The free audit shows which one to fix first.');}
  boxes.forEach(function(b){b.addEventListener('change',upd);});
})();
