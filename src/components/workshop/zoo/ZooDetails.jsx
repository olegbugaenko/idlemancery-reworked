import React from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import { formatValue } from "../../../general/utils/strings";
import { EffectsSection } from "../../shared/effects-section.jsx";
import RulesList from "../../shared/rules-list.jsx";
import { clampShare, FEED_EPSILON } from "./utils";

export const ZooDetails = ({
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
    automationUnlocked,
    onToggleAutofeed,
    addAutofeedRule,
    deleteAutofeedRule,
    setAutofeedRuleValue,
    setAutofeedPattern,
    resources,
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
        <>
        <div className={'blade-outer'}>
            <PerfectScrollbar>
                <div className={'blade-inner zoo-details'}>
                    <div className={'block'}>
                        <h4>{animal.name}(x{formatValue(animal.count)})</h4>
                        <p className={'hint separated'}>{animal.description}</p>
                    </div>
                    <div className={'block'}>
                        <p>Population</p>
                        <div className={'zoo-detail-stats'}>
                            <div className={'flex-row flex-container'}>
                                <span>Limit</span>
                                <strong>{animal.isLimited ? `${formatValue((animal.limitPercent ?? 0) * 100)}% (~${formatValue(animal.limitValue ?? 0)} space)` : 'Unlimited'}</strong>
                            </div>
                        </div>
                        <div className={'block'}>
                            <p>Effects</p>
                            <EffectsSection effects={animal.effects} maxDisplay={10} />
                        </div>
                    </div>

                    <div className={'block zoo-feed-block'}>
                        <p>Feeding</p>
                        <div className={'zoo-feed-summary'}>
                            <p className={'flex-row flex-container'}>
                                <span>Breeding</span>
                                <span>{formatValue(showPreview ? previewEffectiveMultiplier * 100 : displayedFeedLevel * 100)}%</span>
                            </p>
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
                                </div>
                            ) : null}
                        </div>

                        {feedInfo.missingResource ? (
                            <p className={'hint warning yellow'}>
                                Breeding is slowed to {formatValue(feedInfo.efficiency ?? 0, 2)}% due to a lack of {feedInfo.missingResource.name ?? feedInfo.missingResource.id}.
                            </p>
                        ) : null}
                    </div>

                    <div className={'block zoo-feed-requirements'}>
                        <p>Breeding Output</p>
                        <EffectsSection effects={feedInfo.feedEffects} maxDisplay={10} />
                        <p className={'zoo-breeding-row flex-row flex-container'}>
                            <span>Breeding Rate</span>
                            <span>{formatValue(showPreview ? breedingInfo.previewRate ?? 0 : breedingInfo.currentRate ?? 0, 4)} / s</span>
                        </p>
                    </div>

                    {automationUnlocked ? (<div className={'autoconsume-setting'}>
                        <div className={'rules-header flex-container'}>
                            <p>Autofeed rules: </p>
                            <label>
                                <input type={'checkbox'} checked={animal.autofeed?.isEnabled ?? undefined} onChange={onToggleAutofeed}/>
                                {animal.autofeed?.isEnabled ? ' ON' : ' OFF'}
                            </label>
                            {isEditing ? (<button onClick={addAutofeedRule}>Add rule (AND)</button>) : null}
                        </div>
                        <RulesList
                            key={`${animal.id}-${isEditing}-${animal.autofeed?.rules?.length || 0}`}
                            isEditing={isEditing}
                            rules={animal.autofeed?.rules || []}
                            resources={resources}
                            pattern={animal.autofeed?.pattern}
                            deleteRule={deleteAutofeedRule}
                            setRuleValue={setAutofeedRuleValue}
                            setPattern={setAutofeedPattern}
                            isAutoCheck={animal.autofeed?.isEnabled}
                        />

                    </div>) : null}

                </div>
            </PerfectScrollbar>
        </div>
        {isEditing || isMobile ? (<div className={'buttons zoo-feed-actions'}>
            <button className={'warning-action'} onClick={onCancelFeedLevel}>Cancel</button>
            <button className={'primary-action'} disabled={!isFeedDirty} onClick={onSaveFeedLevel}>Save</button>
        </div>) : null}
        </>
    );
};

