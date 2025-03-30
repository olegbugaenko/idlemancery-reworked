import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {formatInt} from "../../general/utils/strings";
import {FlashOverlay} from "../layout/flash-overlay.jsx";
import {useFlashOnLevelUp} from "../../general/hooks/flash";
import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";
import {SearchField} from "../shared/search-field.jsx";
import CustomFilter from "../shared/custom-filter.jsx";
import CustomFiltersList from "../shared/custom-filter-list.jsx";
import {DragDropContext} from "react-beautiful-dnd";


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

export const AccessoryUpgrades = ({ setItemDetails, purchaseItem, newUnlocks, isMobile }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
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
        propertyCategories: [],
        selectedCategory: 'all',
        customFilters: {},
        customFiltersOrder: [],
    });

    const [isCustomFilterOpened, setCustomFilterOpened] = useState(false);
    const [editingCustomFilter, setEditingCustomFilter] = useState(null);


    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-furnitures-data', { filterId: 'accessory' });
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('furnitures-data', (furnitures) => {
        setItemsData(furnitures);
    })

    const [overlayPositions, setOverlayPositions] = useState([]);

    const handleFlash = (position) => {
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    };

    const setSearch = (searchData) => {
        sendData('set-furniture-search-text', { filterId: 'accessory', searchData: searchData });
    }

    const handlePinToggle = (id, newFlag) => {
        sendData('toggle-property-custom-filter-pinned', { id, flag: newFlag, filterId: 'accessory' });
    };

    const toggleAutopurchase = useCallback((id, flag) => {
        sendData('set-furniture-autopurchase', { id, flag, filterId: 'accessory' })
    })

    const setActionsFilter = (filterId) => {
        sendData('apply-property-custom-filter', { id: filterId, filterId: 'accessory' })
    }

    const handleEditFilter = (id) => {
        // знаходите фільтр, відкриваєте форму редагування
        // наприклад:
        const filterData = furnituresData.customFilters[id];
        setEditingCustomFilter({ ...filterData });
    };

    const handleDeleteFilter = (id) => {
        sendData('delete-property-custom-filter', { id, filterId: 'accessory' });
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
            <div className={'filters'}>
                <label>
                    <SearchField
                        placeholder={'Search'}
                        value={furnituresData.searchData}
                        onSetValue={val => setSearch(val)}
                        scopes={ACTIONS_SEARCH_SCOPES}
                    />
                </label>
                {/*<label>
                    Hide maxed
                    <input type={'checkbox'} checked={furnituresData.hideMaxed} onChange={e => setHideMaxed(!furnituresData.hideMaxed)}/>
                </label>*/}
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
                                <span className={'create-custom'} onClick={() => {
                                    setCustomFilterOpened(true);
                                    // setEditingCustomFilter({ rules: [], condition: '', category: 'action', name: ''})
                                }}>Edit Filters</span>
                    {isCustomFilterOpened ? (<div className={'custom-filter-edit-wrap'}>
                        {editingCustomFilter ? (
                                <CustomFilter
                                    prefix={'actions-filter'}
                                    category={'accessory'}
                                    id={editingCustomFilter?.id}
                                    name={editingCustomFilter?.name}
                                    rules={editingCustomFilter?.rules}
                                    condition={editingCustomFilter?.condition}
                                    onCancel={() => {
                                        setEditingCustomFilter(null);
                                    }}
                                    onSave={(data) => {
                                        // console.log('saving: ', data)
                                        sendData('save-property-custom-filter', {...data, filterId: 'accessory'});
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
                        <ItemCard key={furniture.id} {...furniture} onFlash={handleFlash} onPurchase={purchaseItem} onShowDetails={setItemDetails}  toggleAutopurchase={toggleAutopurchase} isAutomationUnlocked={furnituresData.isAutomationUnlocked} isMobile={isMobile}/>
                    </NewNotificationWrap>)}
                    {overlayPositions.map((position, index) => (
                        <FlashOverlay key={index} position={position} />
                    ))}
                </div>
            </PerfectScrollbar>
        </div>
    </div></DragDropContext>)
}

export const ItemCard = ({ id, name, level, max, affordable, isLeveled, isCapped, onFlash, onPurchase, onShowDetails, isAutoPurchase, onDelete, toggleAutopurchase, isAutomationUnlocked, isMobile}) => {
    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);

    return (<div
        ref={elementRef}
        className={`card furniture flashable ${affordable.hardLocked ? 'hard-locked' : ''}  ${!affordable.isAffordable ? 'unavailable' : ''}`}
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
                <button
                    disabled={!affordable.isAffordable || isCapped}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onPurchase(id)
                    }}
                    className={`purchase-button ${isCapped ? 'capped' : ''}`}
                    style={{ '--progress': `${affordable.percentage*100}%` }}
                >Purchase</button>
                {isAutomationUnlocked ? (<label className={'autobuy-label'} onClick={(e) => {
                    e.stopPropagation();
                }}>
                    <input type={'checkbox'} checked={isAutoPurchase}
                           onChange={(e) => {
                               e.preventDefault();
                               e.stopPropagation();
                               toggleAutopurchase(id, !isAutoPurchase)
                           }}/>
                    Autobuy
                </label>) : null}
                {/*<button disabled={level <= 0} onClick={() => onDelete(id)}>Remove</button>*/}
            </div>
        </div>
    </div> )
}