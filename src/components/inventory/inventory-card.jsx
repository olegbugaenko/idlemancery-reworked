import React, {useRef} from "react";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import CircularProgress from "../shared/circular-progress.jsx";
import {BreakDown} from "../layout/sidebar.jsx";
import {useFlashOnLevelUp} from "../../general/hooks/flash";
import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";

const itemKeysToCompare = ['id', 'eta', 'cooldownProg', 'isConsumed', 'isChanged', 'isSelected', 'cooldownProg'];
const itemKeysToCompareDelta = ['amount', 'balance']

export const InventoryCard = React.memo(({ isChanged, eta, usages, usagesFor, allowMultiConsume, isConsumable, isRare, isRareIngredient, isSelected, id, name, amount, balance, breakDown, isConsumed, cooldownProg, cooldown, onFlash, onPurchase, onShowDetails, onEditConfig, isMobile, isCtrlPressed }) => {
    const elementRef = useRef(null);

    useFlashOnLevelUp(isConsumed, onFlash, elementRef);

    const handleClick = (e) => {
        if (e.button === 0) {
            onEditConfig({id, name});
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        if(!isConsumable) return;
        let amt = 1;
        if(allowMultiConsume) {
            if(e.shiftKey) amt = amount;
            if(e.ctrlKey && amount >= 1) amt = Math.max(0.1*amount, 1)
        }
        onPurchase(id, amt);
    };

    const renderBreakdownSummary = () => {
        if(!breakDown) {
            return null;
        }

        const totalIncome = (breakDown?.income ?? []).reduce((sum, entry) => sum + (entry?.value ?? 0), 0);
        const totalMultiplier = (breakDown?.multiplier ?? []).reduce((product, entry) => product * (entry?.value ?? 1), 1);
        const totalConsumption = (breakDown?.consumption ?? []).reduce((sum, entry) => sum + (entry?.value ?? 0), 0);

        return (<div className={'block'}>
            <p>Income: {formatValue(totalIncome)}</p>
            <p>Multiplier: {formatValue(totalMultiplier || 1)}</p>
            <p>Consumption: {formatValue(totalConsumption)}</p>
        </div>);
    };

    return (<div
        id={`inventory-item-card-${id}`}
        ref={elementRef}
        className={`icon-card item bigger flashable ${isSelected ? 'selected' : ''} ${isRare ? 'bluish' : ''} ${isRareIngredient ? 'ingredient' : ''}`}
        onMouseEnter={() => {
            if (!isMobile) {
                onShowDetails(id);
            }
        }}
        onMouseLeave={() => {
            if (!isMobile) {
                onShowDetails(null);
            }
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
    >
        <TippyWrapper content={<div className={'hint-popup'}>
            <p>{name}({formatInt(amount)})</p>
            {usages?.length ? (<div className={'block'}>
                <p>Used By:</p>
                <div className={'sub-items'}>
                    {usages.map((one, index) => (<p key={one.id ?? one.name ?? index} className={'padded-left'}>{one.name}</p>))}
                </div>
            </div> ) : null}
            {usagesFor?.length ? (<div className={'block'}>
                <p>Used For:</p>
                <div className={'sub-items'}>
                    {usagesFor.map((one, index) => (<p key={one.id ?? one.name ?? index} className={'padded-left'}>{one.name}</p>))}
                </div>
            </div> ) : null}
            {breakDown ? (<>
                {!isCtrlPressed ? (<p className={'hint ctrl-hint'}>Hit Ctrl to see more details</p>) : null}
                {isCtrlPressed ? (<BreakDown breakDown={breakDown}/>) : null}
                {renderBreakdownSummary()}
            </>) : null}
            <div className={'block'}>
                <p>Balance: {formatValue(balance)}</p>
                {balance < 0 ? (<p>{`${secondsToString(-eta)} to empty`}</p>) : null}
            </div>
            <p>Left click to select</p>
            {isConsumable ? (<p>Right click to consume</p>) : null}
            {isConsumable && allowMultiConsume && amount > 10 ? (<p>Right click + CTRL to consume {formatInt(0.1*amount)}</p>) : null}
            {isConsumable && allowMultiConsume? (<p>Right click + SHIFT to consume all</p>) : null}
        </div> }>
            <div className={'icon-content'}>
                <CircularProgress progress={cooldownProg}>
                    <img src={`icons/resources/${id}.png`} className={'resource'} />
                </CircularProgress>
                <span className={'level'}>{formatValue(amount)}</span>
            </div>
        </TippyWrapper>

    </div> )
}, ((prevProps, currProps) => {
    if(prevProps.id !== currProps.id) {
        return false;
    }

    if(prevProps.amount !== currProps.amount) {
        return false;
    }

    if(prevProps.eta !== currProps.eta && (currProps.eta < 0 || prevProps.eta < 0)) {
        return false;
    }

    if(prevProps.cooldownProg !== currProps.cooldownProg) {
        return false;
    }

    if(prevProps.isConsumed !== currProps.isConsumed) {
        return false;
    }

    if(prevProps.isChanged !== currProps.isChanged) {
        return false;
    }

    if(prevProps.isSelected !== currProps.isSelected) {
        return false;
    }

    if(prevProps.isCtrlPressed !== currProps.isCtrlPressed) {
        return false;
    }
    return true;
}));

const InventoryItemComponent = ({
    item,
    isChanged,
    isMobile,
    isSelected,
    isNew,
    onFlash,
    onPurchase,
    onShowDetails,
    onEditConfig,
    isCtrlPressed,
}) => {
    return (
        <NewNotificationWrap
            id={`inventory_${item.id}`}
            className={'narrow-wrapper'}
            isNew={isNew}
        >
            <InventoryCard
                {...item}
                isSelected={isSelected}
                isChanged={isChanged}
                onPurchase={onPurchase}
                onFlash={onFlash}
                onShowDetails={onShowDetails}
                onEditConfig={onEditConfig}
                isMobile={isMobile}
                isCtrlPressed={isCtrlPressed}
            />
        </NewNotificationWrap>
    );
};

const areInventoryItemPropsEqual = (prev, next) => {
    if(!prev.item || !next.item) return false;

    itemKeysToCompare.forEach(key => {
        if(prev.item[key] !== next.item[key]) {
            return false;
        }
    });
    itemKeysToCompareDelta.forEach(key => {
        if(Math.abs(1 -(prev.item[key] / (next.item[key] + 1.e-6))) > 1.e-3) {
            return false;
        }
    });
    return (
        prev.item === next.item &&
        prev.isChanged === next.isChanged &&
        prev.isMobile === next.isMobile &&
        prev.isSelected === next.isSelected &&
        prev.isNew === next.isNew &&
        prev.onFlash === next.onFlash &&
        prev.onPurchase === next.onPurchase &&
        prev.onShowDetails === next.onShowDetails &&
        prev.onEditConfig === next.onEditConfig &&
        prev.isCtrlPressed === next.isCtrlPressed
    );
};

export const InventoryItem = React.memo(InventoryItemComponent, areInventoryItemPropsEqual);
