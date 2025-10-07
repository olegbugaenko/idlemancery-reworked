import React, {useContext, useEffect, useState, useMemo} from "react";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {Cell, Pie, PieChart, ResponsiveContainer} from "recharts";
import {Tooltip} from "react-tippy";
import TradingStatistics from "./trading-statistics.jsx";
import EconomicMetrics from "./economic-metrics.jsx";
import {SearchField} from "../shared/search-field.jsx";
import {EffectsSection} from "../shared/effects-section.jsx";

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

export const Statistics = () => {

    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);

    const [stats, setStats] = useState({});
    const [activeTab, setActiveTab] = useState('general');
    const [multipliersFilter, setMultipliersFilter] = useState({ search: '' });

    const filteredMultipliers = useMemo(() => {
        const source = stats.multipliers || [];
        const searchValue = (multipliersFilter?.search || '').trim().toLowerCase();

        if (!searchValue) {
            return source;
        }

        return source.filter(({ name, id }) => {
            const title = (name || id || '').toLowerCase();
            return title.includes(searchValue);
        });
    }, [stats.multipliers, multipliersFilter]);

    const multipliersMap = useMemo(() => {
        return Object.fromEntries((filteredMultipliers || []).map(effect => {
            const key = effect.id || effect.key || effect.name;
            return [key, effect];
        }));
    }, [filteredMultipliers]);

    useEffect(() => {
        sendData('query-statistics', {});
    }, []);

    onMessage('statistics', (stats) => {
        setStats(stats);
    })

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
                        <div className={'search-rel-wrap'}>
                            <SearchField
                                value={multipliersFilter}
                                onSetValue={setMultipliersFilter}
                                scopes={[]}
                                placeholder={'Search multipliers...'}
                            />
                        </div>
                        <div className = {'height-minus-row'}>
                            <PerfectScrollbar>
                                <div className={'multipliers-list'}>
                                    <EffectsSection
                                        effects={multipliersMap}
                                        maxDisplay={stats.multipliers?.length ?? 0}
                                        isShowBalance={false}
                                    />
                                </div>
                            </PerfectScrollbar>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}