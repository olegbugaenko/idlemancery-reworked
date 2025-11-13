import React, {useCallback} from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import {useAppContext} from "../../context/ui-context";
import StatRow from "../shared/stat-row.jsx";

export const InventoryStats = ({ details, setDetailVisible }) => {

    const { isMobile } = useAppContext();
    const statsToDisplay = [
        details.bargaining,
        details.bargaining_mod,
        details.shop_max_stock,
        details.shop_stock_renew_rate,
    ];

    const hasEffect = useCallback((stat) => {
        if(!stat?.value) return false;
        return !stat.isMultiplier || Math.abs(stat?.value - 1.0) > 1.e-7;
    }, [])

    return (
        <PerfectScrollbar>
            <div className={'blade-inner'}>
                <div className={'block'}>
                    <p>General Stats:</p>
                    <div className={'effects'}>
                        {statsToDisplay.map((stat) => (
                            hasEffect(stat) ? (
                                <StatRow key={stat.id} stat={stat} />
                            ) : null
                        ))}
                    </div>
                </div>
                {isMobile ? (<div className={'block buttons'}>
                    <button onClick={() => setDetailVisible(false)}>Close</button>
                </div>) : null}
            </div>
        </PerfectScrollbar>
    );
};
