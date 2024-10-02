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
5. [V] Inventory with setting to consume/sell objects
6. [V] Autoconsume options (with conditions over available resources/attributes)
7. [V] Gather berries action
8. [V] Filtering actions by tags
9. [V] Section to purchase consumable items in shop
10. [V]New shop upgrades to boost energy gain
11. [V] Make strength useful - increasing "Push-Up" to decent level (need to point it out) should unlock new action - "Train Regeneration" (increase HP regen)
12. Equipment
13. [V] Property with limited space for furniture and furniture choices
14. [V] New upgrade to invent new resource and attribute - intellect and knowledge.
15. [V] Knowledge should be used to invent new professions

0.0.1c
1. [V] Autosell
2. [V] Show active effects
3. [V] UI refinement to items requiring attention
4. Settings (import/export)