"""Build /bg/ pages from the English pages using the translation tables in tools/bg_*.py."""
import json,re,os,glob,sys,importlib.util
from bs4 import BeautifulSoup,NavigableString
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
T={}
for p in sorted(glob.glob('tools/bg_[a-z].py')):
    spec=importlib.util.spec_from_file_location('m',p);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);T.update(m.T)
UNITS=json.load(open('tools/units.json'))
IDX={u:i for i,u in enumerate(UNITS)}
INLINE={'b','strong','em','i','s','a','br','small','span','code','sup','sub','abbr'}
KEEP_EN=set(json.load(open('tools/keep_en.json')))
def has_text(el): return any(isinstance(c,NavigableString) and re.search('[A-Za-z]{2}',c) for c in el.descendants)
def is_unit(el):
    if el.name in('script','style','svg'): return False
    for d in el.descendants:
        if getattr(d,'name',None) and d.name not in INLINE: return False
    return has_text(el)
missing=[]
def walk(el):
    for c in list(el.children):
        if not getattr(c,'name',None) or c.name in('script','style','svg','head'): continue
        if is_unit(c):
            k=c.decode_contents().strip()
            i=IDX.get(k)
            if i is None or (i not in T and i not in KEEP_EN): missing.append((i,k[:90])); continue
            if i in T:
                c.clear(); c.append(BeautifulSoup(T[i],'html.parser'))
        else: walk(c)
HEAD={
'index.html':('Реклами, сайтове и имейли за онлайн бизнеси | FYRVEK','Реклами, сайтове, социални мрежи и имейли за онлайн бизнеси, написани, проектирани и изградени от един човек. Започнете с безплатен одит: 3 конкретни препоръки до 5 работни дни.'),
'work/index.html':('Портфолио: имейли, реклами и продаващи страници | FYRVEK','Имейл автоматизации, кампании, продаващи страници и реклами за Meta, показани имейл по имейл.'),
'services/index.html':('Услуги: имейл маркетинг, реклами и продаващи страници | FYRVEK','Имейл маркетинг за онлайн магазини, продаващи страници, реклами за Facebook и Instagram и пускане на нови продукти.'),
'services/welcome-flow/index.html':('Welcome серия и pop-up за онлайн магазин | FYRVEK','Pop-up за записване и welcome серия от 4 имейла, написани, проектирани и изградени. 190 € стартова цена, готово за 14 дни.'),
'services/audit/index.html':('Безплатен одит на имейлите за онлайн магазини | FYRVEK','Безплатен одит: три писмени препоръки за welcome серията, изоставената количка и формата за записване. Или Пълен одит на целия път на клиента.'),
'services/retention/index.html':('Изоставена количка, имейли след покупка и връщане на клиенти | FYRVEK','Автоматизации, които продават и след първата поръчка: изоставена количка, след покупка и връщане на неактивни клиенти.'),
'services/conversion/index.html':('Продаваща страница (landing page) за онлайн магазин | FYRVEK','Продаващи и продуктови страници с едно ясно обещание, от първия екран до плащането. Текст, дизайн и код.'),
'services/creative/index.html':('Реклами за Facebook и Instagram, текстове и UGC сценарии | FYRVEK','Рекламни концепции за Meta, основни текстове, задания за визии и UGC сценарии за онлайн магазини.'),
'services/launch/index.html':('Пускане на нов продукт: страница, имейли и реклами | FYRVEK','Страницата, имейлите и рекламите разказват една история при пускането на нов продукт или колекция.'),
'pricing/index.html':('Цени: имейл маркетинг, реклами и продаващи страници | FYRVEK','Ясни цени за бизнеси в България: имейл маркетинг, реклами, продаващи страници, сайтове и социални мрежи. Стартови цени за първите 5 проекта.'),
'about/index.html':('За FYRVEK | Имейли, реклами и сайтове, които продават','FYRVEK е студио от един човек за имейл маркетинг и продаващ текст за онлайн магазини, от България.'),
'contact/index.html':('Контакт и безплатен одит | FYRVEK','Разкажете ми за бизнеса си и получете безплатен одит на имейлите или писмена оферта. Отговор до 24 часа в работни дни.'),
'privacy/index.html':('Политика за поверителност | FYRVEK','Как FYRVEK обработва личните данни, споделени чрез fyrvek.com.'),
'404.html':('Страницата не е намерена | FYRVEK','Тази страница не съществува.'),
}
def url_of(f): return '/'+(f[:-len('index.html')] if f.endswith('index.html') else f)
def bg_href(h):
    if not h.startswith('/') or h.startswith('//') or h.startswith('/assets') or h.startswith('/favicon') or h.startswith('/bg/'): return h
    return '/bg'+h
def add_switch(soup,target,label):
    ul=soup.select_one('ul.nav-links')
    if not ul: return
    for old in ul.select('li.lang'): old.decompose()
    li=soup.new_tag('li',attrs={'class':'lang'})
    a=soup.new_tag('a',href=target,hreflang='bg' if label=='БГ' else 'en'); a['class']='lang-sw'; a['aria-label']='Български' if label=='БГ' else 'English'
    a.string=label; li.append(a)
    btn=ul.select_one('a.btn')
    (btn.parent.insert_before(li) if btn else ul.append(li))
def add_alt(soup,en_url):
    for l in soup.select('link[rel=alternate][hreflang]'): l.decompose()
    for lang,u in (('en','https://fyrvek.com'+en_url),('bg','https://fyrvek.com/bg'+en_url),('x-default','https://fyrvek.com'+en_url)):
        soup.head.append(soup.new_tag('link',rel='alternate',hreflang=lang,href=u))
PRICING_EXTRA='''<div class="pr-group"><p class="eyebrow">Сайтове и социални мрежи</p><h2>Присъствие, което работи и когато не сте онлайн.</h2></div>
<div class="pc-grid two">
<div class="pc"><h3>Малък сайт</h3><p class="pc-desc">Сайт до 5 страници за малък бизнес, с текст, дизайн и код.</p><div class="pc-price"><b>от 250 €</b> <s>400 €</s><span>еднократно</span></div><ul class="checks"><li>До 5 страници: начало, услуги, за нас, контакт и още една</li><li>Текстове, които обясняват защо да изберат вас</li><li>Дизайн за компютър и телефон</li><li>Форма за контакт и основно SEO</li></ul><a class="btn btn-outline" href="/bg/contact/?service=unsure">Искам сайт</a></div>
<div class="pc"><h3>Социални мрежи</h3><p class="pc-desc">Редовни постове за Facebook и Instagram в стила на марката ви.</p><div class="pc-price"><b>200 €</b> <s>300 €</s><span>на месец</span></div><ul class="checks"><li>8 поста на месец: карусели и единични визии</li><li>Текстове към всеки пост</li><li>Месечен план за одобрение предварително</li><li>Прекратявате всеки месец, писмено</li></ul><a class="btn btn-outline" href="/bg/contact/?service=unsure">Питайте за социални мрежи</a></div>
</div>'''
def build(f):
    soup=BeautifulSoup(open(f).read(),'lxml')
    walk(soup.body)
    soup.html['lang']='bg'
    t,d=HEAD[f]
    soup.title.string=t
    for sel,val in (('meta[name=description]',d),('meta[property="og:description"]',d),('meta[property="og:title"]',t)):
        m=soup.select_one(sel)
        if m: m['content']=val
    en_url=url_of(f)
    for sel,attr in (('link[rel=canonical]','href'),('meta[property="og:url"]','content')):
        m=soup.select_one(sel)
        if m and m.get(attr,'').startswith('https://fyrvek.com'): m[attr]='https://fyrvek.com/bg'+en_url
    if not soup.select_one('meta[property="og:locale"]'):
        soup.head.append(soup.new_tag('meta',property='og:locale',content='bg_BG'))
    add_alt(soup,en_url)
    for a in soup.select('a[href]'): a['href']=bg_href(a['href'])
    for fm in soup.select('form[action]'): fm['action']=bg_href(fm['action'])
    add_switch(soup,en_url,'EN')
    if f=='pricing/index.html':
        audits=[g for g in soup.select('.pr-group') if 'Одити' in g.get_text()][0]
        audits.insert_before(BeautifulSoup(PRICING_EXTRA,'html.parser'))
    html=str(soup).replace('<b>$99</b> <s>$150</s>','<b>49 €</b> <s>79 €</s>').replace('<b>$49</b> <s>$69</s>','<b>20 €</b> <s>30 €</s>').replace('<div class="pa-price"><b>$0</b></div>','<div class="pa-price"><b>0 €</b></div>')
    out=os.path.join('bg',f); os.makedirs(os.path.dirname(out) or 'bg',exist_ok=True)
    open(out,'w').write(html)
    # English page: switch + alternates
    src=open(f).read()
    if 'class="lang"' not in src:
        alt=''.join(f'<link rel="alternate" hreflang="{l}" href="{u}">\n' for l,u in (('en','https://fyrvek.com'+en_url),('bg','https://fyrvek.com/bg'+en_url),('x-default','https://fyrvek.com'+en_url)))
        src=src.replace('</head>',alt+'</head>',1)
        sw=f'<li class="lang"><a class="lang-sw" href="/bg{en_url}" hreflang="bg" aria-label="Български">БГ</a></li>\n      '
        i=src.index('<ul class="nav-links">'); j=src.index('<li><a class="btn btn-primary"',i)
        src=src[:j]+sw+src[j:]
        open(f,'w').write(src)
for f in HEAD: build(f)
if missing:
    print('MISSING',len(missing)); [print(' ',m) for m in missing[:40]]
else: print('all units translated')
