import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {formatInt} from "../../general/utils/strings";
import {FlashOverlay} from "../layout/flash-overlay.jsx";
import {useFlashOnLevelUp} from "../../general/hooks/flash";
import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";
import {SearchField} from "../shared/search-field.jsx";
import {RawResource} from "../shared/raw-resource.jsx";
import CustomFilter from "../shared/custom-filter.jsx";
import CustomFiltersList from "../shared/custom-filter-list.jsx";
import {DragDropContext} from "react-beautiful-dnd";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {BreakDown} from "../layout/sidebar.jsx";
import {CustomButton} from "../shared/buttons/custom-button.jsx";
import {AutomationIcon} from "../shared/buttons/automation-checkbox.jsx";


const ACTIONS_SEARCH_SCOPES = [{
    id: 'name',
    label: 'Name',
},{
    id: 'tags',
    label: 'Tags'
},{
    id: 'description',
    label: 'description'
},{
    id: 'resources',
    label: 'resources'
},{
    id: 'effects',
    label: 'effects'
}]

export const FurnitureUpgrades = ({ setItemDetails, purchaseItem, deleteItem, newUnlocks, isMobile }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const [furnituresData, setItemsData] = useState({
        available: [],
        space: {
            total: 0,
            max: 0
        },
        searchData: {
            search: '',
        },
        hideMaxed: false,
        showHidden: false,
        propertyCategories: [],
        customFilters: {},
        customFiltersOrder: [],
        selectedCategory: 'all'
    });

    const [isCustomFilterOpened, setCustomFilterOpened] = useState(false);
    const [editingCustomFilter, setEditingCustomFilter] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-furnitures-data', { filterId: 'furniture' });
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    useEffect(() => {
        onMessage('furnitures-data', (furnitures) => {
            setItemsData(furnitures);
        });
        
        return () => {
            removeMessage('furnitures-data');
        };
    }, []);

    const setSearch = (searchData) => {
        sendData('set-furniture-search-text', { filterId: 'furniture', searchData: searchData });
    }

    const setHideMaxed = (hideMaxed) => {
        sendData('set-furniture-hide-maxed', { filterId: 'furniture', hideMaxed: hideMaxed });
    }

    const setShowHidden = (showHidden) => {
        sendData('set-furniture-show-hidden', { filterId: 'furniture', showHidden })
    }

    const [overlayPositions, setOverlayPositions] = useState([]);

    const handleFlash = (position) => {
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    };

    const toggleAutopurchase = useCallback((id, flag) => {
        sendData('set-furniture-autopurchase', { id, flag, filterId: 'furniture' })
    })

    const toggleHiddenItem = useCallback((id, flag) => {
        sendData('toggle-furniture-hidden', { filterId: 'furniture', id, flag });
    })


    const handlePinToggle = (id, newFlag) => {
        sendData('toggle-property-custom-filter-pinned', { id, flag: newFlag, filterId: 'furniture' });
    };


    const setActionsFilter = (filterId) => {
        sendData('apply-property-custom-filter', { id: filterId, filterId: 'furniture' })
    }

    const handleEditFilter = (id) => {
        // знаходите фільтр, відкриваєте форму редагування
        // наприклад:
        const filterData = furnituresData.customFilters[id];
        setEditingCustomFilter({ ...filterData });
    };

    const handleDeleteFilter = (id) => {
        sendData('delete-property-custom-filter', { id, filterId: 'furniture' });
    };

    const handleAddFilter = () => {
        setEditingCustomFilter({ rules: [], condition: '', category: 'action', name: '' });
    };

    const handleClose = () => {
        setCustomFilterOpened(false);
    };

    const onDragEnd = (result) => {
        const {source, destination, draggableId} = result;

        if (!destination) return;

        const sourceDroppableId = source.droppableId;
        const destinationDroppableId = destination.droppableId;

        if (sourceDroppableId === 'custom-filters' && destinationDroppableId === 'custom-filters') {
            if (source.index !== destination.index) {
                sendData('actions-change-custom-filters-order', {
                    sourceIndex: source.index,
                    destinationIndex: destination.index
                })
            }
        }
    }

    return (<DragDropContext onDragEnd={onDragEnd}><div className={'furniture-wrap'}>
        <div className={'head'}>
            <TippyWrapper content={<div className={'hint-popup'}>
                <BreakDown breakDown={furnituresData.space.breakDown} />
            </div> }>
                <div className={'space-item'}>
                    <RawResource id={'living_space'} name={'Living Space'} />
                    <span className={`slots-amount ${furnituresData.space.total > 0 ? 'slots-available' : 'slots-unavailable'}`}>{formatInt(Math.floor(furnituresData.space.total))}/{formatInt(furnituresData.space.max)}</span>
                </div>
            </TippyWrapper>
            <div className={'filters'}>
                <label>
                    <SearchField
                        placeholder={'Search'}
                        value={furnituresData.searchData}
                        onSetValue={val => setSearch(val)}
                        scopes={ACTIONS_SEARCH_SCOPES}
                    />
                </label>
                <label>
                    Hide maxed
                    <input type={'checkbox'} checked={furnituresData.hideMaxed} onChange={e => setHideMaxed(!furnituresData.hideMaxed)}/>
                </label>
                <label>
                    Show Hidden
                    <input type={'checkbox'} checked={furnituresData.showHidden} onChange={e => setShowHidden(!furnituresData.showHidden)}/>
                </label>
            </div>
        </div>
        <div className={'categories flex-container sub-heading'}>
            <ul className={'menu'}>
                {furnituresData.propertyCategories.filter(one => one.isPinned || one.isSelected).map(category => (<li key={category.id} className={`category ${category.isSelected ? 'active' : ''}`} onClick={() => setActionsFilter(category.id)}>
                    <NewNotificationWrap isNew={newUnlocks?.[category.id]?.hasNew}>
                        <span>{category.name}({category.items.length})</span>
                    </NewNotificationWrap>
                </li> ))}
                <li className={'add-custom-filter additional'}>
                                <span className={'create-custom button-like'} onClick={() => {
                                    setCustomFilterOpened(true);
                                    // setEditingCustomFilter({ rules: [], condition: '', category: 'action', name: ''})
                                }}>Edit Filters</span>
                    {isCustomFilterOpened ? (<div className={'custom-filter-edit-wrap'}>
                        {editingCustomFilter ? (
                                <CustomFilter
                                    prefix={'actions-filter'}
                                    category={'furniture'}
                                    id={editingCustomFilter?.id}
                                    name={editingCustomFilter?.name}
                                    rules={editingCustomFilter?.rules}
                                    condition={editingCustomFilter?.condition}
                                    onCancel={() => {
                                        setEditingCustomFilter(null);
                                    }}
                                    onSave={(data) => {
                                        sendData('save-property-custom-filter', {...data, filterId: 'furniture'});
                                        setEditingCustomFilter(null);
                                    }}
                                />)
                            : (<CustomFiltersList
                                filterOrder={furnituresData.customFiltersOrder}
                                filters={furnituresData.customFilters}
                                onPinToggle={handlePinToggle}
                                onApply={setActionsFilter}
                                onEdit={handleEditFilter}
                                onDelete={handleDeleteFilter}
                                showAddButton
                                onAdd={handleAddFilter}
                                showCloseButton
                                onClose={handleClose}
                            />)}
                    </div> ) : null}

                </li>
            </ul>
        </div>
        <div className={'furnitures-cat'}>
            <PerfectScrollbar>
                <div className={'flex-container'}>
                    {furnituresData.available.map(furniture => <NewNotificationWrap key={furniture.id} id={furniture.id} className={'narrow-wrapper'} isNew={newUnlocks?.[furnituresData.selectedCategory]?.items?.[furniture.id]?.hasNew}>
                        <ItemCard key={furniture.id} {...furniture} onFlash={handleFlash} onPurchase={purchaseItem} onShowDetails={setItemDetails} onDelete={deleteItem} toggleAutopurchase={toggleAutopurchase} isAutomationUnlocked={furnituresData.isAutomationUnlocked} isMobile={isMobile} toggleHiddenItem={toggleHiddenItem}/>
                    </NewNotificationWrap>)}
                    {overlayPositions.map((position, index) => (
                        <FlashOverlay key={index} position={position} />
                    ))}
                </div>
            </PerfectScrollbar>
        </div>
    </div></DragDropContext>)
}

export const ItemCard = ({ id, name, level, max, affordable, isLeveled, isCapped, isHidden, spaceUsage, onFlash, onPurchase, onShowDetails, onDelete, isAutoPurchase, toggleAutopurchase, isAutomationUnlocked, isMobile, toggleHiddenItem}) => {
    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);

    return (<div
        ref={elementRef}
        className={`card furniture flashable ${isCapped ? 'complete' : ''} ${affordable.hardLocked ? 'hard-locked' : ''}  ${!affordable.isAffordable ? 'unavailable' : ''}`}
        onMouseEnter={() => !isMobile ? onShowDetails(id) : null}
        onMouseLeave={() => !isMobile ? onShowDetails(null) : null}
        onClick={() => isMobile ? onShowDetails(id) : null}
    >
        <div className={'head'}>
            <p className={'title'}>{name}</p>
            <span className={'level'}>{formatInt(level)}{max ? `/${formatInt(max)}` : ''}</span>
        </div>
        <div className={'bottom'}>
            <div className={'buttons'}>
                <div className={'leftwise'}>
                    <CustomButton
                        disabled={!affordable.isAffordable || isCapped}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onPurchase(id)
                        }}
                        className={`purchase-button medium-sm ${isCapped ? 'capped' : ''}`}
                        style={{ '--progress': `${affordable.percentage*100}%` }}
                        iconId={'icon_upgrade_v2'}
                    >Purchase</CustomButton>
                    {isAutomationUnlocked ? (<AutomationIcon
                        value={isAutoPurchase}
                        className={`medium-sm`}
                        onClick={(e) => {e.stopPropagation(); e.preventDefault(); toggleAutopurchase(id, !isAutoPurchase)}}
                    >{isAutoPurchase ? 'Autopurchase is turned on. Click to turn it off' : 'Autopurchase is turned off. Click to turn it on'}</AutomationIcon>) : null}
                    <TippyWrapper content={<div className={'hint-popup'}>{isHidden ? 'Show Furniture' : 'Hide Furniture'}</div> }>
                        <div className={'icon-content interface-icon medium-sm'} onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleHiddenItem(id, !isHidden)
                        }}>
                            {isHidden ? (<img src={"icons/interface/icon_show.png"}/>) : (<img src={"icons/interface/icon_hide.png"}/>)}
                        </div>
                    </TippyWrapper>
                </div>
                <div className={'right-wise'}>
                    <CustomButton disabled={level <= 0} iconId={'icon_downgrade_v2'} className={'medium-sm'} onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(id)
                    }}>Remove 1 level</CustomButton>
                </div>

            </div>
        </div>
        <div className={'bottom-bar property'}>
            <div className={'progress-bg'}>
                <div className={'progress-bar'} style={{width: `${100 * spaceUsage}%`}}></div>
            </div>
        </div>
    </div> )
}