import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {BreakDown} from "../layout/sidebar.jsx";
import {ResourceComparison} from "../shared/resource-comparison.jsx";

export const Guilds = ({ setItemDetails, filterId }) => {

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
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage(`guild-items-data`, (guilds) => {
        console.log('GLDS: ', guilds);
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
        </div> )
    }

    return (<div className={'guilds-wrap'}>
        {/*<div className={'head'}>
            <div className={'space-item'}>
                <span>Reputation Points:</span>
                <span>{formatInt(guildsData.points.balance)}/{formatInt(guildsData.points.max)}</span>
            </div>
            <TippyWrapper content={<div className={'hint-popup'}>You can get reputation by performing jobs for your guilds</div> }>
                <div className={'space-item'}>
                    <span>Reputation Level:</span>
                    <span>{formatValue(guildsData.reputation.amount)}/{formatValue(guildsData.reputation.max)}</span>
                </div>
            </TippyWrapper>
        </div>*/}
        <div className={'guild-overview'}>
            <div className={'flex-container'}>
                <div className={'icon-holder left'}>
                    <img className={'guild-image'} src={`icons/guilds/${guildsData.current.icon_id}.png`}/>
                </div>
                <div className={'right'}>
                    <p className={'guild-name'}>{guildsData.current.name}</p>
                    <div className={'space-item'}>
                        <p className={'info'}>Reputation Level: </p>
                        <span>{formatInt(guildsData.current.level)}</span>
                    </div>
                    <TippyWrapper content={<div className={'hint-popup'}>
                        <p>You can get reputation by performing jobs for your guilds</p>
                        <BreakDown breakDown={guildsData.reputation.breakDown} />
                        <p>ETA: {secondsToString(guildsData.reputation.eta)}</p>
                        {/*<BreakDown breakDown={guildsData.reputation.storageBreakdown} />*/}
                    </div> }>
                        <div className={'space-item'}>
                            <span>Reputation Progress:</span>
                            <span>{formatValue(guildsData.reputation.amount)}/{formatValue(guildsData.reputation.cap)}</span>
                        </div>
                    </TippyWrapper>
                    <div className={'space-item'}>
                        <span>Reputation Points:</span>
                        <span>{formatInt(guildsData.points.balance)}/{formatInt(guildsData.points.cap)}</span>
                    </div>
                    <div className={'buttons'}>
                        {guildsData.prestige.canPrestige ? (<TippyWrapper content={<div className={'hint-popup'}>
                            <p>You will loose all your guild reputation, levels and upgrades, but will get following bonuses (based on your new max reputation level):</p>
                            <ResourceComparison effects1={guildsData.prestige.currentEffects} effects2={guildsData.prestige.potentialEffects} />
                        </div> }>
                            <button onClick={leaveGuild}>Prestige Guild</button>
                        </TippyWrapper> ) : (<button onClick={leaveGuild}>Abandon Guild</button>)}
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
                                    ? list.map(upgrade => <ItemCard key={upgrade.id} {...upgrade} onPurchase={purchaseUpgrade} onShowDetails={setItemDetails}/>)
                                    : (<p>Reach reputation level {formatInt(guildsData.tierUnlocks[tier]?.level)} to unlock</p>)}
                            </div>
                        </div> )
                    })}
                </div>
            </PerfectScrollbar>
        </div>
    </div>)
}

export const ItemCard = ({ id, name, level, maxLevel, affordable, onPurchase, onShowDetails}) => {

    return (<div className={`card upgrade`} onMouseEnter={() => onShowDetails(id)} onMouseOver={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)}>
        <div className={'item-card'}>
            <div className={'head'}>
                <p className={'title'}>{name}</p>
                <span className={'level'}>{formatInt(level)}{maxLevel ? `/${formatInt(maxLevel)}` : ''}</span>
            </div>
            <div className={'bottom'}>
                <div className={'buttons'}>
                    <button disabled={!affordable.isAffordable} onClick={() => onPurchase(id)}>Upgrade</button>
                </div>
            </div>
        </div>
    </div> )
}