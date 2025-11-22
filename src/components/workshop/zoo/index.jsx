import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import WorkerContext from "../../../context/worker-context";
import {useWorkerClient} from "../../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {formatValue} from "../../../general/utils/strings";
import {TippyWrapper} from "../../shared/tippy-wrapper.jsx";
import {useAppContext} from "../../../context/ui-context";
import {RawResource} from "../../shared/raw-resource.jsx";
import {cloneDeep, isEqual} from "lodash";
import { ZooCard } from "./ZooCard.jsx";
import { ZooDetails } from "./ZooDetails.jsx";
import { ZooOverview } from "./ZooOverview.jsx";
import { buildDevPreviewDetail, buildFallbackDetailFromSummary, clampShare, FEED_EPSILON } from "./utils";
import { defaultZooData, devPreviewZooData } from "./constants";

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
    const [resources, setResources] = useState([]);
    const resourcesRef = useRef([]);
    const [autofeedDraft, setAutofeedDraft] = useState({ isEnabled: false, rules: [], pattern: '' });
    const initialAutofeedRef = useRef({ isEnabled: false, rules: [], pattern: '' });

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
        sendData('query-all-resources', { prefix: 'zoo'});
        const interval2 = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'zoo', scope: 'zoo' })
        }, 1000)
        return () => {
            clearInterval(interval);
            clearInterval(interval2);
        };
    }, [isDevPreview, sendData]);

    useEffect(() => {
        if (isDevPreview) {
            return () => {};
        }
        onMessage('zoo-data', (payload) => {
            setZooData(payload || defaultZooData);
        });
        onMessage('all-resources-zoo', (payload) => {
            setResources(payload || []);
        });
        return () => {
            removeMessage('zoo-data');
            removeMessage('all-resources-zoo');
        };
    }, [isDevPreview, onMessage, removeMessage]);

    useEffect(() => {
        resourcesRef.current = resources;
    }, [resources]);

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

    const space = zooData.space || defaultZooData.space;
    const animals = zooData.animals || defaultZooData.animals;
    const automationUnlocked = zooData.automationUnlocked || defaultZooData.automationUnlocked;

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
        }
    }, [selectedAnimalId, animals]);

    useEffect(() => {
        setSelectedAnimalId((prev) => {
            if (prev) {
                const animalExists = animals.some((animal) => animal.id === prev);
                if (!animalExists) {
                    return null;
                }
                const activeAnimal = animals.find((animal) => animal.id === prev);
                if (feedDraftAnimalIdRef.current !== activeAnimal.id) {
                    setFeedDraftValue(null);
                    setAutofeedDraft(cloneDeep(activeAnimal.autofeed || { isEnabled: false, rules: [], pattern: '' }));
                    initialAutofeedRef.current = cloneDeep(activeAnimal.autofeed || { isEnabled: false, rules: [], pattern: '' });
                }
            }
            return prev;
        });
    }, [animals]);

    useEffect(() => {
        setHoveredAnimalId((prev) => {
            if (!prev) {
                return null;
            }
            const animalExists = animals.some((animal) => animal.id === prev);
            if (!animalExists) {
                return null;
            }
            return prev;
        });
    }, [animals]);

    const activeAnimal = useMemo(() => {
        if (selectedAnimalId) {
            return animals.find((animal) => animal.id === selectedAnimalId);
        }
        if (hoveredAnimalId) {
            return animals.find((animal) => animal.id === hoveredAnimalId);
        }
        return null;
    }, [animals, hoveredAnimalId, selectedAnimalId]);

    useEffect(() => {
        if (feedDraftAnimalIdRef.current !== activeAnimal?.id) {
            setFeedDraftValue(null);
        }
        feedDraftAnimalIdRef.current = activeAnimal?.id ?? null;
    }, [activeAnimal]);

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

    useEffect(() => {
        const autofeed = animalDetail?.autofeed || { isEnabled: false, rules: [], pattern: '' };
        initialAutofeedRef.current = cloneDeep(autofeed);
        setAutofeedDraft(cloneDeep(autofeed));
    }, [animalDetail?.id]);

    const handleFeedLevelChange = useCallback((value) => {
        setFeedDraftValue(clampShare(value));
    }, []);

    const handleFeedSave = useCallback(() => {
        if (!isEditing || !activeAnimal?.id) {
            return;
        }
        const currentLevel = animalDetail?.feed?.level ?? 1;
        const valueToSave = clampShare(feedDraftValue ?? currentLevel);
        const normalizedAutofeed = cloneDeep(autofeedDraft || { isEnabled: false, rules: [], pattern: '' });
        if (isDevPreview) {
            setAnimalDetail(buildDevPreviewDetail({ ...activeAnimal, feedLevel: valueToSave }, valueToSave));
            setFeedDraftValue(valueToSave);
            initialAutofeedRef.current = normalizedAutofeed;
            setAutofeedDraft(normalizedAutofeed);
            return;
        }
        sendData('save-zoo-feed-settings', {
            id: activeAnimal.id,
            feedLevel: valueToSave,
            autofeed: normalizedAutofeed,
        });
        initialAutofeedRef.current = normalizedAutofeed;
        setAutofeedDraft(normalizedAutofeed);
    }, [isEditing, activeAnimal, feedDraftValue, animalDetail, isDevPreview, sendData, autofeedDraft]);

    const handleFeedCancel = useCallback(() => {
        if (!isEditing) {
            return;
        }
        const resetValue = animalDetail?.feed?.level ?? activeAnimal?.feedLevel ?? 1;
        feedDraftAnimalIdRef.current = null;
        setFeedDraftValue(null);
        setAutofeedDraft(cloneDeep(initialAutofeedRef.current || { isEnabled: false, rules: [], pattern: '' }));
        if (isDevPreview) {
            if (activeAnimal) {
                setAnimalDetail(buildDevPreviewDetail(activeAnimal));
            }
            return;
        }
        if (activeAnimal) {
            setAnimalDetail(buildFallbackDetailFromSummary({ ...activeAnimal, feedLevel: resetValue }));
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

    const ensureAutofeedDraft = useCallback((data) => {
        const draft = data ? cloneDeep(data) : {};
        const rules = Array.isArray(draft.rules) ? draft.rules : [];
        return {
            isEnabled: !!draft.isEnabled,
            rules,
            pattern: typeof draft.pattern === 'string' ? draft.pattern : '',
        };
    }, []);

    const onToggleAutofeed = useCallback(() => {
        if (!isEditing) {
            return;
        }
        setAutofeedDraft((prev) => {
            const draft = ensureAutofeedDraft(prev);
            draft.isEnabled = !draft.isEnabled;
            return draft;
        });
    }, [ensureAutofeedDraft, isEditing]);

    const addAutofeedRule = useCallback(() => {
        if (!isEditing) {
            return;
        }
        setAutofeedDraft((prev) => {
            const draft = ensureAutofeedDraft(prev);
            if (!resourcesRef.current || !resourcesRef.current.length) {
                console.warn('No resources available for autofeed rule');
                return draft;
            }
            draft.rules.push({
                resource_id: resourcesRef.current?.[0]?.id,
                condition: 'less_or_eq',
                value_type: 'percentage',
                value: 50,
            });
            return draft;
        });
    }, [ensureAutofeedDraft, isEditing]);

    const deleteAutofeedRule = useCallback((index) => {
        if (!isEditing) {
            return;
        }
        setAutofeedDraft((prev) => {
            const draft = ensureAutofeedDraft(prev);
            draft.rules.splice(index, 1);
            return draft;
        });
    }, [ensureAutofeedDraft, isEditing]);

    const setAutofeedRuleValue = useCallback((index, key, value) => {
        if (!isEditing) {
            return;
        }
        setAutofeedDraft((prev) => {
            const draft = ensureAutofeedDraft(prev);
            if (!draft.rules[index]) {
                draft.rules[index] = {};
            }
            draft.rules[index] = {
                ...draft.rules[index],
                [key]: value,
            };
            return draft;
        });
    }, [ensureAutofeedDraft, isEditing]);

    const setAutofeedPattern = useCallback((pattern) => {
        if (!isEditing) {
            return;
        }
        setAutofeedDraft((prev) => {
            const draft = ensureAutofeedDraft(prev);
            draft.pattern = pattern;
            return draft;
        });
    }, [ensureAutofeedDraft, isEditing]);

    const isAutofeedDirty = useMemo(() => {
        return isEditing && !isEqual(ensureAutofeedDraft(autofeedDraft), ensureAutofeedDraft(initialAutofeedRef.current));
    }, [autofeedDraft, ensureAutofeedDraft, isEditing]);

    const isDirty = isFeedDirty || isAutofeedDirty;

    const displayedAnimalDetail = useMemo(() => {
        if (!detailAnimalData) {
            return null;
        }
        if (!isEditing) {
            return detailAnimalData;
        }
        return {
            ...detailAnimalData,
            autofeed: ensureAutofeedDraft(autofeedDraft ?? detailAnimalData.autofeed),
        };
    }, [autofeedDraft, detailAnimalData, ensureAutofeedDraft, isEditing]);

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
                                    <p>Switch between sliders and numeric inputs when adjusting zoo feeding.</p>
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
                    {displayedAnimalDetail ? (
                        <ZooDetails
                            animal={displayedAnimalDetail}
                            totalSpace={space.total}
                            onClose={handleCloseDetail}
                            isMobile={isMobile}
                            showNumericInputs={showNumericInputs}
                            isEditing={isEditing}
                            feedLevelDraft={feedDraftValue}
                            onFeedLevelChange={handleFeedLevelChange}
                            onSaveFeedLevel={handleFeedSave}
                            onCancelFeedLevel={handleFeedCancel}
                            isFeedDirty={isDirty}
                            automationUnlocked={automationUnlocked}
                            onToggleAutofeed={onToggleAutofeed}
                            addAutofeedRule={addAutofeedRule}
                            deleteAutofeedRule={deleteAutofeedRule}
                            setAutofeedRuleValue={setAutofeedRuleValue}
                            setAutofeedPattern={setAutofeedPattern}
                            resources={resources}
                        />
                    ) : (
                        <ZooOverview
                            space={space}
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
