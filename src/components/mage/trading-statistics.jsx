import React, { useState, useEffect, useContext } from 'react';
import WorkerContext from '../../context/worker-context';
import { useWorkerClient } from '../../general/client';
import { formatValue } from '../../general/utils/strings';
import { RawResource } from '../shared/raw-resource.jsx';

const TradingStatistics = () => {
    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);
    const [tradingStats, setTradingStats] = useState(null);

    useEffect(() => {
        const fetchData = () => {
            sendData('query-trading-statistics', {});
        };

        fetchData();
        
        const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [sendData]);

    onMessage('trading-statistics', (data) => {
        setTradingStats(data);
    });

    if (!tradingStats) {
        return <div className="loading">Loading trading statistics...</div>;
    }

    const { bought, sold, totalBoughtValue, totalSoldValue } = tradingStats;

    return (
        <div className="trading-statistics">
            <h3>Trading Statistics</h3>
            
            <div className="summary-stats">
                <div className="stat-card">
                    <h4>Total Spent</h4>
                    <div className="stat-value">{formatValue(totalBoughtValue)} coins</div>
                </div>
                <div className="stat-card">
                    <h4>Total Earned</h4>
                    <div className="stat-value">{formatValue(totalSoldValue)} coins</div>
                </div>
                <div className="stat-card">
                    <h4>Net Profit</h4>
                    <div className={`stat-value ${totalSoldValue - totalBoughtValue >= 0 ? 'positive' : 'negative'}`}>
                        {formatValue(totalSoldValue - totalBoughtValue)} coins
                    </div>
                </div>
            </div>

            <div className="trading-sections">
                <div className="trading-section">
                    <h4>Bought Resources</h4>
                    {bought.length > 0 ? (
                        <div className="resource-list">
                            {bought.map((item, index) => (
                                <div key={index} className="resource-item compact">
                                    <div className="resource-icon">
                                        <RawResource id={item.id} name={item.name} />
                                    </div>
                                    <div className="resource-info">
                                        <span className="resource-name">({formatValue(item.amount)})</span>
                                        <span className="resource-total negative">- {formatValue(item.totalCost)} coins</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-data">No resources bought yet.</p>
                    )}
                </div>

                <div className="trading-section">
                    <h4>Sold Resources</h4>
                    {sold.length > 0 ? (
                        <div className="resource-list">
                            {sold.map((item, index) => (
                                <div key={index} className="resource-item compact">
                                    <div className="resource-icon">
                                        <RawResource id={item.id} name={item.name} />
                                    </div>
                                    <div className="resource-info">
                                        <span className="resource-name">{item.name} ({formatValue(item.amount)})</span>
                                        <span className="resource-total">+ {formatValue(item.totalEarnings)} coins</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-data">No resources sold yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TradingStatistics; 