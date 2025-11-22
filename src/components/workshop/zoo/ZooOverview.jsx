import React from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import { formatValue } from "../../../general/utils/strings";
import { RawResource } from "../../shared/raw-resource.jsx";

export const ZooOverview = ({ space, zooUnlocked, isMobile, onClose }) => (
    <PerfectScrollbar>
        <div className={'blade-inner zoo-details'}>
            <div className={'block'}>
                <h4>Magical Zoo</h4>
                <p className={'hint separated'}>
                    Each animal species can grow all the way up to your full Magical Zoo Capacity without competing for space.
                    Focus on feeding choices to decide which animals thrive, and use the detail blade to preview food needs
                    before saving changes.
                </p>
            </div>
            <div className={'block'}>
                <p>Space Summary</p>
                <div className={'flex-row flex-container zoo-capacity-line'}>
                    <RawResource id={'magic_zoo_space'} name={'Zoo Capacity'} />
                    <span className={'slots-amount'}>
                        {formatValue(space.total)}
                    </span>
                </div>
            </div>
            <div className={'block'}>
                <p>Status</p>
                <p className={'hint'}>
                    {zooUnlocked ? 'Your Magical Zoo is active. Hover over a card to inspect an animal or adjust its feeding below.' : 'Construct Enclosures or other buildings that provide Magic Zoo Space to start collecting mystical animals.'}
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

