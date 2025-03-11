import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {BreakDown} from "../layout/sidebar.jsx";
import {ResourceComparison} from "../shared/resource-comparison.jsx";
import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";

export const Guilds = ({ setItemDetails, filterId, newUnlocks, isMobile }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [guildsData, setGuildsData] = useState({
        guilds: [],
        current: null,
        availableUpgrades: [],
        tierUnlocks: [false, false, false],
        reputation: {},
        points: {},
    });

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-guild-items-data', { filterId });
        }, 1000);
        sendData('query-guild-items-data', { filterId });
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage(`guild-items-data`, (guilds) => {
        setGuildsData(guilds);
    })


    const purchaseUpgrade = useCallback((id) => {
        sendData(`purchase-guild-item`, { id })
    })

    const selectGuild = useCallback((id) => {
        sendData('select-guild', { id });
    })

    const leaveGuild = useCallback(() => {
        sendData('leave-guild', {});
    })

    if(!guildsData.current) {
        return (<div className={'guilds-selector-wrap'}>
            <div className={'explanations'}>
                <p>You can select only one guild. But you can change it anytime you want.</p>
            </div>
            <div className={'guilds-list-wrap'}>
                <PerfectScrollbar>
                    <div className={'guilds-container'}>
                        {guildsData.guilds.map(guild => (<div className={'guild-card'} onMouseOver={() => setItemDetails(guild.id, 'guild')} onMouseLeave={() => setItemDetails(null, 'guild')} onClick={() => selectGuild(guild.id)}>
                            <div className={'guild-card-inner'}>
                                <div className={'image-holder'}>
                                    <img src={`icons/guilds/${guild.icon_id}.png`} className={'guild big'}/>
                                </div>
                                <p>{guild.name}</p>
                            </div>
                        </div> ))}
                    </div>
                </PerfectScrollbar>
            </div>
        </div> )
    }

    return (<div className={'guilds-wrap'}>
        <NewNotificationWrap isNew={newUnlocks?.guild_leveled?.hasNew} id={'guild_leveled'}>
            <div className={'guild-overview'}>
                <div className={'flex-container'}>
                    <div className={'icon-holder left'}>
                        <img className={'guild-image'} src={`icons/guilds/${guildsData.current.icon_id}.png`}/>
                    </div>
                    <div className={'right'}>
                        <p className={'guild-name'}>{guildsData.current.name}</p>
                        <div className={'space-item padded'}>
                            <p className={'info'}>Reputation Level: </p>
                            <span>{formatInt(guildsData.current.level)}</span>
                        </div>
                        <TippyWrapper content={<div className={'hint-popup'}>
                            <p>You can get reputation by performing jobs for your guilds</p>
                            <BreakDown breakDown={guildsData.reputation.breakDown} />
                            <p>ETA: {secondsToString(guildsData.reputation.eta)}</p>
                            {/*<BreakDown breakDown={guildsData.reputation.storageBreakdown} />*/}
                        </div> }>
                            <div className={'padded'}>
                                <div className={'space-item'}>
                                    <span>Reputation Progress:</span>
                                    <span>{formatValue(guildsData.reputation.amount)}/{formatValue(guildsData.reputation.cap)}</span>
                                </div>
                                <div className={'progress-wrap guilds-wrap'}>
                                    <div className={'progress-bar'}>
                                        <div className={'progress-bg'} style={{width: `${100*guildsData.reputation.amount/guildsData.reputation.cap}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        </TippyWrapper>
                        <div className={'space-item padded'}>
                            <span>Reputation Points:</span>
                            <span className={`slots-amount ${guildsData.points.balance > 0 ? 'slots-available' : 'slots-unavailable'}`}>{formatInt(guildsData.points.balance)}/{formatInt(guildsData.points.income)}</span>
                        </div>
                        <div className={'buttons'}>
                            {guildsData.prestige.canPrestige ? (<TippyWrapper content={<div className={'hint-popup'}>
                                <p>You will loose all your guild reputation, levels and upgrades, but will get following bonuses (based on your new max reputation level):</p>
                                <ResourceComparison effects1={guildsData.prestige.currentEffects} effects2={guildsData.prestige.potentialEffects} />
                            </div> }>
                                <button onClick={leaveGuild}>Prestige Guild</button>
                            </TippyWrapper> ) : (<TippyWrapper content={<div className={'hint-popup'}>
                                <p>You wont receive any new bonuses</p>
                                <p>Reach {formatInt(guildsData.maxLevel + 1)} reputation level to increase your bonuses</p>
                            </div> }>
                                <button onClick={leaveGuild}>Abandon Guild</button>
                            </TippyWrapper>)}
                        </div>
                    </div>
                </div>
            </div>
            <div className={'upgrades'}>
                <PerfectScrollbar>
                    <div className={'tiers'}>
                        {Object.values(guildsData.availableUpgrades).map((list, tier) => {

                            return (<div className={'tier-wrap'}>
                                <p className={'tier-title'}>Tier {formatInt(tier+1)}</p>
                                <div className={'tier-content'}>
                                    {guildsData.tierUnlocks[tier]?.isUnlocked
                                        ? list.map(upgrade => <ItemCard key={upgrade.id} {...upgrade} onPurchase={purchaseUpgrade} onShowDetails={setItemDetails} isMobile={isMobile}/>)
                                        : (<p>Reach reputation level {formatInt(guildsData.tierUnlocks[tier]?.level)} to unlock</p>)}
                                </div>
                            </div> )
                        })}
                    </div>
                </PerfectScrollbar>
            </div>
        </NewNotificationWrap>
    </div>)
}

export const ItemCard = ({ id, name, level, maxLevel, affordable, onPurchase, onShowDetails, isMobile}) => {

    return (<div
        className={`card upgrade`}
        onMouseEnter={() => isMobile ? null : onShowDetails(id)}
        onMouseOver={() => isMobile ? null : onShowDetails(id)}
        onMouseLeave={() => isMobile ? null : onShowDetails(null)}
        onClick={() => isMobile ? onShowDetails(id) : null}
    >
        <div className={'item-card'}>
            <div className={'head'}>
                <p className={'title'}>{name}</p>
                <span className={'level'}>{formatInt(level)}{maxLevel ? `/${formatInt(maxLevel)}` : ''}</span>
            </div>
            <div className={'bottom'}>
                <div className={'buttons'}>
                    <button disabled={!affordable.isAffordable} onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onPurchase(id)
                    }}>Upgrade</button>
                </div>
            </div>
        </div>
    </div> )
}