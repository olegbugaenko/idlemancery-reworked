import React from "react";
import {TippyWrapper} from './tippy-wrapper.jsx'; // Переконайтесь, що шлях правильний
import {BreakDown} from './../layout/sidebar.jsx';
import {formatValue} from "../../general/utils/strings"; // Компонент для розбивки, якщо необхідно

const StatRow = ({ stat, onHover = () => {} }) => {
    if (!stat) return null;

    return (
        <div className={'row flex-row'}
             // onMouseEnter={() => onHover(stat.id)}
             onMouseOver={() => onHover(stat.id)}
             onMouseLeave={() => onHover()}
             // onMouseOut={() => onHover()}
        >
            <TippyWrapper
                content={
                    <div className={'hint-popup'}>
                        {stat.description}
                    </div>
                }
            >
                <p>{stat.name}</p>
            </TippyWrapper>
            {stat.breakDown ? (
                <TippyWrapper
                    content={
                        <div className={'hint-popup'}>
                            <BreakDown breakDown={stat.breakDown} />
                        </div>
                    }
                >
                    {stat.isMultiplier ? (<p>X{formatValue(stat.value)}</p>) : (<p>{formatValue(stat.value)}</p>)}
                </TippyWrapper>
            ) : (stat.isMultiplier ? (<p>X{formatValue(stat.value)}</p>) : (<p>{formatValue(stat.value)}</p>))}
        </div>
    );
};

export default StatRow;