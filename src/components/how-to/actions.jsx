import React from "react";

export const HowActionsWorking = () => {

    return (<div className={'actions-tutorial'}>
        <p>Actions are tasks that your personage performs over time to receive resources or improve himself</p>
        <p>Almost every action has it's level, that will be increased automatically once you run action and received
        enough XP in it. Action bonuses are depending on its level.</p>
        <p>In general, actions can be divided onto 2 categories: Actions, giving you some resources while you working on them (like "Beggar" job),
        and actions providing passive bonuses per each level (like "Walking")</p>
        <div className={'image-container'}>
            <img src={'icons/how-to/actions-how-to.png'} />
        </div>
        <p>When you hover over action card, in right panel you can see details of your action.
           There is most of important information, such as action level (see #2 on the picture above) and effects/resources
        that this action can provide to you when running or on level up</p>
        <p>To run some action - just click "Start" button (#1 on the screen above). From this point action will run, and give you some resources or bonuses</p>
        <p>Some actions require resources to run. For example, "Begging" requires energy. If you dont have enough energy to sustain your begging - it will run
        at reduced efficiency. For example, if your action require 0.5 energy per second, but you produce only 0.2 - your total energy balance will be negative (-0.3).
        Once your energy hits 0 - your action will be able to consume only 0.2 energy per second that you produce, so it will run at 40% efficiency (0.2/0.5)</p>
        <p>For your information - game is working on background. So, you can select action and switch to different tab safely
            (while having game tab opened in background) - once you return you'll get your rewards for running the action.</p>
    </div> )

}