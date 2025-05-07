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
    const [scale, setScale] = useState(80);
    const scaleMult = scale/80;
    const center = { x: 1250*scaleMult, y: 1250*scaleMult };
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
        setSkillsData(skills);
    })

    onMessage('import-skill-draft-error', data => {
        alert(data.error);
        console.warn(data.error, data.details);
    })

    const [overlayPositions, setOverlayPositions] = useState([]);

    useEffect(() => {
        const container = scrollRef.current?._container;
        if (!container) return;

        const handleWheel = (e) => {
            if (!e.ctrlKey && !e.metaKey) {
                e.preventDefault();

                const delta = e.deltaY < 0 ? 40 : -40;
                setScale(prev => Math.min(160, Math.max(40, prev + delta)));

                // 🧨 Блокуємо скрол:
                const originalScrollTop = container.scrollTop;
                const originalScrollLeft = container.scrollLeft;

                setTimeout(() => {
                    container.scrollTop = originalScrollTop;
                    container.scrollLeft = originalScrollLeft;
                }, 0); // Повертає назад одразу після події
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => container.removeEventListener('wheel', handleWheel);
    }, []);



    const handleFlash = (position) => {
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    };

    const onPurchase = (id) => {
        sendData('purchase-skill', { id })
    }

    const onDelete = (id) => {
        sendData('remove-skill', { id })
    }

    const onApply = () => {
        sendData('apply-skill-changes', {  })
    }

    const onDiscard = () => {
        sendData('discard-skill-changes', {  })
    }

    const onShowDetails = (id) => {
        if(isMobile) {
            setDetailsShown(skillsData.available[id]);
        }
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

    const handleWheel = (e) => {
        if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY < 0 ? 40 : -40;
            setScale(prev => Math.min(160, Math.max(40, prev + delta)));
        }
    };

    const prevScale = useRef(scale);      // зберігаємо попередній зум

    useEffect(() => {
        const container = scrollRef.current?._container;
        if (!container || prevScale.current === scale) return;

        // поточний центр екрана у КООРДИНАТАХ canvas-а
        const { scrollLeft, scrollTop, clientWidth, clientHeight } = container;
        const cx = scrollLeft + clientWidth  / 2;
        const cy = scrollTop  + clientHeight / 2;

        // коефіцієнт, на який масштаб виріс/зменшився
        const k = scale / prevScale.current;

        // нові координати того самого world-центра після ресайзу полотна
        container.scrollLeft = cx * k - clientWidth  / 2;
        container.scrollTop  = cy * k - clientHeight / 2;

        prevScale.current = scale;          // оновлюємо «минуле» значення
    }, [scale]);

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
                    onWheel={handleWheel}
                    className={'skills-container'}
                >
                    <PerfectScrollbar ref={scrollRef} style={{ width: "100%", height: "100%" }} options={{ wheelSpeed: 0 }}>
                        <div
                            ref={contentRef}
                            onMouseDown={handleMouseDown}
                            style={{ position: "relative", width: `${2500*scaleMult}px`, height: `${2500*scaleMult}px`, cursor: isDragging ? "grabbing" : "grab" }}
                        >
                            <svg width={2500*scaleMult} height={2500*scaleMult} style={{ position: "absolute", top: 0, left: 0 }}>
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
                                        <ItemSkillCard x={x} y={y} key={skill.id} {...skill} onFlash={handleFlash} onPurchase={onPurchase} onShowDetails={onShowDetails} isMobile={isMobile} scale={scale}/>
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

            {isMobile && detailsShown ? (<div className={'details-wrap skill-details-mobile'}>
                <PerfectScrollbar>
                    <div className={'blade-inner'}>
                        <div className={'block'}>
                            <div className={'flex-container flex-row'}>
                                <h4>{detailsShown.name} ({formatInt(detailsShown.level)})</h4>
                                <button disabled={!detailsShown.affordable?.isAffordable || !detailsShown.isRequirementsMet} onClick={() => onPurchase(detailsShown.id)}>Purchase</button>
                            </div>

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
                </PerfectScrollbar>

            </div> ) : null}
        </div>);
};

export const ItemSkillCard = ({ id, iconId, isUnlocked, x, y, icon, isRequirementsMet, name, description, level, max, isCapped, effects, currentEffects, affordable, isLeveled, onFlash, onPurchase, onShowDetails, isMobile, scale}) => {

    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);

    const sizeMult = Math.sqrt(scale/80);

    return (<div
        ref={elementRef}
        className={`icon-card absolute item flashable ${((!affordable.isAffordable) || (!isRequirementsMet) || isCapped) ? 'unavailable' : ''} ${isCapped ? ' complete' : ''} ${icon ? 'rounded semi-color' : ''} ${!isUnlocked ? 'black-out' : ''}`}
        onMouseEnter={() => isMobile ? null : onShowDetails(id)}
        onMouseLeave={() => isMobile ? null : onShowDetails(null)}
        onClick={(e) => isMobile ? onShowDetails(id) : onPurchase(id, e.shiftKey ? 1e9 : 1)}
        style={{
            left: `${x - 25*sizeMult}px`,
            top: `${y - 25*sizeMult}px`,
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
            <div className={`icon-content skill-map`} style={{ '--size-mult': sizeMult }}>
                {icon ? (<div className={'semi-color'} style={{backgroundColor: icon.color}}>+</div>) : (
                    <img src={`icons/skills/${iconId ?? id}.png`} className={'resource'}/>)}
                <span className={'level'}>{formatInt(level)}{max ? `/${formatInt(max)}` : ''}</span>
            </div>
        </TippyWrapper>) : (<TippyWrapper content={<div className={'hint-popup'}>Continue to progress in game to unlock this skill</div> }>
            <div className={`icon-content black`} style={{ '--size-mult': sizeMult }}>
                <img src={`icons/ui/icon_locked.png`} className={'resource'}/>
            </div></TippyWrapper>
        )}

    </div> )
}

export default SkillTree;