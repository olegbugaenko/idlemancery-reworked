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

## 📋 WORKFLOW ДЛЯ AI

1. **ЧИТАТИ** AI_CONTEXT.md перед будь-якими змінами
2. **АНАЛІЗУВАТИ** що хоче користувач
3. **ДОСЛІДЖУВАТИ** існуючий код для розуміння патернів
4. **ПЛАНУВАТИ** які файли треба змінити
5. **РЕАЛІЗОВУВАТИ** по частинах з поясненнями
6. **ПЕРЕВІРЯТИ** чи все працює логічно

---

**Версія документу:** 1.0  
**Остання оновка:** Додано інформацію про React оптимізації та expedition_resource_amount ефект  
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