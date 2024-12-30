import React from "react";

export const HowListsAutomationsWorking = () => {
    return (
        <div className="lists-automation-tutorial">
            <p>
                Sometimes, when you want to step away from the game for a while, you’ll want to ensure that it continues to run efficiently.
            </p>
            <p>
                This is where list automation becomes useful. In fact, almost everything in the game can be automated! More features will be unlocked in the future that can also be automated. Since automation works similarly across the game, let’s focus on automating action lists as an example.
            </p>
            <p>
                Automation functions through a set of conditions that must be met for a list to run automatically.
            </p>
            <div className="image-container">
                <img src="icons/how-to/automations/how_to_add_rule.png" alt="How to add automation rules" />
            </div>
            <p>
                To set up autotrigger conditions, you’ll need to add a "rule." A list must have at least one rule to enable automation. Click "Add Rule" to get started.
            </p>
            <div className="image-container">
                <img src="icons/how-to/automations/how_to_select_rule_conditions.png" alt="How to set up a rule" />
            </div>
            <p>
                After adding a rule, you can choose from available rule types (e.g., resource amount, resource rate, currently running action, etc.) and define the condition under which the rule will be considered TRUE.
            </p>
            <div className="image-container">
                <img src="icons/how-to/automations/how_to_select_trigger_conditions.png" alt="How to set up trigger conditions" />
            </div>
            <p>
                Above the rules list (#1 in the image), you can also set a priority. If multiple automated lists meet their autotrigger conditions, the game will select the one with the highest priority (priority = 1 is the highest, 2 is lower, and so on).
                <br />
                By default, if you add several rules, they are matched using AND logic. This can be changed in the rules condition field (#2 in the image).
            </p>
            <p>
                Once you’ve set up automation settings for your lists, ensure that automation is turned on.
            </p>
            <div className="image-container">
                <img src="icons/how-to/automations/how_to_automation_settings.png" alt="Automation settings" />
            </div>
            <p>
                #1 Checkbox: Enables or disables automation for lists.
            </p>
            <p>
                #2 Dropdown: Sets the autotrigger interval (how frequently the game checks if a list should be changed).
            </p>
            <p>
                For example, suppose you want to "Beg" only when your coins aren’t capped and switch to "Walking" otherwise. You can create two lists:
            </p>
            <ul>
                <li>
                    <p><strong>Begging</strong></p>
                    <p>
                        Create a list, add "Begging" to it, and set one rule:
                        <br />
                        <code>Resource Amount -- Coins -- Less Than -- 100 -- Percentage</code>
                    </p>
                    <p>Set priority to 1.</p>
                </li>
                <li>
                    <p><strong>Walking</strong></p>
                    <p>
                        Create a list, add "Walking" to it, and set one rule:
                        <br />
                        <code>Resource Amount -- Coins -- Greater Than -- 90 -- Percentage</code>
                    </p>
                    <p>Set priority to 2.</p>
                </li>
            </ul>
            <p>
                By assigning higher priority (lower number) to actions with more specific conditions, the system will try to run those actions first as soon as their conditions are met.
            </p>
        </div>
    );
};
