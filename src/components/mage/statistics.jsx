import React, {useContext, useEffect, useState} from "react";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {Cell, Pie, PieChart, ResponsiveContainer} from "recharts";
import {Tooltip} from "react-tippy";

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

    const [stats, setStats] = useState([]);

    useEffect(() => {
        sendData('query-statistics', {});
    }, []);

    onMessage('statistics', (stats) => {
        setStats(stats);
    })

    return (<div className={'statistics'}>
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
                {/*{stats.actionXP ? (<div className={'flex-row stats'}>
                    <p className={'stat-title'}>Actions XP Earned:</p>
                    <p className={'stat-value'}><MyPieChart
                        key={'xp-earned'}
                        data={stats.actionXP}
                        fmt={(entry) => `${entry.name}: ${formatValue(entry.value)}`}
                    /></p>
                </div>) : null}*/}
            </div>
        </PerfectScrollbar>
    </div> )

}