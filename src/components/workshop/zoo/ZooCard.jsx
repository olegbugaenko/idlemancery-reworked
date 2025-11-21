import React, { useCallback, useEffect, useMemo, useState } from "react";
import { formatValue } from "../../../general/utils/strings";
import { TippyWrapper } from "../../shared/tippy-wrapper.jsx";
import { clampShare } from "./utils";

export const ZooCard = ({ animal, totalSpace, showNumericInputs, onSetLimit, onToggleLimitLock, onHover, onSelect, isMobile, isSelected }) => {
    const spaceShare = totalSpace > 0 ? (animal.count / totalSpace) : 0;
    const limitValue = animal.isLimited ? (animal.limitPercent ?? 0) : 1;
    const [inputValue, setInputValue] = useState(limitValue.toString());

    useEffect(() => {
        setInputValue(limitValue.toString());
    }, [limitValue]);

    const applyValue = useCallback((value) => {
        if (typeof value !== 'number' || isNaN(value)) {
            setInputValue(limitValue.toString());
            return;
        }
        const normalized = clampShare(value);
        const rounded = Math.round(normalized * 1_000_000) / 1_000_000;
        setInputValue(rounded.toString());
        onSetLimit(animal.id, rounded, {
            onCancel: () => setInputValue(limitValue.toString()),
        });
    }, [animal.id, limitValue, onSetLimit]);

    const handleInputEvent = useCallback((event) => {
        setInputValue(event.target.value);
    }, []);

    const handleBlur = useCallback(() => {
        applyValue(parseFloat(inputValue));
    }, [applyValue, inputValue]);

    const handleKeyDown = useCallback((event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            applyValue(parseFloat(inputValue));
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            setInputValue(limitValue.toString());
        }
    }, [applyValue, inputValue, limitValue]);

    const sliderValue = useMemo(() => {
        const parsed = parseFloat(inputValue);
        return Number.isFinite(parsed) ? parsed : limitValue;
    }, [inputValue, limitValue]);

    const handleSliderChange = useCallback((event) => {
        applyValue(parseFloat(event.target.value));
    }, [applyValue]);

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
                    <img src={`icons/zoo/${animal.icon}.png`} className={'resource big'} alt={animal.name}/>
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
                                applyValue(0);
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
                                onBlur={handleBlur}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                    e.stopPropagation();
                                    handleKeyDown(e);
                                }}
                            />
                        ) : (
                            <input
                                type={'range'}
                                className={'level-set'}
                                min={0}
                                max={1}
                                step={0.000001}
                                value={sliderValue}
                                onChange={handleSliderChange}
                            />
                        )}
                        <div
                            className={'icon-content maximize-icon interface-icon tiny'}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                applyValue(1);
                            }}
                        >
                            <img src={'icons/interface/maximize.png'} alt={'Maximize'}/>
                        </div>
                        <TippyWrapper content={<div className={'hint-popup'}>
                            <p className={'hint'}>Lock this animal limit to keep it unchanged when other limits are normalized.</p>
                        </div>}>
                            <div
                                className={`icon-content interface-icon tiny ${animal.isLimitLocked ? 'locked' : 'unlocked'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onToggleLimitLock?.(animal.id, !animal.isLimitLocked);
                                }}
                            >
                                <img src={animal.isLimitLocked ? 'icons/interface/lock.png' : 'icons/interface/unlock.png'} alt={animal.isLimitLocked ? 'Locked' : 'Unlocked'} />
                            </div>
                        </TippyWrapper>
                    </div>
                </div>
            </div>
        </div>
    );
};

