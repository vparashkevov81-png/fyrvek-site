# FYRVEK — Инструкции за пускане на сайта

Всичко в тази папка е готовият сайт fyrvek.com. Следвай стъпките по ред.
Общо време: около 30 минути + до 24 часа изчакване за DNS.

## Стъпка 1. Качване в GitHub (10 мин)

1. Влез в github.com със своя акаунт (същия, с който направи FlexCore).
2. Създай ново repository с име: fyrvek-site (Public).
3. Качи ЦЯЛОТО съдържание на тази папка в repo-то
   (важно: index.html трябва да е в главната директория, не в подпапка).
4. Отиди в Settings → Pages → Source: избери "Deploy from a branch",
   branch: main, folder: / (root). Запази.
5. След 1-2 минути сайтът ще е жив на адрес от вида:
   https://ТВОЕТО-ПОТРЕБИТЕЛСКО-ИМЕ.github.io/fyrvek-site/

## Стъпка 2. Свързване на fyrvek.com (10 мин + изчакване)

В панела на регистратора, откъдето купи fyrvek.com, отвори DNS настройките.

ВНИМАНИЕ: НЕ ПИПАЙ съществуващите MX записи и TXT записите на Google
Workspace. Те са пощата ти. Само ДОБАВЯШ новите записи по-долу.

Добави тези 4 записа тип A за @ (главния домейн):

    A   @   185.199.108.153
    A   @   185.199.109.153
    A   @   185.199.110.153
    A   @   185.199.111.153

Добави 1 запис тип CNAME за www:

    CNAME   www   ТВОЕТО-ПОТРЕБИТЕЛСКО-ИМЕ.github.io

После в GitHub: Settings → Pages → Custom domain: въведи fyrvek.com
и запази. Изчакай проверката да мине (може до 24 часа заради DNS)
и сложи отметка на "Enforce HTTPS".

Файлът CNAME в папката вече съдържа fyrvek.com — не го трий.

## Стъпка 3. Активиране на формата за контакт (5 мин)

1. Отиди на web3forms.com → Create your Access Key.
2. Въведи hello@fyrvek.com → ще получиш ключ на пощата.
3. Отвори файла contact/index.html и намери реда:
       value="YOUR_WEB3FORMS_ACCESS_KEY"
   Замени YOUR_WEB3FORMS_ACCESS_KEY с истинския ключ. Запази и качи
   промяната в GitHub (Edit файла директно в сайта на GitHub е най-лесно).
4. Тествай: попълни формата от телефона си. Съобщението трябва да
   пристигне в hello@fyrvek.com до минута.

## Стъпка 4. Search Console (5 мин)

1. search.google.com/search-console → Add property → Domain → fyrvek.com.
2. Потвърди с TXT записа, който Google ти даде (пак в DNS панела).
3. Sitemaps → добави: https://fyrvek.com/sitemap.xml

## Какво може да се сменя лесно после

- Снимката ти на About страницата: в about/index.html има коментар
  <!-- Replace the block below with a real founder photograph... -->
  точно където отива снимката.
- LinkedIn адресът в долната част на всяка страница (footer):
  сега сочи към linkedin.com/in/veselin-parashkevov — ако адресът ти
  е различен, кажи ми и ще го сменя навсякъде с една команда.
- Цената на одита ($150) е само на една страница: services/audit/index.html.

## Ако нещо се обърка

Прати ми screenshot на екрана, където си блокирал, и продължаваме оттам.
