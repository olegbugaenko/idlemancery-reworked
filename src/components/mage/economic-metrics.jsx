import React, { useState, useEffect, useContext } from 'react';
import WorkerContext from '../../context/worker-context';
import { useWorkerClient } from '../../general/client';
import { formatValue, secondsToString } from '../../general/utils/strings';

const EconomicMetrics = () => {
    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);
    const [metrics, setMetrics] = useState(null);
    const [selectedInterval, setSelectedInterval] = useState('24h'); // Default to 24h

    useEffect(() => {
        const fetchData = () => {
            sendData('query-economic-metrics', {});
        };

        fetchData();
        
        const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [sendData]);

    onMessage('economic-metrics', (data) => {
        setMetrics(data);
    });

    if (!metrics) {
        return <div className="loading">Loading economic metrics...</div>;
    }

    const { coins, learningRate, currentCoins, currentLearningRate } = metrics;

    // Calculate interval in seconds
    const getIntervalSeconds = (interval) => {
        switch (interval) {
            case '24h': return 24 * 60 * 60;
            case '48h': return 48 * 60 * 60;
            case '72h': return 72 * 60 * 60;
            case '1week': return 7 * 24 * 60 * 60;
            default: return 24 * 60 * 60;
        }
    };

    // Filter data based on selected interval
    const filterDataByInterval = (data, interval) => {
        if (!data || data.length === 0) return [];
        
        const intervalSeconds = getIntervalSeconds(interval);
        const currentTime = Math.max(...data.map(d => d.timestamp));
        const cutoffTime = currentTime - intervalSeconds;
        
        return data.filter(point => point.timestamp >= cutoffTime);
    };

    const formatTime = (timestamp) => {
        return `${secondsToString(timestamp)} of game`;
    };

    const renderChart = (data, title, currentValue, color) => {
        const filteredData = filterDataByInterval(data, selectedInterval);
        
        if (!filteredData || filteredData.length === 0) {
            return <p className="no-data">No data available for the selected interval.</p>;
        }

        const maxValue = Math.max(...filteredData.map(d => d.value), currentValue);
        const minValue = Math.min(...filteredData.map(d => d.value), currentValue);
        const range = maxValue - minValue;

        return (
            <div className="chart-container">
                <h4>{title}</h4>
                <div className="current-value">
                    Current: {formatValue(currentValue)}
                </div>
                <div className="chart">
                    {filteredData.map((point, index) => {
                        const height = range > 0 ? ((point.value - minValue) / range) * 100 : 50;
                        return (
                            <div
                                key={index}
                                className="chart-bar"
                                style={{
                                    height: `${height}%`,
                                    backgroundColor: color,
                                    width: `${100 / Math.min(filteredData.length, 50)}%`
                                }}
                                title={`${formatValue(point.value)} ${formatTime(point.timestamp)}`}
                            />
                        );
                    })}
                </div>
                <div className="chart-info">
                    <span>Min: {formatValue(minValue)}</span>
                    <span>Max: {formatValue(maxValue)}</span>
                    <span>Data points: {filteredData.length}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="economic-metrics">
            <h3>Development Metrics</h3>
            
            <div className="interval-selector">
                <label>Time Interval: </label>
                <select 
                    value={selectedInterval} 
                    onChange={(e) => setSelectedInterval(e.target.value)}
                >
                    <option value="24h">24 hours</option>
                    <option value="48h">48 hours</option>
                    <option value="72h">72 hours</option>
                    <option value="1week">1 week</option>
                </select>
            </div>
            
            <div className="metrics-grid">
                <div className="metric-card">
                    {renderChart(coins, 'Coins Cap over Time', currentCoins, '#ffd700')}
                </div>
                
                <div className="metric-card">
                    {renderChart(learningRate, 'Learning Rate Over Time', currentLearningRate, '#4CAF50')}
                </div>
            </div>

            <div className="metrics-info">
                <p>
                    <strong>Note:</strong> Development metrics are automatically saved every 30 minutes. 
                    Data older than 7 days is automatically removed to save space.
                </p>
            </div>
        </div>
    );
};

export default EconomicMetrics; 