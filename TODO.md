1. [V] Create git repo
2. [V] Shop (unlocks after 100 gold collected)
3. [V] Actions lists
4. [V] Items upgrading learning speed

git remote add origin https://github.com/olegbugaenko/idlemancery-reworked.git
git branch -M main
git push -u origin main

0.0.1b

1. [V] Add action increasing gold caps further
2. [V] Show lists totals (resource balances and at least estimated attrinute growth)
3. [V] Upgrades, increasing learning speed of specific jobs (therefore, every action entity should have in getLearningSpeedBonus function its own "learningSpeedBoost" depending on effects)
4. [V] Add logic into lists to check if action is available and not capped, and loop over it if so to prevent freeze
5. Inventory with setting to consume/sell objects
6. Gather berries action
7. New upgrade to invent new resource and attribute - intellect and knowledge.
8. Knowledge should be used to invent new professions