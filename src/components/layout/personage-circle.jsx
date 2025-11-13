import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from "react";
import WorkerContext from "../../context/worker-context";
import { useWorkerClient } from "../../general/client";
import { useAppContext } from "../../context/ui-context";
import { TippyWrapper } from "../shared/tippy-wrapper.jsx";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";

const PREVIEW_ACTIONS = 5;

const areMageSnapshotsEqual = (prev = {}, next = {}) => {
    if (prev === next) return true;
    const keysToCompare = ['mageLevel', 'mageXP', 'mageMaxXP', 'xpTotalIncome', 'eta', 'skillPoints'];
    for (const key of keysToCompare) {
        if (!Object.is(prev?.[key], next?.[key])) {
            return false;
        }
    }

    return areBalancePreviewsEqual(prev?.xpBalance, next?.xpBalance);
};

const areBalancePreviewsEqual = (prevBalance, nextBalance) => {
    const prevActions = prevBalance?.actions || [];
    const nextActions = nextBalance?.actions || [];

    if (prevActions.length !== nextActions.length) return false;

    const previewLength = Math.min(PREVIEW_ACTIONS, nextActions.length, prevActions.length);
    for (let index = 0; index < previewLength; index += 1) {
        const prevAction = prevActions[index];
        const nextAction = nextActions[index];
        if (!prevAction && !nextAction) continue;
        if (!prevAction || !nextAction) return false;
        if (prevAction.name !== nextAction.name) return false;
        if (!Object.is(prevAction.dxp, nextAction.dxp)) return false;
    }

    return true;
};

export const PersonageCircle = () => {
    const worker = useContext(WorkerContext);
    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const { togglePopup } = useAppContext();
    const [mageData, setMageData] = useState(null);
    const [notation, setNotation] = useState(null);
    const elementRef = useRef(null);
    const mageDataRef = useRef(null);
    const notationRef = useRef(null);

    useEffect(() => {
        sendData('query-mage-data', { prefix: 'xpbar' });

        const interval = setInterval(() => {
            sendData('query-mage-data', { prefix: 'xpbar' });
        }, 200);

        return () => {
            clearInterval(interval);
        }
    }, [sendData]);

    useEffect(() => {
        if (notation !== undefined && notation !== null) {
            window.notation = notation;
        }
    }, [notation]);

    useEffect(() => {
        const handleMageData = (data) => {
            const {settings: settingsData, ...mage} = data;

            if (settingsData?.notation !== notationRef.current) {
                notationRef.current = settingsData?.notation;
                setNotation(settingsData?.notation ?? null);
            }

            if (!areMageSnapshotsEqual(mageDataRef.current, mage)) {
                mageDataRef.current = mage;
                setMageData(mage);
            }
        };

        onMessage('mage-data-xpbar', handleMageData);

        return () => {
            removeMessage('mage-data-xpbar');
        };
    }, [onMessage, removeMessage]);

    const handleSkillsClick = useCallback(() => {
        togglePopup('skills');
    }, [togglePopup]);

    const xpCircleStyle = useMemo(() => {
        if (!mageData) {
            return { '--angle': 0 };
        }
        const xp = mageData.mageXP ?? 0;
        const max = mageData.mageMaxXP ?? 0;
        const angle = (xp / (max + 1.e-8)) * 360;
        return { '--angle': `${angle}` };
    }, [mageData?.mageXP, mageData?.mageMaxXP]);

    const balancePreview = useMemo(() => {
        const actions = mageData?.xpBalance?.actions || [];
        const preview = actions.slice(0, PREVIEW_ACTIONS);
        const remaining = Math.max(actions.length - PREVIEW_ACTIONS, 0);
        return { preview, remaining };
    }, [mageData?.xpBalance]);

    const tooltipContent = useMemo(() => {
        if (!mageData) return null;

        return (
            <div className={'hint-popup'}>
                <p>Level: {formatInt(mageData.mageLevel)}</p>
                <p>XP: {formatInt(mageData.mageXP)} / {formatInt(mageData.mageMaxXP)}</p>
                <p>XP/sec: {formatValue(mageData.xpTotalIncome)}</p>
                <p>Next level in: {secondsToString(mageData.eta)}</p>
                {mageData?.xpBalance ? (
                    <div className={'balances block'}>
                        {balancePreview.preview.map((balance, index) => (
                            <p key={`${balance?.name}-${index}`} className={'small-hint'}>
                                Running action - {balance?.name}: {formatValue(balance?.dxp)}
                            </p>
                        ))}
                        {balancePreview.remaining ? (
                            <p className={'small-hint'}>And {formatInt(balancePreview.remaining)} more</p>
                        ) : null}
                    </div>
                ) : null}
            </div>
        );
    }, [mageData, balancePreview]);

    return mageData ? (
        <div className={'mage-wrap flex-container'} ref={elementRef}>
            <TippyWrapper placement={"top"} content={tooltipContent}>
                <div className={'outer-xp-circle'}>
                    <div
                        className={'inner-xp-circle'}
                        style={xpCircleStyle}
                    >
                        <div className={'holder-circle'}>
                            <div className={'level'} id={'level'}>
                                <span className={`skills-button ${mageData.skillPoints > 0 ? 'highlight' : ''}`} onClick={handleSkillsClick}>
                                    <img src={'icons/ui/sp.png'} />
                                    <span>{mageData.skillPoints}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={'level-circle'}>
                        {formatInt(mageData.mageLevel)}
                    </div>
                </div>
            </TippyWrapper>
        </div>
    ) : null;
};
