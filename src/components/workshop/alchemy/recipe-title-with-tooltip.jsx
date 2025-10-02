import React from 'react';
import {TippyWrapper} from "../../shared/tippy-wrapper.jsx";
import {PotionBonusesTooltip} from "./potion-bonuses-tooltip.jsx";

export const RecipeTitleWithTooltip = ({ bonusesDetails, children }) => {
    // Якщо немає бонусів - повертаємо просто children
    if (!bonusesDetails?.hasBonuses) {
        return children;
    }

    // Якщо є бонуси - обертаємо в TippyWrapper
    return (
        <TippyWrapper 
            lazy={true}
            placement={'left'}
            content={<PotionBonusesTooltip bonusesDetails={bonusesDetails} />}
        >
            {children}
        </TippyWrapper>
    );
};
