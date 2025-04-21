import React, {useCallback, useContext, useEffect, useState} from "react";
import WorkerContext from "../../../context/worker-context";
import {useWorkerClient} from "../../../general/client";
import {formatInt, formatValue} from "../../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import {NewNotificationWrap} from "../../shared/new-notification-wrap.jsx";
import {RawResource} from "../../shared/raw-resource.jsx";
import {BreakDown} from "../../layout/sidebar.jsx";
import {TippyWrapper} from "../../shared/tippy-wrapper.jsx";
import {Balances} from "../shared.jsx";
import {useAppContext} from "../../../context/ui-context";
import {CustomButton} from "../../shared/buttons/custom-button.jsx";
import {AutomationIcon} from "../../shared/buttons/automation-checkbox.jsx";

export const Plantations = ({ setItemDetails, newUnlocks }) => {

    const worker = useContext(WorkerContext);

    const { isMobile } = useAppContext();

    const { onMessage, sendData } = useWorkerClient(worker);
    const [plantationsData, setItemsData] = useState({
        available: [],
        slots: {
            total: 0,
            max: 0
        },
        isWateringUnlocked: false,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-plantation-data', {  });
        }, 200);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage(`plantations-data`, (plantations) => {
        setItemsData(plantations);
    })

    const purchaseItem = useCallback((id) => {
        sendData(`purchase-plantation`, { id })
    })

    const onDemolish = useCallback((id) => {
        if(confirm('Are you sure? This action cant be undone.')) {
            sendData(`remove-plantation`, { id })
        }
    })

    const setWateringLevel = useCallback((id, level) => {
        sendData(`set-plantation-watering`, { id, level })
    })

    const toggleAutopurchase = useCallback((id, flag) => {
        sendData('set-plantation-autopurchase', { id, flag })
    })

    return (<div className={'crafting-wrap'}>
        <div className={'head'}>
            <div className={'space-item'}>
                <RawResource id={'plantation_slots'} name={'Plantation Slots'} />
                <span className={`${plantationsData.slots.total > 0 ? 'slots-available' : 'slots-unavailable'}`}>{formatInt(plantationsData.slots.total)}/{formatInt(plantationsData.slots.max)}</span>
            </div>
            {plantationsData.isWateringUnlocked ? (<TippyWrapper content={<div className={'hint-popup'}>
                <p className={'hint'}>Congrats! You can now use water to increase your plantations efficiency by setting watering level</p>
                <p className={'hint'}>If you try to use more water than you have - watering bonus will decrease</p>
                <BreakDown breakDown={plantationsData.waterResource.breakDown} />
            </div> }>
                <div className={'space-item'}>
                    <RawResource id={'inventory_water'} name={plantationsData.waterResource.name} />
                    <span>{formatValue(plantationsData.waterResource.amount)}({formatValue(plantationsData.waterResource.balance)})</span>
                </div>
            </TippyWrapper> ) : null}
        </div>
        <div className={'plantations-cat'}>
            <PerfectScrollbar>
                <div className={'flex-container'}>
                    {plantationsData.available.map(plantable => <NewNotificationWrap id={`plantation_${plantable.id}`} className={'narrow-wrapper'} isNew={newUnlocks?.all?.items?.[`plantation_${plantable.id}`]?.hasNew}>
                        <ItemCard key={plantable.id} {...plantable} onPurchase={purchaseItem} onShowDetails={setItemDetails} onDemolish={onDemolish} isWateringUnlocked={plantationsData.isWateringUnlocked} setWateringLevel={setWateringLevel} isMobile={isMobile} toggleAutopurchase={toggleAutopurchase} isAutomationUnlocked={plantationsData.isAutomationUnlocked}/>
                    </NewNotificationWrap>)}
                </div>
            </PerfectScrollbar>
        </div>
    </div>)
}

export const ItemCard = ({ id, icon_id, resourceAmount, resourceBalance, breakDown, name, level, maxLevel, affordable, isAutoPurchase, onPurchase, onDemolish, onShowDetails, wateringLevel, isWateringUnlocked, setWateringLevel, toggleAutopurchase, isAutomationUnlocked, isMobile}) => {

    return (<div
        className={`card craftable plantable`}
        onMouseEnter={() => !isMobile ? onShowDetails(id) : null}
        onMouseLeave={() => !isMobile ? onShowDetails(null) : null}
        onClick={() => isMobile ? onShowDetails(id) : null}
    >
        <div className={'flex-container two-side-card'}>
            <div className={'left'}>
                <img src={`icons/resources/${icon_id}.png`} className={'resource big'}/>
            </div>
            <div className={'right'}>
                <div className={'head'}>
                    <p className={'title'}>{name}</p>
                    <span className={'level'}>{formatInt(level)}{maxLevel ? `/${formatInt(maxLevel)}` : ''}</span>
                </div>
                <Balances resourceAmount={resourceAmount} resourceBalance={resourceBalance} breakDown={breakDown} />
                {isWateringUnlocked ? (<div className={'watering-settings'}>
                    <label>
                        <span>Watering Level:</span>
                        <input type={'number'} value={wateringLevel} onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setWateringLevel(id, +e.target.value)
                        }}/>
                    </label>
                </div> ) : null}
                <div className={'bottom'}>
                    <div className={'buttons'}>
                        <div className={'left-wise'}>
                            <CustomButton
                                iconId={'icon_upgrade_v2'}
                                disabled={!affordable.isAffordable}
                                className={`purchase-button medium-sm`}
                                style={{ '--progress': `${affordable.percentage*100}%` }}
                                onClick={(e) => {e.stopPropagation(); e.preventDefault(); onPurchase(id)}}
                            >{level > 0 ? 'Upgrade' : 'Purchase'}</CustomButton>
                            {isAutomationUnlocked ? (<AutomationIcon
                                value={isAutoPurchase}
                                className={'medium-sm'}
                                onClick={(e) => {e.stopPropagation(); e.preventDefault(); toggleAutopurchase(id, !isAutoPurchase)}}
                            >{isAutoPurchase ? 'Autopurchase is turned on. Click to turn it off' : 'Autopurchase is turned off. Click to turn it on'}</AutomationIcon>) : null}

                        </div>
                        <div className={'right-wise'}>
                            <CustomButton disabled={level <= 0} iconId={'icon_downgrade_v2'} className={'medium-sm'} onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDemolish(id)
                            }}>Demolish and free plantation slot</CustomButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div> )
}
