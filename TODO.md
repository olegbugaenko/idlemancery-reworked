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
4. [V] Settings (import/export)

0.0.1d
1. Conjuration magic - selling raw materials for now
2. [V] Focus - new resource, improving efficiency over time when not changing activity
3. Auto-purchase options
4. [V] Add sell multiplier options
5. New furniture for improving physical exercises, reading books and other stuff
6. [V] Add validation on inputs
7. Fix bug - resource income breakdown doesn't take into account efficiency of action


List fixes:
[V] clicking "start" should set current action and stop list, maybe add "restart LISTNAME" button
[X] add buttons for few last lists, without need to press "change"
[V] add edit button for current list (without "select&edit")
[X] change action's button to "add to list" when editing action
[V] maybe add placeholder "drag actions here to add to list" and implement dragging
[V] add apply button to apply list changes and keep editor open
[X] created list shoud contain current action
[X] per second data at list may switch to per minute/per hour/per run on click
[V] Fix percentage display = 100% should be 100, and not 1.
[V] Make resources dropdowns allow search
[V] Add auto-trigger rules for list (with priority setup)
[V] Review component re-renders
[X] Add auto-purchase
[V] Create separate "Automations" tab under settings (Add spells and test)
[V] Make Popups closed by clicking outside
[V] Make lists doing all included actions simultaneously, while sharing focus
a) Deal with changes to efforts when something becomes unavailable while running
b) Deal with focuses
[V] Show ETA's on learning/resource availability
[V] Add possibility to hide actions

v0.3
[V] Implement "Materials" tab in inventory
[V] Add lumberjack job, gathering wood
[V] Implement module and page for materials crafting
[V] Implement module and page for making accessories
Add Conjuration magic and 2 resources: water and wood
Add shop items: book of herbalism and woodworking manual
[V] Implement alchemy
[V] Something to boost physical learning rates (action or whatever)
[V] Add new recipes for herbs (increasing health, increasing XP gain)
[V] Add stonecutting and refine stone into the rubies or sapfires. 
[V] Make actions lists list searchable and scrollable
[V] Add caps breakdowns
[V] Implement new accessories based on stone refining
[V] Add new job based on strength
[V] Add new options (actions) for boosting mana regen and caps (New actions)
[V] Add some new crafting materials that required for relics providing boost to Mental Training Rate
[V] Add shop upgrade, that would provide bonus to crafting slots
[V] Pushup 400 should unlock something to improve crafting output
[V] Add advanced illusion magic, improving crafting efficiency and social XP rate

---
Troubles: missing something providing energy very bad. It can be fixed with alchemy, however.
So, tomorrow:
1. Implement alchemy
2. Test it on save files of other players

Pre-release 0.0.3
1. Configurable consumption amounts
2. Offline progress
3. Statistics

----
v0.0.3a:
1. [V] Add Hard Reset
2. [V] Add search actions 
3. [V] Hide all maxed furniture
4. [V] Action trigger is not running
5. [V] Add flat bonus to spells per level (kinda 1 + 0.02*maxLevel)
6. [V] New unlocks indication
7. [V] Add upgrade for shop stock capacity
8. [V] Add new rare events effects
9. [V] Add workshop slots automation (Or think how to do it)
10. [V] Test knowledge related events
11. [V] Adopt chances and amounts to gathering efficiency
12. [V] Lists
13. [V] Implement gathering itself (with lists)
14. [V] UI fixes
15. [V] Double check rare herbs unlocks conditions
16. [V] Check running crafting lists
17. Add alchemy for instant XP effects and temporary XP boosts
18. [V] Add spell increasing loot
19. [V] Display shop trade stock
20. [V] Reduce urn space requirement + add "Armchair" and "Bathroom"
