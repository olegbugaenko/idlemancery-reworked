import React, {useRef} from "react";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import CircularProgress from "../shared/circular-progress.jsx";
import {BreakDown} from "../layout/sidebar.jsx";
import {useFlashOnLevelUp} from "../../general/hooks/flash";
import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";

export const InventoryCard = React.memo(({ isChanged, eta, usages, usagesFor, allowMultiConsume, isConsumable, isRare, isRareIngredient, isSelected, id, name, amount, balance, breakDown, isConsumed, cooldownProg, cooldown, onFlash, onPurchase, onShowDetails, onEditConfig, isMobile}) => {
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
                    {usages.map(one => (<p className={'padded-left'}>{one.name}</p>))}
                </div>
            </div> ) : null}
            {usagesFor?.length ? (<div className={'block'}>
                <p>Used For:</p>
                <div className={'sub-items'}>
                    {usagesFor.map(one => (<p className={'padded-left'}>{one.name}</p>))}
                </div>
            </div> ) : null}
            {breakDown ? (<BreakDown breakDown={breakDown}/>) : null}
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
            />
        </NewNotificationWrap>
    );
};

const areInventoryItemPropsEqual = (prev, next) => {
    return (
        prev.item === next.item &&
        prev.isChanged === next.isChanged &&
        prev.isMobile === next.isMobile &&
        prev.isSelected === next.isSelected &&
        prev.isNew === next.isNew &&
        prev.onFlash === next.onFlash &&
        prev.onPurchase === next.onPurchase &&
        prev.onShowDetails === next.onShowDetails &&
        prev.onEditConfig === next.onEditConfig
    );
};

export const InventoryItem = React.memo(InventoryItemComponent, areInventoryItemPropsEqual);
