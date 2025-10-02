import React from 'react';
import {EffectsSection} from "../../shared/effects-section.jsx";
import {ResourceComparison} from "../../shared/resource-comparison.jsx";
import {secondsToString} from "../../../general/utils/strings";

export const PotionBonusesTooltip = ({ bonusesDetails }) => {
    if (!bonusesDetails) return null;

    return (
        <div className={'hint-popup wider intensive'}>
            {bonusesDetails.title ? (
                <div className={'block'}>
                    <h4>{bonusesDetails.title}</h4>
                </div>
            ) : null}
            
            {bonusesDetails.cooldown ? (
                <div className={'block'}>
                    <p>Consumption Cooldown: {secondsToString(bonusesDetails.cooldown)}</p>
                </div>
            ) : null}
            
            {bonusesDetails.effects?.length ? (
                <div className={'block'}>
                    <p>Effects on usage:</p>
                    <div className={'effects'}>
                        <EffectsSection effects={bonusesDetails.effects}/>
                    </div>
                </div>
            ) : null}
            
            {bonusesDetails.duration ? (
                <div className={'block'}>
                    <p>Effects lasting: {secondsToString(bonusesDetails.duration)}</p>
                    <div className={'effects'}>
                        <EffectsSection effects={bonusesDetails.potentialEffects} />
                    </div>
                </div>
            ) : null}
            
            {bonusesDetails.permanentEffects ? (
                <div className={'block'}>
                    <p>Permanent Effects:</p>
                    <div className={'effects'}>
                        <ResourceComparison effects1={bonusesDetails.permanentEffects} effects2={bonusesDetails.potentialPermanentEffects}/>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
