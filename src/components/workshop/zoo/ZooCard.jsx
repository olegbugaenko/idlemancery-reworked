import React from "react";
import { formatValue } from "../../../general/utils/strings";

export const ZooCard = ({ animal, totalSpace, onHover, onSelect, isMobile, isSelected }) => {
    const maxCount = animal?.capacity?.maxCount ?? (totalSpace > 0 ? totalSpace / (animal?.capacity?.requiredSpace || 1) : 0);
    const spaceShare = maxCount > 0 ? (animal.count / maxCount) : 0;

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
                        <span>Capacity: <strong>{formatValue(spaceShare * 100)}%</strong></span>
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
        </div>
    );
};

