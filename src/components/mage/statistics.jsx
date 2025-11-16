import React, {useContext, useEffect, useState, useMemo, useCallback, useRef} from "react";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {Cell, Pie, PieChart, ResponsiveContainer} from "recharts";
import {Tooltip} from "react-tippy";
import TradingStatistics from "./trading-statistics.jsx";
import EconomicMetrics from "./economic-metrics.jsx";
import {SearchField} from "../shared/search-field.jsx";
import {ResourceRow} from "../layout/sidebar.jsx";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {useCtrlPressed} from "../../general/hooks/use-ctrl-pressed";

const COLORS = ['#6088FE', '#00C49F', '#FFBB28', '#FF8042',
                '#1019FE', '#30309F', '#AD09AD', '#FE66FE',
                '#30F9FE', '#F0306F', '#FFFE33', '#99FE99'];

const MyPieChart = ({ data, key, fmt }) => (
    <ResponsiveContainer width="95%" height={300}>
        <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={75}
                fill="#8884d8"
                dataKey="value"
                label={fmt}
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${key}-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip
                formatter={(value, name) => [`${value}`, `${name}`]}
            />
        </PieChart>
    </ResponsiveContainer>
);

const MultiplierRow = ({ multiplier, onToggleHidden }) => {

    const renderInfo = () => {
        const scopeLabel = multiplier.scope && multiplier.scope !== 'multiplier' ? multiplier.scope : null;

        return (
            <div className={'multiplier-info'}>
                <span className={'multiplier-name'}>{multiplier.name || multiplier.id}</span>
                {scopeLabel ? (<span className={'multiplier-scope'}>{scopeLabel}</span>) : null}
            </div>
        );
    };

    const handleToggleHidden = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if(onToggleHidden) {
            onToggleHidden(multiplier);
        }
    };

    const infoContent = multiplier.description ? (
        <TippyWrapper content={<div className={'hint-popup'}>{multiplier.description}</div> }>
            {renderInfo()}
        </TippyWrapper>
    ) : renderInfo();

    return (
        <div className={`multiplier-row ${multiplier.isHidden ? 'is-hidden' : ''}`}>
            {infoContent}
            <div className={'multiplier-actions'}>
                <span className={'multiplier-value'}>x{formatValue(multiplier.value, 3)}</span>
                {onToggleHidden ? (
                    <TippyWrapper content={<div className={'hint-popup'}>{multiplier.isHidden ? 'Show Multiplier' : 'Hide Multiplier'}</div> }>
                        <div className={'icon-content interface-icon medium-sm toggle-hidden'} onClick={handleToggleHidden}>
                            {multiplier.isHidden ? (<img src={"icons/interface/icon_show.png"} alt={'Show multiplier'}/>) : (<img src={"icons/interface/icon_hide.png"} alt={'Hide multiplier'}/>)}
                        </div>
                    </TippyWrapper>
                ) : null}
            </div>
        </div>
    );
};

export const Statistics = () => {

    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);
    const sendDataRef = useRef(sendData);

    const [stats, setStats] = useState({ multipliers: [], resources: [] });
    const [preferences, setPreferences] = useState({ multipliersShowHidden: false, resourcesShowHidden: false });
    const [activeTab, setActiveTab] = useState('general');
    const [multipliersFilter, setMultipliersFilter] = useState({ search: '' });
    const [resourcesFilter, setResourcesFilter] = useState({ search: '' });
    const isCtrlPressed = useCtrlPressed();

    const filteredMultipliers = useMemo(() => {
        const source = stats.multipliers || [];
        const searchValue = (multipliersFilter?.search || '').trim().toLowerCase();
        const showHidden = preferences.multipliersShowHidden;

        return source.filter(({ name, id, isHidden }) => {
            if(!showHidden && isHidden) {
                return false;
            }

            if(!searchValue) {
                return true;
            }

            const title = (name || id || '').toLowerCase();
            return title.includes(searchValue);
        });
    }, [stats.multipliers, multipliersFilter, preferences.multipliersShowHidden]);

    useEffect(() => {
        sendData('query-statistics', {});
    }, [sendData]);

    useEffect(() => {
        if(activeTab !== 'multipliers' && activeTab !== 'resources') {
            return;
        }

        const fetchStats = () => {
            sendData('query-statistics', {});
        };

        fetchStats();

        const interval = setInterval(fetchStats, 2000);
        return () => clearInterval(interval);
    }, [activeTab, sendData]);

    onMessage('statistics', (statsPayload) => {
        if(!statsPayload) {
            return;
        }

        const { preferences: incomingPreferences, ...rest } = statsPayload;

        setStats({
            ...rest,
            multipliers: rest.multipliers || [],
            resources: rest.resources || [],
        });

        if(incomingPreferences) {
            setPreferences(prev => ({
                multipliersShowHidden: incomingPreferences.multipliersShowHidden ?? prev.multipliersShowHidden,
                resourcesShowHidden: incomingPreferences.resourcesShowHidden ?? prev.resourcesShowHidden,
            }));
        }
    })

    const filteredResources = useMemo(() => {
        const searchValue = (resourcesFilter?.search || '').trim().toLowerCase();
        const showHidden = preferences.resourcesShowHidden;
        const source = stats.resources || [];

        return source.filter(resource => {
            if(!showHidden && resource?.isHidden) {
                return false;
            }

            if(!searchValue) {
                return true;
            }

            const title = (resource?.name || resource?.id || '').toLowerCase();
            return title.includes(searchValue);
        });
    }, [stats.resources, resourcesFilter, preferences.resourcesShowHidden]);

    useEffect(() => {
        sendDataRef.current = sendData;
    }, [sendData]);

    const handleToggleMultiplierHidden = useCallback((multiplier) => {
        if(!multiplier?.id) {
            return;
        }

        const fn = sendDataRef.current;
        if(!fn) { return; }

        fn('toggle-statistics-hidden', { scope: 'multipliers', id: multiplier.id });
    }, []);

    const handleToggleResourceHidden = useCallback((resource) => {
        if(!resource?.id) {
            return;
        }

        const fn = sendDataRef.current;
        if(!fn) { return; }

        fn('toggle-statistics-hidden', { scope: 'resources', id: resource.id });
    }, []);

    const handleMultipliersShowHiddenChange = useCallback(() => {
        const next = !preferences.multipliersShowHidden;
        setPreferences(prev => ({ ...prev, multipliersShowHidden: next }));
        sendData('set-statistics-show-hidden', { scope: 'multipliers', flag: next });
    }, [preferences.multipliersShowHidden, sendData]);

    const handleResourcesShowHiddenChange = useCallback(() => {
        const next = !preferences.resourcesShowHidden;
        setPreferences(prev => ({ ...prev, resourcesShowHidden: next }));
        sendData('set-statistics-show-hidden', { scope: 'resources', flag: next });
    }, [preferences.resourcesShowHidden, sendData]);

    return (
        <div className={'statistics'}>
            <div className="statistics-header">
                <h2>Statistics</h2>
                <div className="tab-navigation">
                    <button 
                        className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        General Stats
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'trading' ? 'active' : ''}`}
                        onClick={() => setActiveTab('trading')}
                    >
                        Trading History
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'economic' ? 'active' : ''}`}
                        onClick={() => setActiveTab('economic')}
                    >
                        Development Metrics
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'multipliers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('multipliers')}
                    >
                        Multipliers
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
                        onClick={() => setActiveTab('resources')}
                    >
                        Resources
                    </button>
                </div>
            </div>

            <div className="statistics-content">
                {activeTab === 'general' && (
                    <PerfectScrollbar>
                        <div className={'stats-inner'}>
                            <div className={'flex-row stats'}>
                                <p className={'stat-title'}>Total time played:</p>
                                <p className={'stat-value'}>{secondsToString(stats.totalTimePlayed)}</p>
                            </div>
                            <div className={'flex-row stats'}>
                                <p className={'stat-title'}>Mage Level:</p>
                                <p className={'stat-value'}>{formatInt(stats.mageLevel)}</p>
                            </div>
                            <div className={'flex-row stats'}>
                                <p className={'stat-title'}>All Time XP Earned:</p>
                                <p className={'stat-value'}>{formatInt(stats.xpEarned)}</p>
                            </div>
                            <div className={'flex-row stats'}>
                                <p className={'stat-title'}>All Time Coins Earned:</p>
                                <p className={'stat-value'}>{formatInt(stats.coinsEarned)}</p>
                            </div>
                            <div className={'flex-row stats'}>
                                <p className={'stat-title'}>All Time Coins Spent:</p>
                                <p className={'stat-value'}>{formatInt(stats.coinsSpent)}</p>
                            </div>
                            <div className={'flex-row stats'}>
                                <p className={'stat-title'}>Actions Unlocked:</p>
                                <p className={'stat-value'}>{formatInt(stats.actionsUnlocked)}</p>
                            </div>
                            {stats.actionTimes ? (<div className={'flex-row stats'}>
                                <p className={'stat-title'}>Actions Time Spent:</p>
                                <p className={'stat-value'}><MyPieChart
                                    key={'time-spent'}
                                    data={stats.actionTimes}
                                    fmt={(entry) => `${entry.name}: ${secondsToString(entry.value)}`}
                                /></p>
                            </div>) : null}
                        </div>
                    </PerfectScrollbar>
                )}
                {activeTab === 'trading' && <TradingStatistics />}
                {activeTab === 'economic' && <EconomicMetrics />}
                {activeTab === 'multipliers' && (
                    <div className={'multipliers-tab'}>
                        <div className={'search-and-toggle'}>
                            <div className={'search-rel-wrap'}>
                                <SearchField
                                    value={multipliersFilter}
                                    onSetValue={setMultipliersFilter}
                                    scopes={[]}
                                    placeholder={'Search multipliers...'}
                                />
                            </div>
                            <label className={'show-hidden-toggle'}>
                                <input
                                    type={'checkbox'}
                                    checked={preferences.multipliersShowHidden}
                                    onChange={handleMultipliersShowHiddenChange}
                                />
                                Show Hidden
                            </label>
                        </div>
                        <div className={'height-minus-row'}>
                            <PerfectScrollbar>
                                <div className={'multipliers-list'}>
                                    {filteredMultipliers.length ? filteredMultipliers.map(multiplier => (
                                        <MultiplierRow
                                            key={multiplier.id || multiplier.key || multiplier.name}
                                            multiplier={multiplier}
                                            onToggleHidden={handleToggleMultiplierHidden}
                                        />
                                    )) : (<div className={'no-data'}>No multipliers to display.</div>)}
                                </div>
                            </PerfectScrollbar>
                        </div>
                    </div>
                )}
                {activeTab === 'resources' && (
                    <div className={'resources-tab'}>
                        <div className={'search-and-toggle'}>
                            <div className={'search-rel-wrap'}>
                                <SearchField
                                    value={resourcesFilter}
                                    onSetValue={setResourcesFilter}
                                    scopes={[]}
                                    placeholder={'Search resources...'}
                                />
                            </div>
                            <label className={'show-hidden-toggle'}>
                                <input
                                    type={'checkbox'}
                                    checked={preferences.resourcesShowHidden}
                                    onChange={handleResourcesShowHiddenChange}
                                />
                                Show Hidden
                            </label>
                        </div>
                        <div className={'height-minus-row'}>
                            <PerfectScrollbar>
                                <div className={'resources'}>
                                    {filteredResources.length ? filteredResources.map(resource => (
                                        <ResourceRow
                                            key={resource.id}
                                            resource={resource}
                                            onToggleHidden={handleToggleResourceHidden}
                                            isCtrlPressed={isCtrlPressed}
                                        />
                                    )) : (<div className={'no-data'}>No resources to display.</div>)}
                                </div>
                            </PerfectScrollbar>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
