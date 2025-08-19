# 🤖 AI CONTEXT FOR IDLEMANCERY PROJECT

> **ВАЖЛИВО ДЛЯ AI:** Цей файл містить ключову інформацію для розуміння проекту. 
> **НЕ МОДИФІКУВАТИ** цей файл без прямого запиту користувача!
> **ЗАВЖДИ ЧИТАТИ** перед внесенням змін до проекту!

## 🎯 ЩО ЦЕ ЗА ПРОЕКТ

**IdleMancery** - це idle RPG гра з магією і крафтингом, написана на React + Web Workers.

### Архітектура:
- **Frontend**: React компоненти в `src/components/`
- **Backend**: Web Worker логіка в `src/worker/modules/`
- **Framework**: Власний game-framework для керування сутностями, ресурсами та ефектами

## 🧠 КЛЮЧОВІ КОНЦЕПЦІЇ ДЛЯ AI

### 1. РЕСУРСИ vs ЕФЕКТИ (КРИТИЧНО ВАЖЛИВО!)

**РЕСУРСИ** (`gameResources.registerResource`):
- Конкретні речі з **кількістю**: coins, energy, mana, wood
- Можуть закінчуватися і поповнюватися
- Мають `amount`, `income`, `consumption`, `cap`

**ЕФЕКТИ** (`gameEffects.registerEffect`):
- Модифікатори що **впливають** на інші речі: strength, learning_rate
- Не "витрачаються", а "застосовуються" 
- Мають `value`, `defaultValue`, `minValue`

### 2. ПРІОРИТЕТ: ПРЯМІ RESOURCE MODIFIERS 

⚠️ **ПАМЯТКА КОРИСТУВАЧА [[memory:4014626]]:**
"Для прямого впливу на ресурси (дохід, ємність) використовувати resource modifiers, а не додаткові ефекти"

```javascript
// ✅ ПРАВИЛЬНО - прямий resource modifier
resourceModifier: {
    multiplier: {
        effects: {
            'expedition_resource_amount': { A: 0.25, B: 1, type: 0 }
        }
    }
}

// ❌ НЕПРАВИЛЬНО - створювати додатковий ефект для ресурсів
```

### 3. СТРУКТУРА resourceModifier

```javascript
resourceModifier: {
    get_income: () => ({
        resources: { 'coins': { A, B, type }},     // Дохід ресурсів
        effects: { 'learning_rate': { A, B, type }} // Приріст ефектів
    }),
    get_consumption: () => ({ resources: {...} }), // Витрати ресурсів
    get_multiplier: () => ({ 
        resources: {...},  // Множники ресурсів
        effects: {...}     // Множники ефектів (найчастіше використовується!)
    }),
    effectDeps: ['effect1', 'effect2'] // ТІЛЬКИ для resourceModifier!
}
```

### 3.1. Custom Amplifier (ручний множник інтенсивності)

`getCustomAmplifier` дозволяє вручну масштабувати інтенсивність модифікатора незалежно від автоматичної `efficiency` (дефіцити ресурсів, капи тощо). Добре підходить для повзунків навантаження (Machinery) або для інтенсивності дій від атрибутів.

- **Що це:** функція, що повертає множник у діапазоні зазвичай `[0..1]` (або більше, якщо потрібно).
- **Де застосовується:** до обраних типів/скоупів за допомогою `customAmplifierApplyTypes` і `customAmplifierApplyScopes`.
- **Як комбінується:** застосовується додатково до `efficiency` (тобто значення множаться).

Поля:

```javascript
resourceModifier: {
    // 1) Джерело ручного множника (наприклад, значення зі слайдера UI)
    getCustomAmplifier: () => number,

    // 2) До яких типів застосовувати: 'resources' і/або 'effects'
    customAmplifierApplyTypes: ['resources'],

    // 3) До яких скоупів застосовувати: підмножина з
    //    ['income','consumption','multiplier','rawCap','capMult']
    customAmplifierApplyScopes: ['income','consumption']
}
```

Замітки:
- Якщо `customAmplifierApplyScopes` не задано, за замовчуванням використовується повний набір `['income','consumption','multiplier','rawCap','capMult']` (див. `game-framework/src/game-entity/game-entity.js`).
- Для скоупів типу `multiplier`/`capMult` застосування здійснюється коректно у множниковій формі.

Приклад: повзунок навантаження для машини (Machinery)

```javascript
gameEntity.registerGameEntity('machine_sawmill', {
  tags: ['machine', 'property'],
  name: 'Sawmill',
  level: 0,
  attributes: {
    manualLoad: 0.7 // значення зі слайдера [0..1]
  },
  resourceModifier: {
    income: {
      resources: {
        'inventory_planks': { A: 0.01, B: 0.05, type: 0 }
      }
    },
    consumption: {
      resources: {
        'inventory_coal': { A: 0.02, B: 0.10, type: 0 }
      }
    },
    // Ручний регулятор інтенсивності, незалежний від дефіцитів
    getCustomAmplifier: () => gameEntity.getAttribute('machine_sawmill', 'manualLoad'),
    customAmplifierApplyTypes: ['resources'],
    customAmplifierApplyScopes: ['income','consumption']
  }
});
```

Приклад: інтенсивність дій від primaryAttribute

```javascript
// В діях зі вказаним primaryAttribute механізм уже використовується:
options.resourceModifier.getCustomAmplifier = () => options.getIntensityAspect();
// де getIntensityAspect повертає значення ефекту аспекту, що масштабує інтенсивність
```

## 📁 СТРУКТУРА ФАЙЛІВ

### Worker Modules (серверна логіка):
- `src/worker/modules/actions/actions-db.js` - дії гравця
- `src/worker/modules/items/shop-db.js` - магазин та апгрейди
- `src/worker/modules/resources/common-effects-db.js` - ефекти
- `src/worker/modules/expeditions/` - експедиції
- `src/worker/modules/property/artifacts-db.js` - артефакти

### React Components (UI):
- `src/components/property/artifacts.jsx` - компонент артефактів
- `src/components/shop/shop.jsx` - компонент магазину
- `src/components/actions/actions.jsx` - компонент дій

## 🔧 ПАТТЕРНИ КОДУ

### Реєстрація ефектів:
```javascript
gameEffects.registerEffect('expedition_resource_amount', {
    name: 'Expedition Resource Amount',
    defaultValue: 1.,
    minValue: 1,
    description: 'Multiplier to amount of resources found during expeditions'
})
```

### 🆕 Система нотифікацій “New” (Unlock Notifications)

- Модуль: `src/worker/shared/modules/unlock-notifications.module.js`
- Призначення: реєстрація будь-яких об’єктів як “потенційних до показу як New”, збереження станів `isUnlocked`/`isViewed`, видача агрегованих даних на UI.

1) Реєстрація

```javascript
gameCore.getModule('unlock-notifications').registerNewNotification(
  'scope',      // 'property' | 'actions' | 'shop' | 'spellbook' | 'workshop' | 'social'
  'category',   // підрозділ, напр. 'furniture', 'events', 'plantations', 'all'
  'subcategory',// опційно: коли є 4-й рівень. Інакше null/undefined
  id,           // унікальний id ентіті
  isUnlocked    // true якщо предмет вже розблокований та не “capped”
);
```

2) Генерація/оновлення

- Коли змінюється стан анлоків, модулі викликають:
```javascript
gameCore.getModule('unlock-notifications').generateNotifications();
```
- Це дериває `regenerateNotifications()` у ключових модулях (actions, shop, inventory, property, crafting, plantations, magic), які реєструють актуальні елементи через `registerNewNotification(...)`.

3) Видача на UI

- UI періодично викликає у воркера:
```javascript
sendData('query-new-unlocks-notifications', { suffix: 'property', scope: 'property' });
```
- Відповідь у каналі `new-unlocks-notifications-<suffix>` має форму дерева:
```json
{
  "property": {
    "hasNew": true,
    "items": {
      "furniture": {
        "hasNew": true,
        "items": { "furniture_id": { "hasNew": true } }
      }
    }
  }
}
```

4) Рендер на UI

- Картки обгортаються у `NewNotificationWrap`:
```jsx
<NewNotificationWrap id={entity.id}
  className={'narrow-wrapper'}
  isNew={newUnlocks?.[scope]?.items?.[category]?.items?.[entity.id]?.hasNew}
>
  <Card ... />
</NewNotificationWrap>
```
- Компонент сам позначає елемент як “переглянутий” при ховері: надсилає `set-new-notification-viewed-by-id` з `id`.

5) Приклад для Social Events

- Реєстрація в `social-events.module.js` (у `initialize()`):
```javascript
const eventEntities = gameEntity.listEntitiesByTags(['event-hall']);
eventEntities.forEach(evt => {
  if (evt.attributes?.isEvent) {
    gameCore.getModule('unlock-notifications').registerNewNotification(
      'social', 'events', 'all', evt.id, evt.isUnlocked && !evt.isCapped
    );
  }
});
```
- UI у `components/social/event-hall.jsx`:
  - Разом з `query-social-events` викликає `query-new-unlocks-notifications` з `{ suffix: 'social', scope: 'social' }`.
  - Обгортає кожну картку `EventCard` у `NewNotificationWrap` з `isNew={newUnlocks?.events?.items?.[event.id]?.hasNew}`.

## ⚙️ Автоматизації: типи, налаштування правил, зберігання

Автоматизації відкриваються предметами магазину:
- `shop_item_planner` — глобальні автомати (Action Lists, Inventory automations, Map/Crafting/Alchemy lists, Spells)
- `shop_item_automated_mechanisms` — автопокупка для Property (майно, машини тощо)

### Типи автоматизацій (UI у `components/settings/automation-settings.jsx`)

- Action Lists (дії, карта, крафтинг, алхімія): `scope = autotrigger`
  - збереження: `save-action-list`, `save-map-tile-list`, `save-crafting-list`
  - поля: `isEnabled`, `priority` (int), `pattern` (строка), `rules` (масив правил)
- Inventory automations:
  - `autopurchase`: покупка ресурсів/предметів — `save-shop-resource-settings`
  - `autosell`: автопродаж — `save-inventory-settings`
  - `autoconsume`: автоспоживання — `save-inventory-settings`
  - поля: `isEnabled`, `pattern?`, `rules?`
- Spell automations: `autocast` — `save-spell-settings` (isEnabled, pattern?, rules?)
- Property quick-toggle: `set-furniture-autopurchase` (перемикач на картках меблів/структур/артефактів/машин)

### Модель правила (RulesList)

Компонент `RulesList` редагує масив правил однієї автоматизації. Типова структура одного правила:
```json
{
  "resource_id": "coins",            // ресурс або ефект для порівняння
  "condition": "less_or_eq",        // one of: less, less_or_eq, greater, greater_or_eq, equal, not_equal
  "value_type": "percentage",       // percentage | absolute
  "value": 50                        // значення (у відсотках або абсолютне)
}
```

Параметр `pattern` (опційний) дозволяє встановити схему поведінки/розподілу зусиль (конкретний сенс задає модуль: action lists, crafting, etc.).

### Як гравець налаштовує автомати

1. Відкрити Settings → Automations
2. Для потрібного блоку натиснути Edit
3. Увімкнути/вимкнути (toggle)
4. Додати правила (Add Rule) та відредагувати: ресурс, операцію, тип значення, величину
5. (Для списків) задати `priority` і `pattern`
6. Зберегти (Save) — відправляється відповідний `save-*` і застосовується на воркері

### Приклади API з UI

- Actions (autotrigger):
```js
sendData('save-action-list', {
  id,
  autotrigger: { isEnabled, priority, pattern, rules }
});
```
- Autopurchase:
```js
sendData('save-shop-resource-settings', {
  id,
  autopurchase: { isEnabled, pattern, rules }
});
```
- Autosell / Autoconsume:
```js
sendData('save-inventory-settings', {
  id,
  autosell: { isEnabled, rules }
  // або
  autoconsume: { isEnabled, pattern, rules }
});
```
- Spells autocast:
```js
sendData('save-spell-settings', {
  id,
  autocast: { isEnabled, pattern, rules }
});
```

### Де працює логіка

- Візуальні редактори: `components/settings/automation-settings.jsx` (секції: Actions, Purchase, Sell, Consume, Map, Crafting, Alchemy, Spells)
- Контекст з даними: модулі воркера повертають списки з полями автоматизацій (див. onMessage хендлери в цьому ж файлі)
- Property автопокупка: тумблер `AutomationIcon` на картках (відправляє `set-furniture-autopurchase`)

### Рекомендації для розробки

- Додавати нові типи автоматизацій, наслідуючи шаблон `AutomatedItem` + власний `save-*` handler у відповідному модулі воркера
- Консистентно підтримувати поле `isEnabled` та масив `rules`
- Складніші політики краще інкапсулювати у `pattern`

### 🔭 Advanced: ідеї для розширення правил та нових автоматизацій

Цей розділ — дорожня карта для гнучкіших автоматизацій. Нічого з цього не обов’язково реалізовано прямо зараз, але сумісно з поточною архітектурою.

#### Розширення RulesList (оператори/умови)
- Композитні умови AND/OR/NOT між правилами (простий DSL: `1 AND (2 OR NOT 3)`)
- Вікна часу/таймслоти: only `HH:MM–HH:MM`, only offline, only weekend
- Хістерезис/анти-фліп: `enter <= 40%`, `exit >= 55%` (запобігає частому перемиканню)
- Тренди: `rate_of_change(resource_id) > X` за N сек (прискорюється/падає)
- Ковзні середні: `moving_avg(resource_id, N) < X` (стабільний дефіцит/надлишок)
- Бюджети/ліміти: глобальний `coins_budget` на автопокупки; max quantity per minute; daily caps
- Вартість/бенефіт: `price_per_unit(resource) <= threshold` або `benefit/price >= R` (евристика окупності)
- Пріоритет джерел: whitelist/blacklist тегів (`tags includes 'alchemy'`), або мін/макс для підкатегорій
- Подієві тригери: on unlock, on notification, on cap overflow/underflow, on missing-resource для machinery/recipes

Приклад DSL-композиції (для автопокупки):
```
(1 AND 2) OR (3 AND NOT 4)
1: coins >= 10% cap
2: wood <= 25% cap
3: price_per_unit(wood) <= 2k coins
4: daily_spent_autopurchase >= 1B coins
```

#### Нові/покращені автомати (ідеї)
- Social: авто-розклад Event Hall
  - Правила: бюджет на події, мінімальна пауза; приоритизація івентів тегом (`socio_campaign`), автозаміна коли з’явився кращий ROI
- Machinery: авто-навантаження
  - Регулювання `manualLoad` за `bottleNeck`/efficiency: піднімати/знижувати до таргету ефективності або до бюджету coal/wood
- Actions scheduler: ротація списків за пріоритетами + правила “зупини коли X досягнуто”
- Inventory crafting chain: авто-конвертації базових ресурсів у проміжні (коли нижній рівень переповнює склад або є дефіцит вище)
- Map exploration: авто-перемикання між списками тайлів за tag/бонусом/ефективністю
- Spells: умови на autocast — `mana >= X%`, `cooldown <= Y`, `boss_active == true` (у майбутніх системах бою)
- Property: автоперемикання видимості/пінінг у власних фільтрах; глобальний бюджет Living Space з пріоритетами по категоріях

#### UX/стабільність
- Пер-правило cooldown (не частіше ніж раз на N сек)
- Dry-run/симуляція: показувати, що автоматика зробить, перед активацією
- Логи автоматизацій (останні N застосувань + причина спрацювання)
- Експорти/імпорти профілів автоматизацій


### Реєстрація апгрейдів магазину:
```javascript
gameEntity.registerGameEntity('shop_item_magical_compass', {
    tags: ["shop", "upgrade", "purchaseable"],
    name: 'Magical Compass',
    description: 'Increases expedition resource finds by 25%',
    level: 0,
    maxLevel: 1,
    unlockCondition: () => {
        return gameEntity.getLevel('shop_item_magic_accessories_access') > 0 && 
               gameEntity.getLevel('action_expedition') > 0
    },
    resourceModifier: {
        multiplier: {
            effects: {
                'expedition_resource_amount': { A: 0.25, B: 1, type: 0 }
            }
        }
    }
})
```

## 🎨 UI ПАТТЕРНИ ТА КОМПОНЕНТИ

### Структура карточки (Card):
```jsx
<div className="item-card card">
    {/* 1. HEAD секція - заголовок та основна інформація */}
    <div className="head">
        <p className="title">{item.name}</p>
        <span className="level">{item.level}</span>
        {/* НЕ додавати кнопки сюди! */}
    </div>
    
    {/* 2. CONTENT секція - опис, прогрес, статистика */}
    <div className="content">
        {/* Опис, прогрес-бари, ресурси */}
    </div>
    
    {/* 3. ITEM-ACTIONS секція - ВСІ кнопки та елементи керування */}
    <div className="item-actions padded-left buttons">
        {/* Кнопка запуску/зупинки */}
        <CustomButton onClick={handleAction}>
            {isActive ? 'Stop' : 'Start'}
        </CustomButton>
        
        {/* Checkbox для автоматизації */}
        <label className="automate-checkbox">
            <input type="checkbox" checked={isAuto} onChange={handleAuto} />
            <span>Automate</span>
        </label>
        
        {/* Кнопка favorite - ЗАВЖДИ тут! */}
        <FavoriteButton 
            type="socialEvents" 
            id={item.id} 
            isFavorite={item.isFavorite} 
            className="event-favorite-btn icon-content interface-icon small clickable-icon" 
        />
    </div>
</div>
```

### ⚠️ ВАЖЛИВО: Зона для кнопок
**ВСІ інтерактивні елементи (кнопки, чекбокси, favorite) повинні бути в `item-actions` секції:**

- ✅ **ПРАВИЛЬНО:** `FavoriteButton` в `item-actions` поруч з кнопкою запуску
- ❌ **НЕПРАВИЛЬНО:** `FavoriteButton` в `head` секції або окремо

**Приклади правильного розташування:**
- `actions.jsx` - favorite кнопка в `action-actions`
- `shop.jsx` - favorite кнопка в `course-actions`  
- `event-hall.jsx` - favorite кнопка в `item-actions`
- `guilds.jsx` - favorite кнопка в `guild-card-inner`

**CSS класи для зони кнопок:**
```css
.item-actions {
    /* Всі кнопки та елементи керування */
}

.buttons {
    /* Додатковий клас для стилізації */
}

.flex-container {
    /* Для flexbox розташування кнопок */
}
```

### 🧹 Tippy Tooltip Cleanup (ВИПРАВЛЕНО)
**Проблема:** Накопичення `tippy-portal-container` елементів в DOM, що призводить до memory leak.

**Рішення:**
1. **Глобальний контейнер:** Використовується один `tippy-portal-container` замість створення нового для кожного tooltip'а
2. **Автоматичне очищення:** Tooltip'и очищаються при зміні вкладки та закритті додатку
3. **Функції cleanup:** `clearAllTooltips()` та `cleanupAllTippyContainers()`

**Використання:**
```javascript
import { clearAllTooltips, cleanupAllTippyContainers } from "../shared/tippy-wrapper.jsx";

// Очищення при зміні вкладки
useEffect(() => {
    clearAllTooltips();
    cleanupAllTippyContainers();
}, [openedTab]);

// Очищення при закритті
useEffect(() => {
    return () => {
        clearAllTooltips();
        cleanupAllTippyContainers();
    };
}, []);
```

**Результат:** DOM залишається чистим, немає накопичення tooltip контейнерів.

### 🎯 Tippy Tooltip Позиціонування (ВИПРАВЛЕНО)
**Проблема:** Tooltip'и іноді "стрибають" в лівий верхній кут екрану.

**Рішення:**
1. **Перевірка видимості:** Tooltip не показується якщо елемент-ціль має нульові розміри
2. **ResizeObserver:** Автоматичне оновлення позиції при зміні розміру вікна
3. **Валідація позиції:** Tooltip приховується якщо виходить за межі екрану
4. **Обмеження кількості:** Максимум 3 активних tooltip'и одночасно

**Технічні деталі:**
```javascript
// Перевірка видимості елемента
if (targetRect.width === 0 || targetRect.height === 0) {
    setVisible(false);
    return;
}

// ResizeObserver для автоматичного оновлення
resizeObserver = new ResizeObserver(() => {
    if (visible && popoverRef.current) {
        setTimeout(() => positionPopover(), 50);
    }
});

// Валідація позиції
if (top < 0 || top > viewportHeight || left < 0 || left > viewportWidth) {
    setVisible(false);
    return;
}
```

**Результат:** Tooltip'и завжди показуються в правильній позиції, немає "стрибання" в кут екрану.

### 🔓 ПРАВИЛЬНЕ ВИКОРИСТАННЯ ФУНКЦІЙ АНЛОКА (ВАЖЛИВО!)

**КРИТИЧНО ВАЖЛИВО:** Використовувати правильну функцію `isUnlocked` для кожного типу об'єкта!

```javascript
// ✅ ПРАВИЛЬНО - для ентіті (артефакти, дії, структури)
if (!gameEntity.isEntityUnlocked(entityId)) continue;

// ✅ ПРАВИЛЬНО - для ресурсів (матеріали, валюта)
if (!gameResources.isResourceUnlocked(resourceId)) continue;

// ✅ ПРАВИЛЬНО - для ефектів
if (!gameEffects.isEffectUnlocked(effectId)) continue;
```

**НЕПРАВИЛЬНО:**
```javascript
// ❌ НЕПРАВИЛЬНО - використання gameEntity.isEntityUnlocked() для ресурсів
if (!gameEntity.isEntityUnlocked(resourceId)) continue;

// ❌ НЕПРАВИЛЬНО - використання gameResources.isResourceUnlocked() для ентіті
if (!gameResources.isResourceUnlocked(entityId)) continue;
```

### 📁 ІМПОРТИ ФАЙЛІВ (ВАЖЛИВО!)

**ОБОВ'ЯЗКОВО** вказувати розширення файлів в імпортах:

```javascript
// ✅ ПРАВИЛЬНО - з розширенням
import { Component } from './components/component.jsx';
import { Hook } from './hooks/hook.js';
import { Context } from './context/context.js';

// ❌ НЕПРАВИЛЬНО - без розширення
import { Component } from './components/component';
import { Hook } from './hooks/hook';
import { Context } from './context/context';
```

**Правила:**
- **`.jsx`** - для React компонентів та JSX файлів
- **`.js`** - для звичайних JavaScript файлів
- **`.worker.js`** - для Web Worker файлів
- **`.css`** - для стилів
- **`.png/.jpg/.svg`** - для зображень

**Приклади правильних імпортів:**
```javascript
import { AppProvider } from './context/ui-context.js';
import { SoundProvider } from './context/sounds/sound-context.jsx';
import { TippyProvider } from './context/tippy-context.jsx';
import { Main } from './components/main.jsx';
import { DndProvider } from './custom-libs/dnd/index.js';
```

## ⚠️ НАЙЧАСТІШІ ПОМИЛКИ AI

### ❌ НЕ РОБИТИ:
1. **НЕ додавати `effectDeps` до `get_cost`** - це тільки для `resourceModifier`!
2. **НЕ перезаписувати важливі файли** (README.md, AI_CONTEXT.md)
3. **НЕ створювати додаткові ефекти** для прямого впливу на ресурси
4. **НЕ використовувати Set/Map** для збережуваних даних - JSON.stringify ламає їх
5. **НЕ ставити onMessage поза useEffect** - створює витоки пам'яті

### ✅ ЗАВЖДИ РОБИТИ:
1. **Читати існуючий код** перед додаванням нового
2. **Використовувати прямі resource modifiers** замість ефектів
3. **Переносити onMessage в useEffect** з cleanup через removeMessage
4. **Перевіряти що ефект вже існує** перед створенням нового
5. **Додавати dependency lists** в useEffect: `[sendData]`, `[onMessage, removeMessage]`

## 🔄 REACT ОПТИМІЗАЦІЇ

### useWorkerClient Best Practices:

**⚠️ ПОТОЧНА АРХІТЕКТУРА (може змінитися в майбутньому):**
У поточному фреймворку всі функції з `useWorkerClient` є **стабільними**:
- `sendData` - ніколи не змінюється, worker не переініціалізується
- `onMessage` - стабільний колбек
- `removeMessage` - стабільний колбек  
- Вся поведінка контролюється через **payload**, не через референси функцій

**Це означає що можна використовувати `[]` dependencies:**

```javascript
const { onMessage, sendData, removeMessage } = useWorkerClient(worker);

// ✅ ПОТОЧНИЙ ПІДХІД - все в одному useEffect
useEffect(() => {
    // Початковий запит та інтервал
    sendData('query-data', { filters: 'example' });
    const interval = setInterval(() => {
        sendData('query-data', { filters: 'example' });
    }, 1000);

    // Listener
    onMessage('data-response', (data) => {
        setComponentData(data);
    });

    return () => {
        removeMessage('data-response');
        clearInterval(interval);
    };
}, []); // ✅ Порожні dependencies - все стабільно

// 🤔 АЛЬТЕРНАТИВНИЙ ПІДХІД (більш React-idiomatic, але зайвий для нашої архітектури)
useEffect(() => {
    const handleData = (data) => setComponentData(data);
    onMessage('data-response', handleData);
    return () => removeMessage('data-response');
}, [onMessage, removeMessage]); // Зайве, бо функції ніколи не змінюються

**🔮 МОЖЛИВА ЗМІНА В МАЙБУТНЬОМУ:**
Якщо архітектура зміниться (наприклад, worker стане переініціалізуватися або функції стануть нестабільними), тоді потрібно буде:
1. Додати відповідні dependencies: `[sendData]`, `[onMessage, removeMessage]`
2. Можливо розділити на окремі useEffect для різних типів логіки

## 🖼️ ІКОНКИ АКТИВНИХ ЕФЕКТІВ

### Логіка відображення іконок:
```javascript
// У компоненті ActiveEffectItem:
<img src={`icons/${scope}/${customIcon ?? originalId}.png`} />
```

### Структура папок з іконками:
```
public/icons/
├── events/          - тимчасові ефекти та соціальні ивенти
├── spells/          - активні заклинання  
├── resources/       - споживані предмети
└── expeditions/     - активні експедиції
```

### Назви файлів іконок:
- **Експедиції:** `expedition_ancient_ruins.png`, `expedition_ancient_cemetery.png`
- **Заклинання:** `{spell_id}.png`
- **Предмети:** `{item_id}.png`
- **Ивенти:** `{customIcon ?? event_id}.png`

### ⚠️ ВІДОМИЙ БАГ:
У `mage.module.js:921` закоментований рядок:
```javascript
// customIcon: gameEntity.getAttribute(item.id, 'customIcon'),
```
Через це соціальні ивенти не використовують кастомні іконки!

### Вимоги до іконок:
- Розмір: 64x64 або 128x128 пікселів
- Формат: PNG з прозорістю
- Назва: точно як `originalId` сутності
- Стиль: відповідає загальному дизайну гри

## 🐛 ВІДОМІ БАГИ UI

### 1. Кнопка "Start Expedition" при активній експедиції
**Проблема:** UI показує кнопку "Start Expedition" навіть коли експедиція вже запущена.

**Симптоми:**
- Експедиція має статус "Running" 
- Показує progression bar з XP
- Але кнопка все одно "Start Expedition" замість "Stop Expedition"

**Можливі причини:**
1. **Race condition:** Швидкий інтервал оновлення (100ms) створює конфлікт станів
2. **Stale data:** UI отримує старі дані через кешування
3. **Sync problem:** `expedition.isRunning` не синхронізований між worker та UI
4. **Multiple instances:** Можливо одночасно запущено кілька експедицій

**Код проблеми:**
```javascript
// expeditions.jsx:278-305 та 408-415
{expedition.isRunning ? (
    <CustomButton>Stop Expedition</CustomButton>
) : (
    <CustomButton>Start Expedition</CustomButton> // ← Показується некоректно
)}
```

**Де шукати вирішення:**
- `expeditions.module.js:298` - встановлення `isRunning = true`
- `expeditions.module.js:326` - встановлення `isRunning = false`  
- `expeditions.jsx:42` - інтервал 100ms може бути занадто швидким
- Перевірити чи правильно передається `expedition.isRunning` з worker

## 🎮 ГЕЙМПЛЕЙ КОНТЕКСТ

### Експедиції:
- Гравці відправляються в expedition_ancient_ruins, expedition_ancient_cemetery
- Знаходять ресурси базуючись на ймовірності та кількості
- `expedition_efficiency` впливає на ефективність
- `expedition_resource_amount` впливає на кількість знайдених ресурсів

### Магазин:
- Розділений на секції: базові речі, магічні аксесуари
- `shop_item_magic_accessories_access` відкриває магічні предмети
- Ціни мають знижку від харизми через `charismaMod()`

### Ефекти та модифікатори:
- Усі ефекти мають `defaultValue: 1` для множників, `0` для адитивних
- `minValue: 1` для множників щоб уникнути негативних значень
- Використовуються в формулах через `gameEffects.getEffectValue(id)`

## 🤝 ВЗАЄМОДІЯ З КОРИСТУВАЧЕМ

Користувач воліє:
- Логічні зв'язки між системами
- Прямі впливи на ресурси (resource modifiers)
- Чіткі описи функцій ("increases expedition resource finds by 25%")
- Збалансовані ціни відносно існуючих предметів

### Мовні вимоги (ВАЖЛИВО)
- Гра — англомовна. Всі назви, описи, тексти для ентіті (артефакти, дії, апгрейди, спели, структури, інвентар) повинні бути англійською, навіть якщо вихідний запит користувача був іншою мовою.
- Якщо користувач надає назву/опис українською — перекладати на англійську під час імплементації.

## 📋 WORKFLOW ДЛЯ AI

1. **ЧИТАТИ** AI_CONTEXT.md перед будь-якими змінами
2. **АНАЛІЗУВАТИ** що хоче користувач
3. **ДОСЛІДЖУВАТИ** існуючий код для розуміння патернів
4. **ПЛАНУВАТИ** які файли треба змінити
5. **РЕАЛІЗОВУВАТИ** по частинах з поясненнями
6. **ПЕРЕВІРЯТИ** чи все працює логічно

---

**Версія документу:** 1.0  
**Остання оновка:** Додано інформацію про React оптимізації, expedition_resource_amount ефект та Custom Amplifier API (getCustomAmplifier)  
**Додаткові пам'ятки:** [[memory:4014626]] про resource modifiers vs ефекти 

#### 3.5. Приклади компонентів з правильною оптимізацією

- `src/components/property/artifacts.jsx` - Артефакти з періодичним оновленням (використовує поточний підхід з `[]` dependencies)
- `src/components/shared/active-actions.jsx` - Активні дії з швидким оновленням (200ms)
- `src/components/main.jsx` - Головний компонент з одноразовими listeners

**Приклад поточного підходу (artifacts.jsx):**
```javascript
useEffect(() => {
    sendData('query-furnitures-data', { filterId: 'artifact' });
    const interval = setInterval(() => {
        sendData('query-furnitures-data', { filterId: 'artifact' });
    }, 1000);

    onMessage('furnitures-data', (data) => {
        setItemsData(data);
    });

    return () => {
        removeMessage('furnitures-data');
        clearInterval(interval);
    };
}, []); // Стабільна архітектура дозволяє порожні dependencies
``` 