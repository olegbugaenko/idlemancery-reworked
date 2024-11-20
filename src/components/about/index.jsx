import React from "react";
import PerfectScrollbar from "react-perfect-scrollbar";

export const About = () => {

    return (<div className={'ingame-box about-block'}>
        <PerfectScrollbar>
            <div>
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