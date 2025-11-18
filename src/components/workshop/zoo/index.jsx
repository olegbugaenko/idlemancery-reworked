import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import WorkerContext from "../../../context/worker-context";
import {useWorkerClient} from "../../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {formatValue} from "../../../general/utils/strings";
import {EffectsSection} from "../../shared/effects-section.jsx";
import {TippyWrapper} from "../../shared/tippy-wrapper.jsx";
import {useAppContext} from "../../../context/ui-context";
import {RawResource} from "../../shared/raw-resource.jsx";

const FEED_EPSILON = 0.000001;

const clampShare = (value) => {
    if (typeof value !== 'number' || isNaN(value)) {
        return 0;
    }
    if (value < 0) {
        return 0;
    }
    if (value > 1) {
        return 1;
    }
    return value;
};

const DEV_FEED_REQUIREMENTS = {
    magic_henk: { id: 'inventory_focusberry', name: 'Focusberry', perAnimal: 1_000_000 },
    magic_cat: { id: 'inventory_nightshade', name: 'Nightshade', perAnimal: 1_200_000 },
    green_bear: { id: 'inventory_ginseng', name: 'Ginseng', perAnimal: 1_500_000 },
};

const buildFallbackDetailFromSummary = (animal) => {
    if (!animal) {
        return null;
    }
    const feedLevel = typeof animal.feedLevel === 'number' ? animal.feedLevel : 1;
    const feedEfficiency = typeof animal.feedEfficiency === 'number' ? animal.feedEfficiency : 1;
    const effectiveMultiplier = typeof animal.effectiveGrowthMultiplier === 'number'
        ? animal.effectiveGrowthMultiplier
        : feedLevel * feedEfficiency;
    const baseRate = 0.01 + 0.001 * (animal.count ?? 0);
    return {
        ...animal,
        feed: {
            level: feedLevel,
            efficiency: feedEfficiency,
            effectiveMultiplier,
            previewLevel: feedLevel,
            previewEffectiveMultiplier: effectiveMultiplier,
            missingResource: null,
            requirements: [],
        },
        breeding: {
            baseRate,
            currentRate: baseRate * effectiveMultiplier,
            previewRate: baseRate * effectiveMultiplier,
        },
    };
};

const buildDevPreviewDetail = (animal, overrideLevel = null) => {
    const fallback = buildFallbackDetailFromSummary(animal);
    if (!fallback) {
        return null;
    }
    const feedLevel = fallback.feed?.level ?? 1;
    const previewLevel = clampShare(typeof overrideLevel === 'number' ? overrideLevel : feedLevel);
    const efficiency = fallback.feed?.efficiency ?? 1;
    const count = fallback.count ?? 0;
    const requirement = DEV_FEED_REQUIREMENTS[fallback.id];
    const requirements = requirement ? [{
        resource: { id: requirement.id, name: requirement.name },
        perAnimal: requirement.perAnimal,
        consumption: requirement.perAnimal * count * feedLevel,
        previewConsumption: requirement.perAnimal * count * previewLevel,
    }] : [];

    return {
        ...fallback,
        feed: {
            ...fallback.feed,
            requirements,
            previewLevel,
            previewEffectiveMultiplier: previewLevel * efficiency,
        },
        breeding: {
            ...fallback.breeding,
            previewRate: fallback.breeding.baseRate * previewLevel * efficiency,
        },
    };
};

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
            feedLevel: 0.8,
            feedEfficiency: 1,
            effectiveGrowthMultiplier: 0.8,
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
            feedLevel: 0.6,
            feedEfficiency: 0.95,
            effectiveGrowthMultiplier: 0.57,
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
            feedLevel: 0.9,
            feedEfficiency: 0.85,
            effectiveGrowthMultiplier: 0.765,
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

const ZooCard = ({ animal, totalSpace, showNumericInputs, onSetLimit, onHover, onSelect, isMobile, isSelected }) => {
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
            onHover?.(animal.id);
        }
    };

    const handleMouseLeave = () => {
        if (!isMobile) {
            onHover?.(null);
        }
    };

    const handleClick = () => {
        onSelect?.(animal.id);
    };

    return (
        <div
            className={`card craftable zoo-card ${isSelected ? 'selected' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseOver={() => !isMobile ? onHover?.(animal.id) : null}
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
                    <div className={'zoo-stats-row'}>
                        <span>Feeding:</span>
                        <strong>
                            {formatValue((animal.feedLevel ?? 1) * 100)}%
                            {typeof animal.feedEfficiency === 'number' ? ` (Eff. ${formatValue((animal.feedEfficiency ?? 1) * 100)}%)` : ''}
                        </strong>
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

const ZooDetails = ({
    animal,
    totalSpace,
    onClose,
    isMobile,
    showNumericInputs,
    isEditing,
    feedLevelDraft,
    onFeedLevelChange,
    onSaveFeedLevel,
    onCancelFeedLevel,
    isFeedDirty,
}) => {
    if (!animal) {
        return null;
    }

    const spaceShare = totalSpace > 0 ? (animal.count / totalSpace) : 0;
    const feedInfo = animal.feed || {};
    const breedingInfo = animal.breeding || {};
    const displayedFeedLevel = isEditing && typeof feedLevelDraft === 'number'
        ? clampShare(feedLevelDraft)
        : clampShare(feedInfo.level ?? 1);
    const feedEfficiency = feedInfo.efficiency ?? 1;
    const effectiveMultiplier = displayedFeedLevel * feedEfficiency;
    const previewEffectiveMultiplier = feedInfo.previewEffectiveMultiplier ?? effectiveMultiplier;
    const showPreview = isEditing && Math.abs(previewEffectiveMultiplier - effectiveMultiplier) > FEED_EPSILON;
    const feedRequirements = feedInfo.requirements || [];

    const handleFeedInput = (value) => {
        if (typeof value !== 'number' || isNaN(value)) {
            return;
        }
        onFeedLevelChange?.(clampShare(value));
    };

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

                <div className={'block zoo-feed-block'}>
                    <p>Feeding</p>
                    <div className={'zoo-feed-summary'}>
                        <div className={'flex-row flex-container'}>
                            <span>Feeding level</span>
                            <strong>{formatValue(displayedFeedLevel * 100)}%</strong>
                        </div>
                        <div className={'flex-row flex-container'}>
                            <span>Feeding efficiency</span>
                            <strong>{formatValue(feedEfficiency * 100)}%</strong>
                        </div>
                        <div className={'flex-row flex-container'}>
                            <span>Effective breeding</span>
                            <strong>{formatValue(effectiveMultiplier * 100)}%</strong>
                        </div>
                        {showPreview ? (
                            <div className={'flex-row flex-container preview-row'}>
                                <span>Preview</span>
                                <strong>{formatValue(previewEffectiveMultiplier * 100)}%</strong>
                            </div>
                        ) : null}
                    </div>
                    {isEditing ? (
                        <div className={'zoo-feed-controls'}>
                            <span className={'label'}>Adjust feeding level</span>
                            <div className={'effort-control flex-container flex-row'}>
                                <div
                                    className={'icon-content minimize-icon interface-icon tiny'}
                                    onClick={() => handleFeedInput(0)}
                                >
                                    <img src={'icons/interface/minimize.png'} alt={'Minimize'} />
                                </div>
                                {showNumericInputs ? (
                                    <input
                                        type={'number'}
                                        className={'level-set numeric-input'}
                                        min={0}
                                        max={1}
                                        step={0.000001}
                                        value={displayedFeedLevel}
                                        onChange={(event) => handleFeedInput(parseFloat(event.target.value))}
                                    />
                                ) : (
                                    <input
                                        type={'range'}
                                        className={'level-set'}
                                        min={0}
                                        max={1}
                                        step={0.000001}
                                        value={displayedFeedLevel}
                                        onChange={(event) => handleFeedInput(parseFloat(event.target.value))}
                                    />
                                )}
                                <div
                                    className={'icon-content maximize-icon interface-icon tiny'}
                                    onClick={() => handleFeedInput(1)}
                                >
                                    <img src={'icons/interface/maximize.png'} alt={'Maximize'} />
                                </div>
                            </div>
                            <div className={'buttons zoo-feed-actions'}>
                                <button className={'warning-action'} onClick={onCancelFeedLevel}>Cancel</button>
                                <button className={'primary-action'} disabled={!isFeedDirty} onClick={onSaveFeedLevel}>Save</button>
                            </div>
                        </div>
                    ) : null}
                    {feedInfo.missingResource ? (
                        <p className={'hint warning'}>
                            Breeding is slowed due to a lack of <strong>{feedInfo.missingResource.name ?? feedInfo.missingResource.id}</strong>.
                        </p>
                    ) : null}
                </div>

                <div className={'block zoo-feed-requirements'}>
                    <p>Feeding Cost</p>
                    {feedRequirements.length ? (
                        <ul>
                            {feedRequirements.map((req, index) => (
                                <li key={req.resource?.id ?? index}>
                                    <div className={'resource-name'}>
                                        <RawResource id={req.resource?.id} name={req.resource?.name ?? req.resource?.id} />
                                    </div>
                                    <div className={'values'}>
                                        <span>{formatValue(req.perAnimal ?? 0)} / animal</span>
                                        <span>{formatValue(req.consumption ?? 0)} / s</span>
                                        {isEditing && typeof req.previewConsumption === 'number' && Math.abs((req.previewConsumption ?? 0) - (req.consumption ?? 0)) > FEED_EPSILON ? (
                                            <span className={'preview'}>Preview: {formatValue(req.previewConsumption)} / s</span>
                                        ) : null}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={'hint'}>No feeding costs configured for this animal yet.</p>
                    )}
                </div>

                <div className={'block zoo-breeding-block'}>
                    <p>Breeding Rate</p>
                    <div className={'zoo-breeding-row'}>
                        <span>Current</span>
                        <strong>{formatValue(breedingInfo.currentRate ?? 0)} / s</strong>
                    </div>
                    {showPreview ? (
                        <div className={'zoo-breeding-row preview-row'}>
                            <span>Preview</span>
                            <strong>{formatValue(breedingInfo.previewRate ?? 0)} / s</strong>
                        </div>
                    ) : null}
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

export const ZooWrap = ({ children }) => {
    const worker = useContext(WorkerContext);
    const { isMobile } = useAppContext();
    const [isDetailVisible, setDetailVisible] = useState(!isMobile);
    const [hoveredAnimalId, setHoveredAnimalId] = useState(null);
    const [selectedAnimalId, setSelectedAnimalId] = useState(null);
    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const [zooData, setZooData] = useState(defaultZooData);
    const [showNumericInputs, setShowNumericInputs] = useState(() => {
        const saved = localStorage.getItem('zoo-show-numeric-inputs');
        return saved ? JSON.parse(saved) : false;
    });
    const [animalDetail, setAnimalDetail] = useState(null);
    const [feedDraftValue, setFeedDraftValue] = useState(null);
    const feedDraftAnimalIdRef = useRef(null);

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

    useEffect(() => {
        if (isDevPreview) {
            return () => {};
        }
        onMessage('zoo-animal-details', (payload) => {
            setAnimalDetail(payload || null);
        });
        return () => {
            removeMessage('zoo-animal-details');
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
    const animals = zooData.animals || defaultZooData.animals;

    const handleHoverAnimal = useCallback((id) => {
        if (isMobile) {
            return;
        }
        setHoveredAnimalId(id);
    }, [isMobile]);

    const handleSelectAnimal = useCallback((id) => {
        setSelectedAnimalId((prev) => {
            const next = prev === id ? null : id;
            if (isMobile) {
                setDetailVisible(!!next);
            }
            return next;
        });
    }, [isMobile]);

    useEffect(() => {
        if (hoveredAnimalId && !animals.some((animal) => animal.id === hoveredAnimalId)) {
            setHoveredAnimalId(null);
        }
    }, [hoveredAnimalId, animals]);

    useEffect(() => {
        if (selectedAnimalId && !animals.some((animal) => animal.id === selectedAnimalId)) {
            setSelectedAnimalId(null);
            if (isMobile) {
                setDetailVisible(false);
            }
        }
    }, [selectedAnimalId, animals, isMobile]);

    const activeAnimal = useMemo(() => {
        const prioritizedId = hoveredAnimalId || selectedAnimalId;
        if (!prioritizedId) return null;
        return animals.find((animal) => animal.id === prioritizedId) || null;
    }, [animals, hoveredAnimalId, selectedAnimalId]);

    const isEditing = useMemo(() => !!selectedAnimalId && activeAnimal && selectedAnimalId === activeAnimal.id, [selectedAnimalId, activeAnimal]);

    const isEditingRef = useRef(false);
    useEffect(() => {
        isEditingRef.current = isEditing;
    }, [isEditing]);

    useEffect(() => {
        if (isDevPreview) {
            return () => {};
        }
        if (!activeAnimal?.id) {
            setAnimalDetail(null);
            return () => {};
        }
        const requestDetails = () => {
            const payload = { id: activeAnimal.id };
            if (isEditingRef.current && typeof feedDraftValue === 'number' && feedDraftAnimalIdRef.current === activeAnimal.id) {
                payload.feedLevelOverride = feedDraftValue;
            }
            sendData('query-zoo-animal-details', payload);
        };
        requestDetails();
        const interval = setInterval(requestDetails, 500);
        return () => {
            clearInterval(interval);
        };
    }, [activeAnimal?.id, isDevPreview, sendData, feedDraftValue]);

    useEffect(() => {
        if (!isDevPreview) {
            return;
        }
        if (!activeAnimal) {
            setAnimalDetail(null);
            return;
        }
        const override = isEditing && typeof feedDraftValue === 'number' ? feedDraftValue : null;
        setAnimalDetail(buildDevPreviewDetail(activeAnimal, override));
    }, [isDevPreview, activeAnimal, isEditing, feedDraftValue]);

    useEffect(() => {
        if (!selectedAnimalId) {
            setFeedDraftValue(null);
            feedDraftAnimalIdRef.current = null;
            return;
        }
        if (!animalDetail?.id || animalDetail.id !== selectedAnimalId) {
            return;
        }
        const actualLevel = animalDetail.feed?.level ?? 1;
        if (feedDraftAnimalIdRef.current !== animalDetail.id) {
            feedDraftAnimalIdRef.current = animalDetail.id;
            setFeedDraftValue(actualLevel);
            return;
        }
        setFeedDraftValue((prev) => {
            if (prev === null || Math.abs(prev - actualLevel) < FEED_EPSILON) {
                return actualLevel;
            }
            return prev;
        });
    }, [selectedAnimalId, animalDetail?.id, animalDetail?.feed?.level]);

    const handleFeedLevelChange = useCallback((value) => {
        if (!isEditing || !activeAnimal?.id) {
            return;
        }
        const nextValue = clampShare(value);
        feedDraftAnimalIdRef.current = activeAnimal.id;
        setFeedDraftValue(nextValue);
        if (isDevPreview) {
            setAnimalDetail(buildDevPreviewDetail(activeAnimal, nextValue));
            return;
        }
        sendData('query-zoo-animal-details', { id: activeAnimal.id, feedLevelOverride: nextValue });
    }, [isEditing, activeAnimal, isDevPreview, sendData]);

    const handleFeedSave = useCallback(() => {
        if (!isEditing || !activeAnimal?.id) {
            return;
        }
        const currentLevel = animalDetail?.feed?.level ?? 1;
        const valueToSave = clampShare(feedDraftValue ?? currentLevel);
        if (isDevPreview) {
            setAnimalDetail(buildDevPreviewDetail({ ...activeAnimal, feedLevel: valueToSave }, valueToSave));
            setFeedDraftValue(valueToSave);
            return;
        }
        sendData('save-zoo-feed-settings', { id: activeAnimal.id, feedLevel: valueToSave });
    }, [isEditing, activeAnimal, feedDraftValue, animalDetail, isDevPreview, sendData]);

    const handleFeedCancel = useCallback(() => {
        if (!isEditing) {
            return;
        }
        const resetValue = animalDetail?.feed?.level ?? 1;
        if (activeAnimal?.id) {
            feedDraftAnimalIdRef.current = activeAnimal.id;
        }
        setFeedDraftValue(resetValue);
        if (isDevPreview) {
            if (activeAnimal) {
                setAnimalDetail(buildDevPreviewDetail(activeAnimal));
            }
            return;
        }
        if (activeAnimal?.id) {
            sendData('query-zoo-animal-details', { id: activeAnimal.id });
        }
    }, [isEditing, animalDetail, activeAnimal, isDevPreview, sendData]);

    const handleCloseDetail = useCallback(() => {
        setSelectedAnimalId(null);
        setHoveredAnimalId(null);
        setDetailVisible(false);
    }, []);

    const detailAnimalData = useMemo(() => {
        if (animalDetail && (!activeAnimal || animalDetail.id === activeAnimal.id)) {
            return animalDetail;
        }
        return buildFallbackDetailFromSummary(activeAnimal);
    }, [animalDetail, activeAnimal]);

    const detailFeedLevel = detailAnimalData?.feed?.level ?? 1;
    const isFeedDirty = isEditing && typeof feedDraftValue === 'number' && Math.abs(feedDraftValue - detailFeedLevel) > FEED_EPSILON;

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
                                    {animals.map((animal) => (
                                        <ZooCard
                                            key={animal.id}
                                            animal={animal}
                                            totalSpace={space.total}
                                            showNumericInputs={showNumericInputs}
                                            onSetLimit={onSetLimit}
                                            onHover={handleHoverAnimal}
                                            onSelect={handleSelectAnimal}
                                            isMobile={isMobile}
                                            isSelected={selectedAnimalId === animal.id}
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
            {(!isMobile || isDetailVisible || selectedAnimalId) ? (
                <div className={'item-detail ingame-box detail-blade'}>
                    {detailAnimalData ? (
                        <ZooDetails
                            animal={detailAnimalData}
                            totalSpace={space.total}
                            onClose={handleCloseDetail}
                            isMobile={isMobile}
                            showNumericInputs={showNumericInputs}
                            isEditing={isEditing}
                            feedLevelDraft={feedDraftValue}
                            onFeedLevelChange={handleFeedLevelChange}
                            onSaveFeedLevel={handleFeedSave}
                            onCancelFeedLevel={handleFeedCancel}
                            isFeedDirty={isFeedDirty}
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
