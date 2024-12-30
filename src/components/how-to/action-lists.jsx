import React from "react";

export const HowActionListsWorking = () => {
    return (
        <div className="actions-lists-tutorial">
            <p>
                As you've noticed, some actions require additional resources. For example, "Begging" consumes energy.
                While you can manually switch between "Begging" and "Rest," it's not the most efficient experience, right?
            </p>
            <p>
                That's where lists come in! You can combine actions into lists, allowing them to run simultaneously.
            </p>
            <p>
                Lists work similarly to regular actions, but they combine the effects and upkeep of the actions added to them.
            </p>
            <div className="image-container">
                <img src="icons/how-to/lists/how_to_create_list.png" alt="How to create a list" />
            </div>
            <p>
                At the bottom of the Actions page, you'll find the area dedicated to lists. On the leftmost side of the panel,
                you can see the currently running list. Next to it, you'll find the "Create New" button to create a list or
                the "Pick" button to manage existing lists. To the right, there's the automation section, which will be covered
                in a separate tutorial.
            </p>
            <p>
                Click the "Create New" button (highlighted in the image above) to create a new list.
            </p>
            <p>
                Once you've clicked "Create New," the List Editor will appear on the right panel.
            </p>
            <div className="image-container">
                <img src="icons/how-to/lists/how_to_add_actions.png" alt="How to add actions" />
            </div>
            <p>
                Start by giving your list a name, then add some actions.
            </p>
            <p>
                You can add actions by dragging and dropping them from the left side of the page into the droppable area
                under the list name. Alternatively, you can click the actions directly.
            </p>
            <div className="image-container">
                <img src="icons/how-to/lists/how_to_ajust_efforts.png" alt="How to adjust efforts" />
            </div>
            <p>
                After adding actions to the list (as shown in section #2 of the image), you'll see "Average Resources per Second"
                and "Average Effects per Second." For example, the list might generate only half the coins compared to running
                just "Begging" alone. This happens because of the efforts distribution shown in section #1. Let's break it down:
                <br />
                - Walking: 1 effort <br />
                - Begging: 3 effort <br />
                - Resting: 2 effort <br />
            </p>
            <p>
                This means that if your character runs this list for 6 seconds, they would spend:
                <br />
                - 1 second walking<br />
                - 3 seconds begging<br />
                - 2 seconds resting<br />
                So, only half of the time is spent begging.
            </p>
            <p>
                If you increase "Begging" to 5 effort, the list would generate more coins but reduce energy income.
            </p>
            <p>
                Lists are a convenient way to combine actions that generate resources for other actions. However, it's generally
                more efficient to focus on specific goals rather than adding all available actions to a list.
            </p>
            <p>
                After clicking "Create," your new success plan will appear in the list.
            </p>
            <div className="image-container">
                <img src="icons/how-to/lists/how_to_pick_list.png" alt="How to pick a list" />
            </div>
            <p>
                When you click "Pick List," you'll see your newly created action list. You can choose to run or edit it as needed.
            </p>
        </div>
    );
};
