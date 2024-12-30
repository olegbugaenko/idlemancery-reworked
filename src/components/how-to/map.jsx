import React from "react";

export const HowMapWorking = () => {
    return (
        <div className="map-tutorial">
            <p>
                Map exploration is a feature unlocked when you purchase the backpack upgrade, which allows you to hold, use, and trade items.
                It lets you spend time searching for various collectible items.
            </p>
            <div className="image-container">
                <img style={{ width: '300px' }} src="icons/how-to/map/how_to_gathering_action.png" alt="How to gather resources" />
            </div>
            <p>
                To start exploring the map, you need to run (or add to a list) an action that generates "Gathering Effort."
                Gathering Effort is the resource used to explore different tiles on the map.
            </p>
            <div className="image-container">
                <img src="icons/how-to/map/how_to_map_view.png" alt="Map view" />
            </div>
            <p>
                This is your map view. At the top of the page (#1 in the image), you can see your available/used Gathering Effort.
                If you don’t have enough, your exploration efficiency will decrease.
            </p>
            <p>
                Below your exploration stats is the map itself. The map is divided into 225 tiles (15x15). The central tile is your settlement,
                and it cannot be explored. You can click any other tile (#2) to view its details.
            </p>
            <div className="image-container">
                <img src="icons/how-to/map/how_to_tile_details.png" alt="Tile details" />
            </div>
            <p>
                The farther a tile is from the center, the higher its exploration cost. However, more loot can be found there, and with better probabilities.
            </p>
            <p>
                Specific items and herbs available on a tile are randomly generated and remain hidden until you discover the first item of that type.
                For example, you won’t know that berries exist in a forest until you find one.
            </p>
            <div className="image-container">
                <img src="icons/how-to/map/how_to_tile_revealed.png" alt="Revealed tile" />
            </div>
            <p>
                Another important factor to consider is efficiency.
            </p>
            <div className="image-container">
                <img src="icons/how-to/map/how_to_efficiency_dropped.png" alt="Efficiency dropped" />
            </div>
            <p>
                If you check the Efficiency stat, you’ll see how your loot probability and quantity are affected by a lack of Gathering Effort.
                However, as you continue exploring, your gathering action will level up, improving your efficiency over time.
            </p>
            <p>
                Like other areas of the game, map exploration can also be automated. Check out the "Lists" and "Automations" tutorials for more details,
                as the mechanics are similar here.
            </p>
            <p>Happy exploring!</p>
        </div>
    );
};
