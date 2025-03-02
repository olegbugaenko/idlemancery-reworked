import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {formatInt} from "../../general/utils/strings";
import {FlashOverlay} from "../layout/flash-overlay.jsx";
import {useFlashOnLevelUp} from "../../general/hooks/flash";
import {NewNotificationWrap} from "../layout/new-notification-wrap.jsx";
import {SearchField} from "../shared/search-field.jsx";
import {RawResource} from "../shared/raw-resource.jsx";
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

export const FurnitureUpgrades = ({ setItemDetails, purchaseItem, deleteItem, newUnlocks, isMobile }) => {

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

    onMessage('furnitures-data', (furnitures) => {
        setItemsData(furnitures);
    })

    const setSearch = (searchData) => {
        sendData('set-furniture-search-text', { filterId: 'furniture', searchData: searchData });
    }

    const setHideMaxed = (hideMaxed) => {
        sendData('set-furniture-hide-maxed', { filterId: 'furniture', hideMaxed: hideMaxed });
    }

    const [overlayPositions, setOverlayPositions] = useState([]);

    const handleFlash = (position) => {
        // console.log('Adding flash: ', position);
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    };

    const toggleAutopurchase = useCallback((id, flag) => {
        sendData('set-furniture-autopurchase', { id, flag, filterId: 'furniture' })
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
            <div className={'space-item'}>
                <RawResource id={'living_space'} name={'Living Space'} />
                <span className={`slots-amount ${furnituresData.space.total > 0 ? 'slots-available' : 'slots-unavailable'}`}>{formatInt(Math.floor(furnituresData.space.total))}/{formatInt(furnituresData.space.max)}</span>
            </div>
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
                                    category={'furniture'}
                                    id={editingCustomFilter?.id}
                                    name={editingCustomFilter?.name}
                                    rules={editingCustomFilter?.rules}
                                    condition={editingCustomFilter?.condition}
                                    onCancel={() => {
                                        setEditingCustomFilter(null);
                                    }}
                                    onSave={(data) => {
                                        // console.log('saving: ', data)
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
                        <ItemCard key={furniture.id} {...furniture} onFlash={handleFlash} onPurchase={purchaseItem} onShowDetails={setItemDetails} onDelete={deleteItem} toggleAutopurchase={toggleAutopurchase} isAutomationUnlocked={furnituresData.isAutomationUnlocked} isMobile={isMobile}/>
                    </NewNotificationWrap>)}
                    {overlayPositions.map((position, index) => (
                        <FlashOverlay key={index} position={position} />
                    ))}
                </div>
            </PerfectScrollbar>
        </div>
    </div></DragDropContext>)
}

export const ItemCard = ({ id, name, level, max, affordable, isLeveled, isCapped, onFlash, onPurchase, onShowDetails, onDelete, isAutoPurchase, toggleAutopurchase, isAutomationUnlocked, isMobile}) => {
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
                <button disabled={!affordable.isAffordable || isCapped} onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onPurchase(id)
                }}>Purchase</button>
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
                <button disabled={level <= 0} onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(id)
                }}>Remove</button>
            </div>
        </div>
    </div> )
}