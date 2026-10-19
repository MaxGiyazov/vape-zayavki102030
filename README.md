# Заявки — PWA для товарных заявок

Отдельная PWA-сборка приложения товарных заявок. Внутренняя логика версии 1.3
(модалка цветов, наличие по цветам, корзина, batch-ввод, редактирование каталога,
тёмная тема, экспорт в буфер обмена, фильтры) сохранена без изменений.

## Стек

| Параметр | Значение |
| --- | --- |
| Фреймворк | React 18.3.1 |
| Сборщик | Vite 5.4.x |
| Язык | TypeScript 5.6.x |
| Стили | Tailwind CSS 3.4.x + shadcn/ui-компоненты |
| Состояние | Zustand 4.5 + `localStorage` |
| Менеджер пакетов | npm |
| Node.js | 20.x (`.nvmrc`), минимум 18.17 |
| dev | `npm run dev` |
| build | `npm run build` → `dist/` |
| preview | `npm run preview` |
| typecheck | `npm run typecheck` |

Все данные приложения хранятся в `localStorage` браузера. Бэкенда нет.

## Структура

```text
vape-zayavki/
├── index.html                 шаблон Vite
├── package.json
├── package-lock.json
├── vite.config.ts             base path + alias @ → src
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── .nvmrc                     20
├── .github/workflows/deploy.yml
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── icons/
│       ├── icon-192.png
│       ├── icon-512.png
│       ├── icon-maskable-512.png
│       └── apple-touch-icon.png
└── src/
    ├── main.tsx               React root + регистрация SW
    ├── App.tsx                hash-роутер и каркас
    ├── index.css              Tailwind и токены темы
    ├── components/            UI и бизнес-компоненты
    ├── hooks/
    ├── lib/                   store, каталог, batch, экспорт
    └── pages/                 Home, Category, Cart, Settings, NotFound
```

### Про маршрутизацию

В PWA используется hash-роутинг (`#/cart`, `#/category/hardware`). Это осознанное
решение для GitHub Pages: статический хостинг не умеет отдавать `index.html` для
произвольных путей, а hash-адреса не требуют серверного fallback и не дают 404 при
перезагрузке.

## Установка зависимостей

```bash
npm ci
```

## Локальная разработка

```bash
npm run dev
```

Откройте `http://localhost:5173`. В dev-режиме service worker **не регистрируется**.

## Production-сборка и предпросмотр

```bash
npm run build
npm run preview
```

`npm run preview` открывает `dist/` и регистрирует service worker, потому что
`import.meta.env.PROD === true`.

### Сборка под подпапку GitHub Pages

По умолчанию `VITE_BASE_PATH` равен `/`. Для проекта GitHub Pages укажите имя
репозитория:

```bash
# macOS / Linux / Git Bash
VITE_BASE_PATH=/REPO/ npm run build

# Windows PowerShell
$env:VITE_BASE_PATH='/REPO/'
npm run build
```

Если имя репозитория ещё неизвестно, можно использовать относительный base:

```bash
VITE_BASE_PATH=./ npm run build
```

В GitHub Actions переменная выставляется автоматически из имени репозитория:
`VITE_BASE_PATH=/${{ github.event.repository.name }}/`.

## Деплой на GitHub Pages

> Важно: репозиторий должен быть **публичным** — GitHub Pages бесплатен для публичных
> репозиториев (с ограничениями, см. ниже).

> Корнем нового репозитория должна быть именно папка `vape-zayavki/`, чтобы файл
> `.github/workflows/deploy.yml` оказался в корне репозитория. Не пушьте всю
> родительскую папку с другим приложением.

1. Создайте публичный репозиторий на [github.com](https://github.com):
   **New repository → Public**, без README и `.gitignore` (чтобы не было конфликта
   с уже подготовленными файлами).
2. Откройте **Settings → Pages**.
3. В блоке **Build and deployment → Source** выберите **GitHub Actions**
   (не «Deploy from a branch»).
4. Локально выполните из папки `vape-zayavki/`:

   ```bash
   git init
   git add .
   git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```

5. Откройте вкладку **Actions** репозитория и дождитесь зелёной галочки workflow
   `Deploy PWA to GitHub Pages` (обычно 1–3 минуты).
6. Приложение будет доступно по адресу:

   ```text
   https://USERNAME.github.io/REPO/
   ```

Имя `REPO` должно совпадать с именем репозитория. В workflow base path вычисляется
из `github.event.repository.name`, поэтому менять код при переименовании не нужно.
Исключение — user-site репозиторий `USERNAME.github.io`: для него в workflow нужно
задать `VITE_BASE_PATH: /`, потому что сайт публикуется в корне домена.

## Установка на телефон

### iPhone / iPad

1. Откройте `https://USERNAME.github.io/REPO/` в **Safari**.
2. Нажмите **Поделиться**.
3. Выберите **На экран «Домой»**.
4. Нажмите **Добавить**.

Приложение откроется в standalone-режиме без адресной строки Safari.

### Android

1. Откройте `https://USERNAME.github.io/REPO/` в **Chrome**.
2. Откройте меню (три точки).
3. Выберите **Установить приложение** или **Добавить на главный экран**.
4. Подтвердите установку.

## Обновление

```bash
git add .
git commit -m "update"
git push
```

Workflow автоматически пересоберёт и опубликует новую версию. Если менялся
`public/sw.js`, обязательно увеличьте `CACHE_VERSION` в первой строке файла —
иначе браузер может продолжать отдавать старые файлы из кэша.

## Откат

```bash
git revert HEAD
git push
```

Workflow опубликует предыдущее состояние. После отката также рекомендуется увеличить
`CACHE_VERSION`, если изменения затрагивали service worker.

## Ограничения бесплатного тарифа GitHub Pages

- Репозиторий должен быть публичным.
- Размер опубликованных артефактов Pages — до 1 ГБ.
- Ориентировочный лимит трафика — около 100 ГБ в месяц.
- Нет серверной логики и произвольных HTTP-заголовков.
- Для внутреннего приложения заявок этих лимитов с большим запасом.

## Проверка

### 1. Dev-режим

```bash
npm run dev
```

- приложение открывается;
- service worker не регистрируется;
- в консоли нет ошибок.

### 2. Production-сборка и preview

```bash
npm run build
npm run preview
```

- приложение открывается с учётом base;
- service worker регистрируется;
- в DevTools → Application → Service Workers статус `activated`.

### 3. Manifest

Chrome DevTools → **Application → Manifest**:

- нет ошибок валидации;
- name, short_name, start_url, scope, display, orientation заполнены;
- иконки 192×192, 512×512, maskable 512×512 и apple-touch-icon 180×180 загружаются.

### 4. Service Worker и кэш

Chrome DevTools → **Application → Service Workers**:

- статус `activated`;
- Cache Storage содержит текущую версию из `CACHE_VERSION` (сейчас `vape-zayavki-v1.4.0-beta.3`);
- в кэше есть `index.html`, manifest и иконки.

### 5. Offline

DevTools → **Network → Offline**, затем перезагрузите страницу. Приложение должно
открыться из кэша.

### 6. Lighthouse

Lighthouse → категория **PWA**:

- Installable;
- Service Worker зарегистрирован;
- manifest валиден.

### 7. Локальная симуляция GitHub Pages

```bash
# Windows PowerShell
$env:VITE_BASE_PATH='/REPO/'
npm run build
```

Затем разместите содержимое `dist/` в каталоге `REPO/` любого локального
статического сервера и откройте `http://localhost:PORT/REPO/`. Проверьте, что нет
404 по JS, CSS, manifest и иконкам.

Пример с Python:

```bash
mkdir -p /tmp/pages-site
cp -r dist /tmp/pages-site/REPO
cd /tmp/pages-site
python -m http.server 8080
```

Откройте `http://localhost:8080/REPO/`.

### 8. Реальный деплой

После пуша в `main`:

- workflow зелёный;
- приложение открывается по `https://USERNAME.github.io/REPO/`;
- устанавливается на iPhone и Android;
- работает в авиарежиме после первого успешного открытия.

### 9. Регрессии внутренней логики

Проверьте вручную:

- модалка выбора цветов;
- наличие по каждому цвету;
- корзина с подпозициями «Модель (Цвет) — N шт.»;
- batch-ввод форматов A и B;
- редактирование и удаление каталога;
- тёмная тема;
- экспорт каталога в буфер обмена и fallback-модалка.
