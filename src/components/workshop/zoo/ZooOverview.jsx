import React from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import { formatValue } from "../../../general/utils/strings";
import { RawResource } from "../../shared/raw-resource.jsx";

export const ZooOverview = ({ space, limits, zooUnlocked, isMobile, onClose }) => (
    <PerfectScrollbar>
        <div className={'blade-inner zoo-details'}>
            <div className={'block'}>
                <h4>Magical Zoo</h4>
                <p className={'hint separated'}>
                    Assign percentage caps to each animal type to control how much of your total Magic Zoo Space they can occupy.
                    Set a limit to reserve habitat for other creatures or keep it unlimited to let the population grow freely.
                    Use the detail blade to fine-tune feeding levels, preview the required food, and only save the changes when
                    you are satisfied with the projected breeding rate.
                </p>
            </div>
            <div className={'block'}>
                <p>Space Summary</p>
                <div className={'flex-row flex-container zoo-capacity-line'}>
                    <RawResource id={'magic_zoo_space'} name={'Zoo Capacity'} />
                    <span className={'slots-amount'}>
                        {formatValue(space.used)}/{formatValue(space.total)}
                    </span>
                </div>
                <p className={'hint separated'}>
                    Reserved limits: <strong>{formatValue((limits.totalPercent ?? 0) * 100)}%</strong>
                </p>
            </div>
            <div className={'block'}>
                <p>Status</p>
                <p className={'hint'}>
                    {zooUnlocked ? 'Your Magical Zoo is active. Hover over a card to inspect an animal or adjust its limit below.' : 'Construct Enclosures or other buildings that provide Magic Zoo Space to start collecting mystical animals.'}
                </p>
            </div>
            {isMobile ? (
                <div className={'block buttons'}>
                    <button onClick={onClose}>Close</button>
                </div>
            ) : null}
        </div>
    </PerfectScrollbar>
);

