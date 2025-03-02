import React from "react";
import PerfectScrollbar from "react-perfect-scrollbar";

export const About = () => {

    return (<div className={'ingame-box about-block'}>
        <PerfectScrollbar>
            <div>
                <h3>Idle Awakening v0.1.1</h3>
                <div className={'features'}>
                    <p>Spells and potions having lasting effects now have no cooldown</p>
                    <p>Added new automation rules</p>
                    <p>Added possibility to pin resources from inventory to main panel</p>
                    <p>Added support for smaller screen sizes</p>
                    <p>Few UI improvements</p>
                    <p>Fixed some typos</p>
                </div>
                <h3>Idle Awakening v0.1.0a</h3>
                <div className={'features'}>
                    <p>Fixed potential crashes issue</p>
                    <p>Balance breakdown is now displayed at alchemy, crafting and plantations page when hover over balance</p>
                    <p>Added few more events</p>
                    <p>Fixed some typos</p>
                    <p>Minor internal optimizations</p>
                </div>
                <h3>Idle Awakening v0.1.0</h3>
                <div className={'features'}>
                    <p>A lot of changes to game balance and order of unlocks</p>
                    <p>Actions now have ranks, giving small but reasonable exponential boost</p>
                    <p>Map is significantly reworked. Changed probabilities and possible unlocks</p>
                    <p>Added more spells</p>
                    <p>Added more attribute milestones, unlocks and more content in general</p>
                    <p>Added beginners game tutorial</p>
                    <p>Added a lot of in-game explanations</p>
                </div>
                <h3>Idle Awakening v0.0.7d</h3>
                <div className={'features'}>
                    <p>Hotfix for crash when adding action to list</p>
                </div>
                <h3>Idle Awakening v0.0.7c</h3>
                <div className={'features'}>
                    <p>Hotfix for crash issues</p>
                </div>
                <h3>Idle Awakening v0.0.7b</h3>
                <div className={'features'}>
                    <p>Furniture purchase can now also be automated</p>
                    <p>Specific items automations can be disabled</p>
                    <p>Improved UI and fixed bugs in a lot of places</p>
                </div>
                <h3>Idle Awakening v0.0.7a</h3>
                <div className={'features'}>
                    <p>Added 2 more later game actions</p>
                    <p>Refined UI representation of crafting/alchemy</p>
                    <p>Fixed bug when slots where highlighted green, even when 100% used</p>
                    <p>Map tile coordinates now are shown on hover and in details sidebar</p>
                </div>
                <h3>Idle Awakening v0.0.7</h3>
                <div className={'features'}>
                    <p>Significantly increased sell prices</p>
                    <p>Hovering over resources and attributes on left panel now highlights actions using/producing them</p>
                    <p>Automation rules now highlighted green/yellow hen they complete or not in runtime, to make automations debugging easier</p>
                    <p>Actions can be searched by resources and effects</p>
                    <p>Action lists now can be sorted</p>
                    <p>When editing list hover over tile will show hint with map drops</p>
                    <p>Crafting/Plantation and other slots are now highlighted green/orange when available/unavailable to reduce confusion</p>
                    <p>Fixed bug when hiding actions didn't saved</p>
                    <p>Fixed UI bug with right sidebar overlapping on map</p>
                </div>
                <h3>Idle Awakening v0.0.6a</h3>
                <div className={'features'}>
                    <p>Hotfix freeze issue when some events are triggered</p>
                    <p>Minor technical & performance-related changes</p>
                </div>
                <h3>Idle Awakening v0.0.6</h3>
                <div className={'features'}>
                    <p>Added new spell, improving exploration</p>
                    <p>Added new crafting recipe</p>
                    <p>Added shop automation (available after upgrade)</p>
                    <p>Added new events. Existing are re-balanced.</p>
                    <p>Added new furniture, making rest making more sense. Urns now using less space</p>
                    <p>Shop page now shows additional useful stats, like price modifiers and sell limits</p>
                    <p>UI fixes</p>
                </div>
                <h3>Idle Awakening v0.0.5d</h3>
                <div className={'features'}>
                    <p>Fixed bug when actions autotrigger rules didnt saved</p>
                    <p>Fixed bug when some automation rules, relying to equality could work incorrectly</p>
                    <p>Fixed some events options costs</p>
                </div>
                <h3>Idle Awakening v0.0.5c</h3>
                <div className={'features'}>
                    <p>Fixed few more bugs and typos</p>
                    <p>Added short tutorials for automation and map</p>
                </div>
                <h3>Idle Awakening v0.0.5b</h3>
                <div className={'features'}>
                    <p>Fixed critical bug prevented actions from level up properly</p>
                    <p>Added some tutorials</p>
                </div>
                <h3>Idle Awakening v0.0.5a</h3>
                <div className={'features'}>
                    <p>Small bugfixes</p>
                    <p>Small re-balances</p>
                    <p>Added new action</p>
                </div>
                <h3>Idle Awakening v0.0.5</h3>
                <div className={'features'}>
                    <p>Completely changed gathering - now its happening on 2D maps</p>
                    <p>Herbs are now harder to get but more powerful in overall</p>
                    <p>Implemented workshop and alchemy automation</p>
                    <p>Details sidebars adjusted in sizes</p>
                    <p>Refined search UI</p>
                    <p>Added shortcuts for more convenient tabs switching</p>
                    <p>Fixed a lot of bugs</p>
                </div>
                <h3>Idle Awakening v0.0.4a</h3>
                <div className={'features'}>
                    <p>Fixed bugs and crushes when selecting specific events options</p>
                    <p>Added few more events</p>
                    <p>Events can be queued now (up to 5)</p>
                    <p>Potential effects are now shown once player revealed them before</p>
                </div>
                <h3>Idle Awakening v0.0.4</h3>
                <div className={'features'}>
                    <p>Added random events, providing various options and possible bonuses</p>
                    <p>Added new unlocks notifications</p>
                    <p>Maximum spell level now affects spell cost</p>
                    <p>Added some new plants</p>
                    <p>Added Hard Reset</p>
                    <p>Added search to furniture and actions</p>
                    <p>Fixed bugs in some actions effects</p>
                    <p>Fixed bug when "Running Action" rule didn't triggered</p>
                    <p>Fixed some typos</p>
                </div>
                <h3>Idle Awakening v0.0.3b</h3>
                <div className={'features'}>
                    <p>Grammar fixes</p>
                </div>
                <h3>Idle Awakening v0.0.3a</h3>
                <div className={'features'}>
                    <p>Added new crafting resource</p>
                    <p>Some balance fixes</p>
                </div>
                <h3>Idle Awakening v0.0.3</h3>
                <div className={'features'}>
                    <p>Added new actions</p>
                    <p>Added new mechanics (Crafting, Alchemy, Plantations and Guilds)</p>
                    <p>Added rare plants</p>
                    <p>Added detailed XP breakdowns on hovering action's XP/second</p>
                    <p>Action details now show future level-ups ETAs</p>
                    <p>Added statistics page</p>
                    <p>Added offline time bonus</p>
                    <p>Fixed bug when trying to consume non-consumable item crashed the game</p>
                    <p>Fixed issues with spells cooldowns calculations</p>
                    <p>Plenty re-balances to early game actions</p>
                </div>
                <h3>Idle Awakening v0.0.2d</h3>
                <div className={'features'}>
                    <p>Fixed bug when filter by level value input had unnecessary restrictions</p>
                    <p>Fixed bug some UI elements where hidden by scroll-bar</p>
                </div>
                <h3>Idle Awakening v0.0.2c</h3>
                <div className={'features'}>
                    <p>Fixed bug when some actions consumptions, like Home Errands didn't taken into account primary attribute</p>
                    <p>Fixed bug action list details could overflow page</p>
                    <p>Fixed bug when inventory page crashed sometimes</p>
                    <p>Fixed bug when settings page crashed when trying to edit autosell rules</p>
                    <p>Fixed bug when meditation action effect was not displaying</p>
                    <p>Added rule conditions field to put more complex logic</p>
                    <p>Added action level rule conditions</p>
                </div>
                <h3>Idle Awakening v0.0.2b</h3>
                <div className={'features'}>
                    <p>Fixed bug when spells effects where not displayed sometimes</p>
                    <p>Fixed bug when focus was not saving when refreshing page</p>
                    <p>Focus bonus cap now is now reduced when running multi-actions lists at reduced rate</p>
                    <p>Added setting to configure lists auto-trigger interval</p>
                </div>

                <h3>Idle Awakening v0.0.2a</h3>
                <div className={'features'}>
                    <p>Fixed bug with training workbench effects</p>
                    <p>Fixed bug when newly added spells settings where not saving</p>
                </div>

                <h3>Idle Awakening v0.0.2</h3>
                <div className={'features'}>
                    <p>Added more options to automation rules setup</p>
                    <p>Action lists are now sharing action efforts and focus</p>
                    <p>Action lists now also have atomation rules</p>
                    <p>Added separate "Automations" tab under settings</p>
                    <p>Actions can be marked as hidden, so they won't display unless you select to show hidden items</p>
                    <p>Shop items and property items now showing time when they become available</p>
                    <p>Future unlocks requirements are now displayed directly</p>
                    <p>Re-balances: improved jobs coins income, added one more charisma job, nerfed some skills</p>
                    <p>Added 2 new spells</p>
                    <p>Spells can be leveled-up after purchasing corresponding shop upgrade</p>
                    <p>Performance fixes</p>
                </div>

                <h3>Idle Awakening v0.0.1.a</h3>
                <div className={'features'}>
                    <p>Urgent hotfix for console errors players got</p>
                    <p>Fixed action effects lists calculations</p>
                    <p>Upgraded UI for actions lists selection and editing</p>
                    <p>Fixed some text descriptions</p>
                    <p>Fixed bug when primary attrubute didn't affected learning rate</p>
                </div>
                <h3>Idle Awakening v0.0.1</h3>
                <div className={'features'}>
                    <p>This is very first playable prototype</p>
                </div>
            </div>
        </PerfectScrollbar>
    </div>)
}