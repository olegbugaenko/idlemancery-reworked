import React, { useState, useEffect, useContext } from 'react';
import WorkerContext from '../../context/worker-context';
import { useWorkerClient } from '../../general/client';
import { formatValue, secondsToString } from '../../general/utils/strings';
import PerfectScrollbar from 'react-perfect-scrollbar';

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
        console.log('Received economic metrics:', data);
        setMetrics(data);
    });

    if (!metrics) {
        return <div className="loading">Loading economic metrics...</div>;
    }

    // Ensure all required properties exist
    const { 
        coins = [], 
        learningRate = [], 
        attributes = {}, 
        currentCoins = 0, 
        currentLearningRate = 0, 
        currentAttributes = {} 
    } = metrics;

    console.log('Rendering economic metrics:', {
        coins: coins?.length || 0,
        learningRate: learningRate?.length || 0,
        attributes: attributes,
        currentCoins,
        currentLearningRate,
        currentAttributes
    });

    // Helper function to check if an attribute is unlocked
    const isAttributeUnlocked = (attributeKey) => {
        return currentAttributes && currentAttributes[attributeKey] && currentAttributes[attributeKey] > 0;
    };

    // Helper function to safely get attribute data
    const getAttributeData = (attributeKey) => {
        return (attributes && attributes[attributeKey] && Array.isArray(attributes[attributeKey])) ? attributes[attributeKey] : [];
    };

    // Helper function to get attribute unlock status
    const getAttributeStatus = (attributeKey) => {
        if (!currentAttributes || !currentAttributes[attributeKey]) return 'Locked';
        if (currentAttributes[attributeKey] === 0) return 'Locked';
        return 'Unlocked';
    };

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
        if (!data || !Array.isArray(data) || data.length === 0) return [];
        
        const intervalSeconds = getIntervalSeconds(interval);
        const currentTime = Math.max(...data.map(d => d.timestamp));
        const cutoffTime = currentTime - intervalSeconds;
        
        let filteredData = data.filter(point => point.timestamp >= cutoffTime);
        
        // Limit the number of data points based on interval to maintain consistent chart width
        const maxDataPoints = 50; // Maximum number of bars to display
        if (filteredData.length > maxDataPoints) {
            // Sample data points evenly across the interval
            const step = Math.ceil(filteredData.length / maxDataPoints);
            const sampledData = [];
            for (let i = 0; i < filteredData.length; i += step) {
                sampledData.push(filteredData[i]);
            }
            // Always include the last data point
            if (sampledData[sampledData.length - 1] !== filteredData[filteredData.length - 1]) {
                sampledData.push(filteredData[filteredData.length - 1]);
            }
            filteredData = sampledData;
            console.log(`filterDataByInterval: Limited from ${filteredData.length + (filteredData.length * step)} to ${filteredData.length} points`);
        }
        
        return filteredData;
    };

    const formatTime = (timestamp) => {
        return `${secondsToString(timestamp)} of game`;
    };

    const renderChart = (data, title, currentValue, color) => {
        // Ensure data is an array
        const safeData = Array.isArray(data) ? data : [];
        const filteredData = filterDataByInterval(safeData, selectedInterval);
        
        if (!filteredData || filteredData.length === 0) {
            // Check if this is an attribute chart and show appropriate message
            if (title.includes('Attribute')) {
                const isUnlocked = currentValue > 0;
                const attributeName = title.split(' ')[0]; // Extract attribute name from title
                return (
                    <div className="chart-container">
                        <h4>{title}</h4>
                        <div className="current-value">
                            Current: {formatValue(currentValue)}
                        </div>
                        <p className="no-data">
                            {isUnlocked 
                                ? 'No historical data available yet. Data will appear after the first save (every 30 minutes).' 
                                : `Attribute not yet unlocked. Check the info section below for unlock requirements.`
                            }
                        </p>
                        {!isUnlocked && (
                            <div style={{ 
                                background: '#1a1a1a', 
                                padding: '10px', 
                                borderRadius: '5px', 
                                fontSize: '12px', 
                                color: '#888',
                                marginTop: '10px'
                            }}>
                                <strong>Unlock Requirements:</strong><br />
                                {attributeName === 'Strength' && 'Requires Stamina attribute to reach level 100+'}
                                {attributeName === 'Charisma' && 'Unlocks as you progress through social activities'}
                                {attributeName === 'Patience' && 'Becomes available through game progression'}
                                {attributeName === 'Magic' && 'Unlocks when you gain access to spellcasting'}
                            </div>
                        )}
                    </div>
                );
            }
            return <p className="no-data">No data available for the selected interval.</p>;
        }

        // Add current value as the most recent data point if it's different from the last saved point
        const lastSavedValue = filteredData.length > 0 ? filteredData[filteredData.length - 1].value : null;
        let chartData = [...filteredData];
        
        if (lastSavedValue !== currentValue && currentValue > 0) {
            chartData.push({
                timestamp: Math.max(...filteredData.map(d => d.timestamp), 0) + 1, // Ensure it's the most recent
                value: currentValue
            });
        }

        // Ensure we don't exceed max data points even after adding current value
        const maxDataPoints = 50;
        if (chartData.length > maxDataPoints) {
            const step = Math.ceil(chartData.length / maxDataPoints);
            const sampledData = [];
            for (let i = 0; i < chartData.length; i += step) {
                sampledData.push(chartData[i]);
            }
            // Always include the last data point
            if (sampledData.length > 0 && chartData.length > 0 && sampledData[sampledData.length - 1] !== chartData[chartData.length - 1]) {
                sampledData.push(chartData[chartData.length - 1]);
            }
            chartData = sampledData;
            console.log(`renderChart: Limited from ${chartData.length + (chartData.length * step)} to ${chartData.length} points`);
        }
        
        console.log(`Final chart data points: ${chartData.length}`);

        const maxValue = Math.max(...chartData.map(d => d.value));
        const minValue = Math.min(...chartData.map(d => d.value));
        
        // Add 5% padding to the range to ensure minimum values are visible
        const range = maxValue - minValue;
        const padding = range * 0.05;
        const adjustedMinValue = minValue - padding;
        const adjustedRange = range + (padding * 2);

        return (
            <div className="chart-container">
                <h4>{title}</h4>
                <div className="current-value">
                    Current: {formatValue(currentValue)}
                </div>
                <div className="chart" style={{ height: '200px', display: 'flex', alignItems: 'flex-end' }}>
                    {chartData.map((point, index) => {
                        const height = adjustedRange > 0 ? ((point.value - adjustedMinValue) / adjustedRange) * 100 : 50;
                        return (
                            <div
                                key={index}
                                className="chart-bar"
                                style={{
                                    height: `${Math.max(height, 2)}%`, // Minimum 2% height for visibility
                                    backgroundColor: color,
                                    width: `${100 / 50}%`, // Fixed width based on max data points
                                    minHeight: '2px' // Ensure even tiny bars are visible
                                }}
                                title={`${formatValue(point.value)} ${formatTime(point.timestamp)}`}
                            />
                        );
                    })}
                </div>
                <div className="chart-info">
                    <span>Min: {formatValue(minValue)}</span>
                    <span>Max: {formatValue(maxValue)}</span>
                    <span>Data points: {chartData.length}</span>
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
            
            <div className="metrics-scroll-container">
                <PerfectScrollbar>
                    <div className="metrics-grid">
                        <div className="metric-card">
                            {renderChart(coins, 'Coins Cap over Time', currentCoins, '#ffd700')}
                        </div>
                        
                        <div className="metric-card">
                            {renderChart(learningRate, 'Learning Rate Over Time', currentLearningRate, '#4CAF50')}
                        </div>

                        {/* Only show Strength chart if unlocked */}
                        {isAttributeUnlocked('attribute_strength') ? (
                            <div className="metric-card">
                                {renderChart(
                                    getAttributeData('attribute_strength'), 
                                    'Strength Attribute Over Time', 
                                    (currentAttributes?.attribute_strength || 0), 
                                    '#ad4329'
                                )}
                            </div>
                        ) : null}

                        {/* Only show Charisma chart if unlocked */}
                        {isAttributeUnlocked('attribute_charisma') ? (
                            <div className="metric-card">
                                {renderChart(
                                    getAttributeData('attribute_charisma'), 
                                    'Charisma Attribute Over Time', 
                                    (currentAttributes?.attribute_charisma || 0), 
                                    '#5da329'
                                )}
                            </div>
                        ) : null}

                        {/* Only show Patience chart if unlocked */}
                        {isAttributeUnlocked('attribute_patience') ? (
                            <div className="metric-card">
                                {renderChart(
                                    getAttributeData('attribute_patience'), 
                                    'Patience Attribute Over Time', 
                                    (currentAttributes?.attribute_patience || 0), 
                                    '#8B4513'
                                )}
                            </div>
                        ) : null}

                        {/* Only show Magic Ability chart if unlocked */}
                        {isAttributeUnlocked('attribute_magic_ability') ? (
                            <div className="metric-card">
                                {renderChart(
                                    getAttributeData('attribute_magic_ability'), 
                                    'Magic Ability Attribute Over Time', 
                                    (currentAttributes?.attribute_magic_ability || 0), 
                                    '#9932CC'
                                )}
                            </div>
                        ) : null}
                    </div>
                </PerfectScrollbar>
            </div>

            <div className="metrics-info">
                <p>
                    <strong>Note:</strong> Development metrics (coins cap, learning rate, and key attributes) are automatically saved every 30 minutes. 
                    Data older than 7 days is automatically removed to save space.
                </p>
                <p style={{ marginTop: '10px', fontSize: '13px', color: '#aaa' }}>
                    <strong>Data Collection:</strong> Attribute values are automatically tracked every 30 minutes once unlocked. 
                    Historical data shows your progression over time, helping you see how your character develops.
                </p>
                {process.env.NODE_ENV === 'development' && false && (
                    <details style={{ marginTop: '15px' }}>
                        <summary style={{ cursor: 'pointer', color: '#888' }}>Debug Info</summary>
                        <pre style={{ 
                            background: '#1a1a1a', 
                            padding: '10px', 
                            borderRadius: '5px', 
                            fontSize: '12px', 
                            color: '#ccc',
                            overflow: 'auto',
                            maxHeight: '200px'
                        }}>
                            {JSON.stringify({
                                coins: coins?.length || 0,
                                learningRate: learningRate?.length || 0,
                                attributes: attributes,
                                currentCoins,
                                currentLearningRate,
                                currentAttributes
                            }, null, 2)}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );
};

export default EconomicMetrics; 