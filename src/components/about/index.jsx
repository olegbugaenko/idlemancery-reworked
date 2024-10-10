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
    </div>)
}