# Nature Magic Testing

## Нова школа магії: Nature Magic

## Нові історії: Deep Focus

### Deep Focus 250
**Achievement ID:** `action_deep_focus_1`
**Title:** The Interrupted Meditation
**Умова розблокування:** 250 рівень Deep Focus (`action_deep_focus` >= 250)

**Історія (англійською):**
- Yesterday you decided to try deep focus practices on inner strength and spirit. So you sat on your mat and immersed yourself in a session...
- Your session was interrupted by musicians playing the trumpet. You had already started mentally cursing them, but your love for music overcame your love for inner harmony. You went outside, but saw no one.
- And then, suddenly, a new sound. And you realized it was the rumbling of your stomach. Seems like it's time to look for practices to calm the stomach without using sausages.

### Deep Focus 500
**Achievement ID:** `action_deep_focus_2`
**Title:** The Sleep Therapy Discovery
**Умова розблокування:** 500 рівень Deep Focus (`action_deep_focus` >= 500)

**Історія (англійською):**
- You agreed with a friend who also studies alchemy to go to a neighboring settlement for Evergreen Fern flowers, which were supposed to enhance the effect of potions. However, you were skeptical about this idea from the very beginning, as you had never seen such a plant in any of the pictures you had looked at in books.
- Nevertheless, for the sake of friendship, you agreed to go. The road was long. Accustomed to not wasting time, you engaged in meditation practices and deep focusing along the way. Sitting more comfortably on the hay that was laid under the cart, you immersed yourself in inner harmony.
- You woke up from a strong impact. You saw a river in front of you, a broken cart, and your friend snoring next to you with a broken knee and forehead. You tried to wake him up, but to no avail.
- You had to carry him back to the settlement in your arms.
- After bringing him home, you put him on the bed and were about to go for a doctor when that fool woke up.
- As it turned out, he had serious sleep problems that he wanted to solve with the help of potions.
- He confessed that your practices had rocked him into such a deep sleep that he hadn't had in 10 years.
- With mixed feelings of anger and pride, you went home. However, long before you crossed the threshold of your possessions, you were seized by the idea of making money on practices to combat insomnia.

### Yoga Practice 2000
**Achievement ID:** `action_yoga_practices_1`
**Title:** The Osteopath Exchange
**Умова розблокування:** 2000 рівень Yoga Practice (`action_yoga_practices` >= 2000)

**Історія (англійською):**
- Your sleep was interrupted by a knock at the door.
- You opened it and were met by a man. He had no face, was all pale, with bruises under his eyes, and in a trembling voice said: 'Maybe that's enough?'
- You, not understanding what he was talking about, invited him for tea.
- Somewhat relaxed, the man started talking. As it turned out, this was a new doctor - an osteopath. He complained that he couldn't cope with the influx of patients who had watched your yoga classes through the fence and were trying to repeat them at home, injuring themselves.
- Finally, after drinking a bit more calming tea with fly agarics, you found a compromise. You went out the next day to replace the osteopath and dealt with the queue before lunch. In return, when you came home, you were greeted by trimmed grass and a satisfied, rosy-cheeked osteopath who was swinging on a self-made hammock.
- + Hammock, + Good doctor friend, + Satisfied patients. And all thanks to yoga!

### Meditation 2000
**Achievement ID:** `action_meditate_7`
**Title:** The Regional Meditation Champion
**Умова розблокування:** 2000 рівень Meditation (`action_meditate` >= 2000)

**Історія (англійською):**
- Your ability to immerse yourself and find inner balance has reached a regional level.
- You were invited to a monastery 400 miles from your home for a meditation competition. After several hours of travel under the scorching sun, the horses couldn't withstand the heat. So you had to stop. You stopped by the river, drank some water, and decided to practice meditation.
- You woke up already in the monastery. The first thing you saw was the face of a monk who was sprinkling you with holy water. You asked him when and where the competition would take place, and to your surprise, you learned that you had already won in the 'deepest meditation' category.
- Unfortunately, they didn't give you medals, so you asked the monk for a certificate in the 'Soundest Sleep' category. Nevertheless, you felt sleep-deprived, so you slept through most of the journey back.

### Pushup 2000
**Achievement ID:** `action_pushup_7`
**Title:** The Magic Mirror Incident
**Умова розблокування:** 2000 рівень Pushup (`action_pushup` >= 2000)

**Історія (англійською):**
- You're not admiring your biceps in the mirror for the first time.
- The time has come - you decided, and went to participate in a regional push-up tournament.
- You easily reached the 1/8 finals, but here a seven-time competition participant came out against you. You, assessing the chances, decided to use cunning and magic. After doing 15 push-ups, you paused, muttering a spell that was supposed to create a multi-ton invisible load on your opponent's back.
- Suddenly, you heard a crunch and fainted.
- Coming to your senses a few days later, you learned that the competition hall was equipped with magic reflectors, so the load fell on you.
- Well, at least you reached the 1/8 finals, and understood on your own spine that your magic works.

### Закляття: Sacred Earth (Святі Землі)

**Умова розблокування:** 3000 Magic Ability (`attribute_magic_ability` >= 3000)

**Ефект:** 
- x1.5 до ефективності всіх плантацій
- Тривалість: 10 секунд
- Витрати: 3-5 мани (залежно від рівня)

**Теги:** `spell`, `magic`, `nature`, `nature_magic`

### Закляття: Nature's Strength (Сила Природи)

**Умова розблокування:** 4000 Magic Ability (`attribute_magic_ability` >= 4000)

**Ефект:** 
- x1.2 до ефективності ручного добування природних ресурсів (manual_labor_efficiency)
- Тривалість: 15 секунд
- Витрати: 4-6 мани (залежно від рівня)

**Теги:** `spell`, `magic`, `nature`, `nature_magic`

### Що було додано:

1. **Закляття `spell_sacred_earth`** в `src/worker/modules/magic/spells-db.js`
2. **Закляття `spell_natures_strength`** в `src/worker/modules/magic/spells-db.js`
3. **Ефект `nature_spells_efficiency`** в `src/worker/modules/resources/common-effects-db.js`
4. **Фурнітура `furniture_nature_magic_circle`** в `src/worker/modules/property/furniture-db.js`
5. **Іконки:** 
   - `spell_sacred_earth.png` (копія з `spell_conjure_earth.png`)
   - `spell_natures_strength.png` (копія з `spell_sacred_earth.png`)

### Тестування:

1. **Перевірити розблокування Sacred Earth:**
   - Досягти 3000 Magic Ability
   - Закляття повинно з'явитися в Spellbook

2. **Перевірити розблокування Nature's Strength:**
   - Досягти 4000 Magic Ability
   - Закляття повинно з'явитися в Spellbook

3. **Перевірити ефект Sacred Earth:**
   - Запустити закляття
   - Перевірити чи збільшилася ефективність плантацій
   - Перевірити тривалість (10 секунд)

4. **Перевірити ефект Nature's Strength:**
   - Запустити закляття
   - Перевірити чи збільшилася ефективність ручного добування (manual_labor_efficiency)
   - Перевірити тривалість (15 секунд)

5. **Перевірити Nature Magic Circle:**
   - Купити та покращити Nature Magic Circle
   - Перевірити чи збільшується `nature_spells_efficiency`
   - Перевірити чи збільшується ефект обох заклять

6. **Перевірити UI:**
   - Іконки відображаються правильно
   - Опис та назви коректні
   - Теги відображаються

### Примітки:

- Sacred Earth використовує існуючий ефект `plantations_efficiency`
- Nature's Strength використовує існуючий ефект `manual_labor_efficiency`
- Додано підтримку для Nature Magic ефективності
- Nature Magic Circle дає +0.25 до `nature_spells_efficiency` за рівень (макс 4 рівні)
- Обидва закляття залежать від `nature_spells_efficiency` для збільшення ефекту 