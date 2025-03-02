import React, {useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {useFlashOnLevelUp} from "../../general/hooks/flash";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {formatInt} from "../../general/utils/strings";
import {EffectsSection} from "../shared/effects-section.jsx";
import {ResourceCost} from "../shared/resource-cost.jsx";
import {FlashOverlay} from "../layout/flash-overlay.jsx";
import {ResourceComparison} from "../shared/resource-comparison.jsx";
import {useAppContext} from "../../context/ui-context";

export const Skills = () => {

    const worker = useContext(WorkerContext);

    const { isMobile } = useAppContext();

    const { onMessage, sendData } = useWorkerClient(worker);
    const [skillsData, setSkillsData] = useState({
        available: [],
        sp: {
            total: 0,
            max: 0
        }
    });

    const [detailsShown, setDetailsShown] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-skills-data', {});
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('skills-data', (skills) => {
        setSkillsData(skills);
    })

    const [overlayPositions, setOverlayPositions] = useState([]);

    const handleFlash = (position) => {
        // console.log('Adding flash: ', position);
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    };

    const onPurchase = (id) => {
        // console.log('Purchase: ', id);
        sendData('purchase-skill', { id })
    }

    const onShowDetails = (id) => {
        if(isMobile) {
            setDetailsShown(skillsData.available.find(one => one.id === id));
        }
        // console.log('onShowDetails: ', id);
    }


    return (<div className={'skills-wrap'}>
        <div className={'head'}>
            Skill points available: {skillsData.sp.total} / {skillsData.sp.max}
        </div>
        <div className={'skills-container'}>
            <PerfectScrollbar>
                <div className={'cards'}>
                    {skillsData.available.map(skill => (<ItemSkillCard key={skill.id} {...skill} onFlash={handleFlash} onPurchase={onPurchase} onShowDetails={onShowDetails} isMobile={isMobile}/>))}
                    {overlayPositions.map((position, index) => (
                        <FlashOverlay key={index} position={position} />
                    ))}
                </div>
            </PerfectScrollbar>
        </div>
        {isMobile && detailsShown ? (<div className={'details-wrap'}>
            <div className={'blade-inner'}>
                <div className={'block'}>
                    <h4>{detailsShown.name} ({formatInt(detailsShown.level)})</h4>
                    <div className={'description'}>
                        {detailsShown.description}
                    </div>
                </div>
                <div className={'block'}>
                    <p>Effects:</p>
                    <div className={'effects'}>
                        {detailsShown.currentEffects ?
                            (<ResourceComparison effects1={detailsShown.currentEffects} effects2={detailsShown.effects} /> )
                            : (<EffectsSection effects={detailsShown.effects} />)
                        }
                    </div>
                </div>
                <div className={'block'}>
                    <p>Cost:</p>
                    <div className={'costs-wrap'}>
                        {Object.values(detailsShown.affordable.affordabilities || {}).map(aff => <ResourceCost affordabilities={aff}/>)}
                    </div>
                </div>
                <div className={'block'}>
                    <button disabled={!detailsShown.affordable?.isAffordable} onClick={() => onPurchase(detailsShown.id)}>Purchase</button>
                </div>
            </div>
        </div> ) : null}
    </div> )
}

export const ItemSkillCard = ({ id, name, description, level, max, effects, currentEffects, affordable, isLeveled, onFlash, onPurchase, onShowDetails, isMobile}) => {

    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);

    return (<div
        ref={elementRef}
        className={`icon-card bigger item flashable ${!affordable.isAffordable ? 'unavailable' : ''}`}
        onMouseEnter={() => isMobile ? null : onShowDetails(id)}
        onMouseLeave={() => isMobile ? null : onShowDetails(null)}
        onClick={(e) => isMobile ? onShowDetails(id) : onPurchase(id, e.shiftKey ? 1e9 : 1)}
    >
        <TippyWrapper
            content={<div className={'hint-popup effects-popup'}>
                <div className={'blade-inner'}>
                    <div className={'block'}>
                        <h4>{name} ({formatInt(level)})</h4>
                        <div className={'description'}>
                            {description}
                        </div>
                    </div>
                    <div className={'block'}>
                        <p>Effects:</p>
                        <div className={'effects'}>
                            {currentEffects ?
                                (<ResourceComparison effects1={currentEffects} effects2={effects} /> )
                                : (<EffectsSection effects={effects} />)
                            }
                        </div>
                    </div>
                    <div className={'block'}>
                        <p>Cost:</p>
                        <div className={'costs-wrap'}>
                            {Object.values(affordable.affordabilities || {}).map(aff => <ResourceCost affordabilities={aff}/>)}
                        </div>
                    </div>
                    <p>Press to buy.</p>
                </div>

            </div>}>
            <div className={'icon-content'}>
                <img src={`icons/skills/${id}.png`} className={'resource'} />
                <span className={'level'}>{formatInt(level)}</span>
            </div>
        </TippyWrapper>

    </div> )
}
