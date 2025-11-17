import React, {useCallback, useContext, useEffect, useMemo, useState} from "react";
import WorkerContext from "../../../context/worker-context";
import {useWorkerClient} from "../../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {formatValue} from "../../../general/utils/strings";
import {EffectsSection} from "../../shared/effects-section.jsx";
import {TippyWrapper} from "../../shared/tippy-wrapper.jsx";
import {useAppContext} from "../../../context/ui-context";
import {RawResource} from "../../shared/raw-resource.jsx";

const defaultZooData = {
    unlocked: false,
    space: { total: 0, used: 0, free: 0 },
    limits: { totalPercent: 0, remainingPercent: 1 },
    animals: [],
};

const devPreviewZooData = {
    unlocked: true,
    space: { total: 75, used: 52, free: 23 },
    limits: { totalPercent: 0.65, remainingPercent: 0.35 },
    animals: [
        {
            id: 'magic_henk',
            name: 'Magic Henk',
            description: 'A dimensional wanderer whose mere presence harmonizes magical amplifiers.',
            icon: 'inventory_charged_amethyst',
            count: 18.2,
            isLimited: true,
            limitPercent: 0.35,
            limitValue: 26.25,
            effects: {
                earth_amplifier_efficiency: {
                    name: 'Earth Amplifier Efficiency',
                    type: 'effects',
                    scope: 'income',
                    isPercentage: true,
                    value: 0.125
                },
                air_amplifier_efficiency: {
                    name: 'Air Amplifier Efficiency',
                    type: 'effects',
                    scope: 'income',
                    isPercentage: true,
                    value: 0.125
                }
            }
        },
        {
            id: 'magic_cat',
            name: 'Magic Cat',
            description: 'A curious feline that curls up on spellbooks, inspiring faster study sessions.',
            icon: 'inventory_ruby',
            count: 14.6,
            isLimited: false,
            limitPercent: null,
            limitValue: null,
            effects: {
                books_learning_rate: {
                    name: 'Books Learning Rate',
                    type: 'effects',
                    scope: 'income',
                    isPercentage: true,
                    value: 0.083
                }
            }
        },
        {
            id: 'green_bear',
            name: 'Green Bear',
            description: 'A gentle giant that practices tai chi, motivating physical training routines.',
            icon: 'inventory_spark',
            count: 19.1,
            isLimited: true,
            limitPercent: 0.30,
            limitValue: 22.5,
            effects: {
                physical_training_learn_speed: {
                    name: 'Physical Training Learn Speed',
                    type: 'effects',
                    scope: 'income',
                    isPercentage: true,
                    value: 0.091
                }
            }
        }
    ]
};

const ZooCard = ({ animal, totalSpace, showNumericInputs, onSetLimit, onShowDetails, isMobile }) => {
    const [inputValue, setInputValue] = useState(animal.isLimited ? (animal.limitPercent ?? 0) : 1);
    const spaceShare = totalSpace > 0 ? (animal.count / totalSpace) : 0;

    useEffect(() => {
        setInputValue(animal.isLimited ? (animal.limitPercent ?? 0) : 1);
    }, [animal.limitPercent, animal.isLimited]);

    const handleInputChange = (value) => {
        const normalized = Math.max(0, Math.min(1, value));
        const rounded = Math.round(normalized * 1000000) / 1000000;
        setInputValue(rounded);
        onSetLimit(animal.id, rounded);
    };

    const handleInputEvent = (event) => {
        const value = parseFloat(event.target.value);
        if (!isNaN(value)) {
            handleInputChange(value);
        }
    };

    const handleNumericBlur = () => {
        setInputValue(animal.isLimited ? (animal.limitPercent ?? 0) : 1);
    };

    const handleMouseEnter = () => {
        if (!isMobile) {
            onShowDetails(animal.id);
        }
    };

    const handleMouseLeave = () => {
        if (!isMobile) {
            onShowDetails(null);
        }
    };

    const handleClick = () => {
        if (isMobile) {
            onShowDetails(animal.id);
        }
    };

    return (
        <div
            className={'card craftable zoo-card'}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseOver={() => !isMobile ? onShowDetails(animal.id) : null}
            onClick={handleClick}
        >
            <div className={'flex-container two-side-card'}>
                <div className={'left'}>
                    <img src={`icons/resources/${animal.icon}.png`} className={'resource big'} alt={animal.name}/>
                </div>
                <div className={'right'}>
                    <div className={'head'}>
                        <p className={'title'}>{animal.name}</p>
                    </div>
                    <div className={'zoo-stats-row'}>
                        <span>Animals: <strong>{formatValue(animal.count)}</strong></span>
                        <span>Space: <strong>{formatValue(spaceShare * 100)}%</strong></span>
                    </div>
                    <div className={'zoo-stats-row'}>
                        <span>Limit: <strong>{animal.isLimited ? `${formatValue((animal.limitPercent ?? 0) * 100)}%` : 'Unlimited'}</strong></span>
                    </div>
                </div>
            </div>
            <div className={'bottom self-placed zoo-card-controls'}>
                <div className={'buttons'}>
                    <span className={'label'}>Limit share:</span>
                    <div className={'effort-control flex-container flex-row'}>
                        <div
                            className={'icon-content minimize-icon interface-icon tiny'}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleInputChange(0);
                            }}
                        >
                            <img src={'icons/interface/minimize.png'} alt={'Minimize'}/>
                        </div>
                        {showNumericInputs ? (
                            <input
                                type={'number'}
                                className={'level-set numeric-input'}
                                min={0}
                                max={1}
                                step={0.000001}
                                value={inputValue}
                                onChange={handleInputEvent}
                                onBlur={handleNumericBlur}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <input
                                type={'range'}
                                className={'level-set'}
                                min={0}
                                max={1}
                                step={0.000001}
                                value={inputValue}
                                onChange={handleInputEvent}
                            />
                        )}
                        <div
                            className={'icon-content maximize-icon interface-icon tiny'}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleInputChange(1);
                            }}
                        >
                            <img src={'icons/interface/maximize.png'} alt={'Maximize'}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ZooDetails = ({ animal, totalSpace, onClose, isMobile }) => {
    if (!animal) {
        return null;
    }

    const spaceShare = totalSpace > 0 ? (animal.count / totalSpace) : 0;

    return (
        <PerfectScrollbar>
            <div className={'blade-inner zoo-details'}>
                <div className={'block'}>
                    <h4>{animal.name}</h4>
                    <p className={'hint separated'}>{animal.description}</p>
                </div>
                <div className={'block'}>
                    <p>Population</p>
                    <div className={'zoo-detail-stats'}>
                        <div className={'flex-row flex-container'}>
                            <span>Animals</span>
                            <strong>{formatValue(animal.count)}</strong>
                        </div>
                        <div className={'flex-row flex-container'}>
                            <span>Space usage</span>
                            <strong>{formatValue(spaceShare * 100)}%</strong>
                        </div>
                        <div className={'flex-row flex-container'}>
                            <span>Limit</span>
                            <strong>{animal.isLimited ? `${formatValue((animal.limitPercent ?? 0) * 100)}% (~${formatValue(animal.limitValue ?? 0)} space)` : 'Unlimited'}</strong>
                        </div>
                    </div>
                </div>
                <div className={'block'}>
                    <p>Effects</p>
                    <EffectsSection effects={animal.effects} maxDisplay={10} />
                </div>
                {isMobile ? (
                    <div className={'block buttons'}>
                        <button onClick={onClose}>Close</button>
                    </div>
                ) : null}
            </div>
        </PerfectScrollbar>
    );
};

const ZooOverview = ({ space, limits, zooUnlocked, isMobile, onClose }) => (
    <PerfectScrollbar>
        <div className={'blade-inner zoo-details'}>
            <div className={'block'}>
                <h4>Magical Zoo</h4>
                <p className={'hint separated'}>
                    Assign percentage caps to each animal type to control how much of your total Magic Zoo Space they can occupy.
                    Set a limit to reserve habitat for other creatures or keep it unlimited to let the population grow freely.
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

export const ZooWrap = ({ children }) => {
    const worker = useContext(WorkerContext);
    const { isMobile } = useAppContext();
    const [isDetailVisible, setDetailVisible] = useState(!isMobile);
    const [detailOpened, setDetailOpened] = useState(null);
    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const [zooData, setZooData] = useState(defaultZooData);
    const [showNumericInputs, setShowNumericInputs] = useState(() => {
        const saved = localStorage.getItem('zoo-show-numeric-inputs');
        return saved ? JSON.parse(saved) : false;
    });

    const isDevPreview = useMemo(() => {
        if (typeof window === 'undefined') {
            return false;
        }
        if (process.env.NODE_ENV === 'production') {
            return false;
        }
        return new URLSearchParams(window.location.search).get('zooPreview') === '1';
    }, []);

    useEffect(() => {
        if (isDevPreview) {
            setZooData(devPreviewZooData);
            return () => {};
        }
        sendData('query-zoo-data');
        const interval = setInterval(() => {
            sendData('query-zoo-data');
        }, 250);
        return () => {
            clearInterval(interval);
        };
    }, [isDevPreview, sendData]);

    useEffect(() => {
        if (isDevPreview) {
            return () => {};
        }
        onMessage('zoo-data', (payload) => {
            setZooData(payload || defaultZooData);
        });
        return () => {
            removeMessage('zoo-data');
        };
    }, [isDevPreview, onMessage, removeMessage]);

    const handleShowNumericInputsChange = useCallback((value) => {
        setShowNumericInputs(value);
        localStorage.setItem('zoo-show-numeric-inputs', JSON.stringify(value));
    }, []);

    const onSetLimit = useCallback((id, percent) => {
        sendData('set-zoo-limit', { id, percent });
    }, [sendData]);

    const space = zooData.space || defaultZooData.space;
    const limits = zooData.limits || defaultZooData.limits;

    const handleShowDetails = useCallback((id) => {
        if (!id) {
            setDetailOpened(null);
            if (isMobile) {
                setDetailVisible(false);
            }
            return;
        }
        setDetailOpened(id);
        if (isMobile) {
            setDetailVisible(true);
        }
    }, [isMobile]);

    const activeAnimal = useMemo(() => {
        if (!detailOpened) return null;
        return zooData.animals.find((animal) => animal.id === detailOpened) || null;
    }, [detailOpened, zooData.animals]);

    const handleCloseDetail = useCallback(() => {
        setDetailOpened(null);
        setDetailVisible(false);
    }, []);

    return (
        <div className={'items-wrap crafting-workshop-wrap zoo-workshop-wrap'}>
            <div className={'items ingame-box'}>
                <div className={'menu-wrap workshop'}>
                    <div className={'head'}>
                        {children}
                    </div>
                    <div className={'flex-container additional-filters'}>
                        {isMobile ? (
                            <div>
                                <span className={'highlighted-span'} onClick={() => setDetailVisible(true)}>Info</span>
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className={'crafting-wrap zoo-wrap'}>
                    <div className={'head zoo-header'}>
                        <div className={'flex-container zoo-summary'}>
                            <TippyWrapper content={<div className={'hint-popup'}>
                                <p className={'hint'}>Zoo Capacity shows how much total Magical Zoo Space your enclosures provide. Animals consume this space as they grow.</p>
                            </div>}>
                                <div className={'space-item summary-item zoo-capacity'}>
                                    <RawResource id={'magic_zoo_space'} name={'Zoo Capacity'} />
                                    <span className={`slots-amount ${space.total > 0 ? 'slots-available' : 'slots-unavailable'}`}>
                                        {formatValue(space.used)}/{formatValue(space.total)}
                                    </span>
                                </div>
                            </TippyWrapper>
                        </div>
                        <div className={'auto-rebalance-controls zoo-controls'}>
                            <div className={'space-item'}>
                                <TippyWrapper content={<div className={'hint-popup'}>
                                    <p>Switch between sliders and numeric inputs when setting zoo limits.</p>
                                </div>}>
                                    <label className={'checkbox-label'}>
                                        <input
                                            type="checkbox"
                                            checked={showNumericInputs}
                                            onChange={(e) => handleShowNumericInputsChange(e.target.checked)}
                                        />
                                        <span>Show numeric inputs</span>
                                    </label>
                                </TippyWrapper>
                            </div>
                            <div className={'space-item remaining-limit'}>
                                <span>Remaining limit pool:</span>
                                <strong>{formatValue((limits.remainingPercent ?? 0) * 100)}%</strong>
                            </div>
                        </div>
                    </div>
                    <div className={'craftables-cat zoo-content'}>
                        {zooData.unlocked ? (
                            <PerfectScrollbar>
                                <div className={'flex-container'}>
                                    {zooData.animals.map((animal) => (
                                        <ZooCard
                                            key={animal.id}
                                            animal={animal}
                                            totalSpace={space.total}
                                            showNumericInputs={showNumericInputs}
                                            onSetLimit={onSetLimit}
                                            onShowDetails={handleShowDetails}
                                            isMobile={isMobile}
                                        />
                                    ))}
                                </div>
                            </PerfectScrollbar>
                        ) : (
                            <div className={'zoo-locked card'}>
                                Purchase the Magical Zoo upgrade to start caring for mystical animals.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {(!isMobile || isDetailVisible || detailOpened) ? (
                <div className={'item-detail ingame-box detail-blade'}>
                    {activeAnimal ? (
                        <ZooDetails
                            animal={activeAnimal}
                            totalSpace={space.total}
                            onClose={handleCloseDetail}
                            isMobile={isMobile}
                        />
                    ) : (
                        <ZooOverview
                            space={space}
                            limits={limits}
                            zooUnlocked={zooData.unlocked}
                            isMobile={isMobile}
                            onClose={() => setDetailVisible(false)}
                        />
                    )}
                </div>
            ) : null}
        </div>
    );
};
