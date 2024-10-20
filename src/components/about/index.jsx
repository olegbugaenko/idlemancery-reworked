import React from "react";

export const About = () => {

    return (<div className={'ingame-box about-block'}>
        <h3>Idle Awakening v0.0.1</h3>
        <div className={'features'}>
            <p>This is very first playable prototype</p>
        </div>
        <h3>Idle Awakening v0.0.1.a</h3>
        <div className={'features'}>
            <p>Urgent hotfix for console errors players got</p>
            <p>Fixed action effects lists calculations</p>
            <p>Upgraded UI for actions lists selection and editing</p>
            <p>Fixed some text descriptions</p>
            <p>Fixed bug when primary attrubute didn't affected learning rate</p>
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
    </div>)
}