import React, {useRef, useEffect, useState, useContext} from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import WorkerContext from "../../context/worker-context";
import {useAppContext} from "../../context/ui-context";
import {useWorkerClient} from "../../general/client";
import {formatInt} from "../../general/utils/strings";
import {ResourceComparison} from "../shared/resource-comparison.jsx";
import {EffectsSection} from "../shared/effects-section.jsx";
import {ResourceCost} from "../shared/resource-cost.jsx";
import {useFlashOnLevelUp} from "../../general/hooks/flash";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {BreakDown} from "../layout/sidebar.jsx";

const SkillTree = () => {
    const scale = 80;
    const center = { x: 1250, y: 1250 };
    const scrollRef = useRef(null);
    const contentRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [start, setStart] = useState({ x: 0, y: 0, scrollX: 0, scrollY: 0 });

    const worker = useContext(WorkerContext);

    const { isMobile } = useAppContext();

    const { onMessage, sendData } = useWorkerClient(worker);
    const [skillsData, setSkillsData] = useState({
        available: {},
        sp: {
            total: 0,
            max: 0
        },
        currentEffects: [],
        drafts: []
    });

    const [detailsShown, setDetailsShown] = useState(null);

    useEffect(() => {
        sendData('query-skills-data', {});
        /*const interval = setInterval(() => {
            sendData('query-skills-data', {});
        }, 100);
        return () => {
            clearInterval(interval);
        }*/
    }, [])

    onMessage('skills-data', (skills) => {
        console.log('skills: ', skills);
        setSkillsData(skills);
    })

    onMessage('import-skill-draft-error', data => {
        alert(data.error);
        console.warn(data.error, data.details);
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

    const onDelete = (id) => {
        // console.log('Purchase: ', id);
        sendData('remove-skill', { id })
    }

    const onApply = () => {
        // console.log('Purchase: ', id);
        sendData('apply-skill-changes', {  })
    }

    const onDiscard = () => {
        // console.log('Purchase: ', id);
        sendData('discard-skill-changes', {  })
    }

    const onShowDetails = (id) => {
        if(isMobile) {
            setDetailsShown(skillsData.available[id]);
        }
        // console.log('onShowDetails: ', id);
    }


    useEffect(() => {
        if (scrollRef.current) {
            const container = scrollRef.current._container;
            if (container) {
                container.scrollLeft = center.x - container.clientWidth / 2;
                container.scrollTop = center.y - container.clientHeight / 2;
            }
        }
    }, []);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        const container = scrollRef.current._container;
        setStart({
            x: e.pageX,
            y: e.pageY,
            scrollX: container.scrollLeft,
            scrollY: container.scrollTop,
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const container = scrollRef.current._container;
        container.scrollLeft = start.scrollX - (e.pageX - start.x);
        container.scrollTop = start.scrollY - (e.pageY - start.y);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const saveDraft = () => {
        const name = prompt("Enter draft name:");
        if (name) sendData('save-skill-draft', { name });
    };

    const loadDraft = (id) => {
        sendData('load-skill-draft', { id, isViewMode: false });
    };

    const viewDraft = (id) => {
        sendData('load-skill-draft', { id, isViewMode: true });
    };

    const deleteDraft = (id) => {
        sendData('delete-skill-draft', { id });
    };

    const exportDraft = (id) => {
        sendData('export-skill-draft', { id });
    };

    onMessage('export-skill-draft-blob', (data) => {
        try {
            // Якщо `data` ще не є блобом, створюємо його
            const blob = new Blob([JSON.stringify(data)], { type: "application/json" });

            // Створюємо URL-об'єкт
            const url = window.URL.createObjectURL(blob);

            // Створюємо приховану кнопку завантаження
            const a = document.createElement('a');
            a.href = url;
            a.download = `skill-draft-${data.name.toLowerCase().replaceAll(/[^\w\d]/g, '_')}-${Date.now()}.json`;

            // Автоматично клікаємо для скачування
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Звільняємо пам'ять
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading skill draft:", error);
        }
    });



    const importDraft = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                sendData('import-skill-draft', { content: e.target.result });
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className={'skills-wrap'}>
            <div className={'head'}>
                <TippyWrapper content={(<div className={'hint-popup'}><BreakDown breakDown={skillsData.sp.breakDown} /> </div> )}>
                    <div>
                        Skill points available: {skillsData.sp.total} / {skillsData.sp.max}
                    </div>
                </TippyWrapper>
                {skillsData.isEditMode ? (<div className={'buttons'}>
                    {!skillsData.isViewMode ? (<button onClick={onApply}>Apply</button>) : null}
                    <button onClick={onDiscard}>{!skillsData.isViewMode ? 'Discard' : 'Close'}</button>
                </div>) : null}
            </div>
            <div className={'skill-popup-container'}>
                <div
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className={'skills-container'}
                >
                    <PerfectScrollbar ref={scrollRef} style={{ width: "100%", height: "100%" }}>
                        <div
                            ref={contentRef}
                            onMouseDown={handleMouseDown}
                            style={{ position: "relative", width: "2500px", height: "2500px", cursor: isDragging ? "grabbing" : "grab" }}
                        >
                            <svg width="2500" height="2500" style={{ position: "absolute", top: 0, left: 0 }}>
                                {Object.entries(skillsData.available).map(([id, skill]) =>
                                    skill.unlockBySkills?.map((req, index) => {
                                        const from = skillsData.available[req.id];
                                        if (!from) return null;
                                        const x1 = center.x + from.position.left * scale;
                                        const y1 = center.y + from.position.top * scale;
                                        const x2 = center.x + skill.position.left * scale;
                                        const y2 = center.y + skill.position.top * scale;
                                        const midX = (x1 + x2) / 2;
                                        const midY = (y1 + y2) / 2;

                                        let currentLevel = skillsData.available[req.id]?.level || 0;
                                        const requiredLevel = req.level;

                                        const mutualSkill = skillsData.available[req.id]?.unlockBySkills?.find(s => s.id === skill.id);
                                        if (mutualSkill) {
                                            currentLevel = Math.max(currentLevel, skillsData.available[id]?.level || 0);
                                        }

                                        const arrowPosition = 0.75; // 75% ближче до дочірнього скіла
                                        const arrowX = x1 + (x2 - x1) * arrowPosition;
                                        const arrowY = y1 + (y2 - y1) * arrowPosition;

                                        const strokeColor = req.isMet || currentLevel >= requiredLevel ? '#999' : '#333';
                                        const fillColor = req.isMet || currentLevel >= requiredLevel ? '#111' : '#333';
                                        const textColor = req.isMet || currentLevel >= requiredLevel ? '#2dfa50' : '#da8a11';

                                        return (
                                            <g key={`${id}-line-${index}`}>
                                                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth="2" />
                                                <polygon
                                                    points="-8,-5 8,0 -8,5"
                                                    transform={`translate(${arrowX}, ${arrowY}) rotate(${Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI})`}
                                                    fill={strokeColor}
                                                />
                                                <circle cx={midX} cy={midY} r="10" fill={fillColor} stroke="#999" strokeWidth="2" />
                                                <text x={midX} y={midY} textAnchor="middle" alignmentBaseline="middle" fontSize="12" fill={textColor}>
                                                    {`${currentLevel}/${requiredLevel}`}
                                                </text>
                                            </g>
                                        );
                                    })
                                )}
                            </svg>
                            {Object.entries(skillsData.available).map(([id, skill]) => {
                                const x = center.x + skill.position.left * scale;
                                const y = center.y + skill.position.top * scale;

                                return (<>
                                        <ItemSkillCard x={x} y={y} key={skill.id} {...skill} onFlash={handleFlash} onPurchase={onPurchase} onShowDetails={onShowDetails} isMobile={isMobile}/>
                                        {skill.diff ? (<div
                                            className={'delete-diff'}
                                            style={{
                                                left: `${x + 30}px`,
                                                top: `${y - 60}px`,
                                            }}

                                        >
                                            <p>+{skill.diff}</p>
                                            <button onClick={() => onDelete(skill.id)}>-</button>
                                        </div> ) : null}
                                    </>)
                            })}
                        </div>
                    </PerfectScrollbar>
                </div>
                {!isMobile ? (<div className={'skills-sidebar'}>
                    <div className={'block comparison'}>
                        <p>Current skills effects</p>
                        <div className={'table'}>
                            <PerfectScrollbar>
                                <div className={'eff-wrap'}>
                                    {skillsData.potentialEffects
                                        ? (<ResourceComparison effects1={skillsData.currentEffects} effects2={skillsData.potentialEffects} />)
                                        : (<EffectsSection effects={skillsData.currentEffects} maxDisplay={200}/>)}
                                </div>
                            </PerfectScrollbar>
                        </div>
                    </div>
                    <div className={'block draft-workarea'}>
                        <div className="draft-controls">
                            <button onClick={saveDraft}>Save Draft</button>
                            <button onClick={() => document.getElementById("import-draft-input").click()}>
                                Import Draft
                            </button>
                            <input
                                type="file"
                                id="import-draft-input"
                                onChange={importDraft}
                                style={{ display: "none" }} // Приховуємо інпут
                            />
                        </div>
                        <div className={'list'}>
                            <PerfectScrollbar>
                                <ul>
                                    {skillsData.drafts.map((draft) => (
                                        <li key={draft.id} className={`draft-item ${draft.isAppliable ? ' available' : ' unavailable'}`}>
                                            {draft.name} ({new Date(draft.timestamp).toLocaleString()})
                                            <div className={'icons flex-container'}>
                                                <TippyWrapper content={<div className={'hint-popup'}>View Build</div> }>
                                                    <div className={'icon-content edit-icon interface-icon small'} onClick={() => viewDraft(draft.id)}>
                                                        <img src={"icons/interface/icon_show.png"}/>
                                                    </div>
                                                </TippyWrapper>
                                                <TippyWrapper content={<div className={'hint-popup'}>Apply Build</div> }>
                                                    <div className={`icon-content edit-icon interface-icon small ${!draft.isAppliable ? 'disabled' : ''}`} onClick={() => loadDraft(draft.id)}>
                                                        <img src={"icons/interface/run.png"}/>
                                                    </div>
                                                </TippyWrapper>
                                                <TippyWrapper content={<div className={'hint-popup'}>Export Build</div> }>
                                                    <div className={`icon-content edit-icon interface-icon small`} onClick={() => exportDraft(draft.id)}>
                                                        <img src={"icons/interface/download.png"}/>
                                                    </div>
                                                </TippyWrapper>
                                                <TippyWrapper content={<div className={'hint-popup'}>Delete Build</div> }>
                                                    <div className={`icon-content edit-icon interface-icon small`} onClick={() => deleteDraft(draft.id)}>
                                                        <img src={"icons/interface/delete.png"}/>
                                                    </div>
                                                </TippyWrapper>
                                            </div>

                                            {/*<button onClick={() => viewDraft(draft.id)}>View</button>
                                            <button disabled={!draft.isAppliable} onClick={() => loadDraft(draft.id)}>Load</button>
                                            <button onClick={() => exportDraft(draft.id)}>Export</button>
                                            <button onClick={() => deleteDraft(draft.id)}>Delete</button>*/}
                                        </li>
                                    ))}
                                </ul>
                            </PerfectScrollbar>
                        </div>
                    </div>
                </div> ) : null}
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
                        <button disabled={!detailsShown.affordable?.isAffordable || !detailsShown.isRequirementsMet} onClick={() => onPurchase(detailsShown.id)}>Purchase</button>
                    </div>
                </div>
            </div> ) : null}
        </div>);
};

export const ItemSkillCard = ({ id, isUnlocked, x, y, icon, isRequirementsMet, name, description, level, max, isCapped, effects, currentEffects, affordable, isLeveled, onFlash, onPurchase, onShowDetails, isMobile}) => {

    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);

    return (<div
        ref={elementRef}
        className={`icon-card absolute item flashable ${((!affordable.isAffordable) || (!isRequirementsMet) || isCapped) ? 'unavailable' : ''} ${isCapped ? ' complete' : ''} ${icon ? 'rounded semi-color' : ''} ${!isUnlocked ? 'black-out' : ''}`}
        onMouseEnter={() => isMobile ? null : onShowDetails(id)}
        onMouseLeave={() => isMobile ? null : onShowDetails(null)}
        onClick={(e) => isMobile ? onShowDetails(id) : onPurchase(id, e.shiftKey ? 1e9 : 1)}
        style={{
            left: `${x - 25}px`,
            top: `${y - 25}px`,
        }}
    >
        {isUnlocked ? (<TippyWrapper
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
                                (<ResourceComparison effects1={currentEffects} effects2={effects}/>)
                                : (<EffectsSection effects={effects}/>)
                            }
                        </div>
                    </div>
                    <div className={'block'}>
                        <p>Cost:</p>
                        <div className={'costs-wrap'}>
                            {Object.values(affordable.affordabilities || {}).map(aff => <ResourceCost
                                affordabilities={aff}/>)}
                        </div>
                    </div>
                    <p>Press to buy.</p>
                </div>

            </div>}>
            <div className={`icon-content`}>
                {icon ? (<div className={'semi-color'} style={{backgroundColor: icon.color}}>+</div>) : (
                    <img src={`icons/skills/${id}.png`} className={'resource'}/>)}
                <span className={'level'}>{formatInt(level)}{max ? `/${formatInt(max)}` : ''}</span>
            </div>
        </TippyWrapper>) : (<div className={`icon-content black`}></div>)}

    </div> )
}

export default SkillTree;