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
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
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
    label: 'effects',
},{
    id: 'cost',
    label: 'cost',
}]

export const ArtifactUpgrades = ({ setItemDetails, purchaseItem, deleteItem, newUnlocks, isMobile }) => {
    const worker = useContext(WorkerContext);
    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);

    const [artifactsData, setItemsData] = useState({
        available: [],
        propertyCategories: [],
        selectedCategory: 'all',
        searchData: {
            search: '',
        },
        showMaxed: false,
        sortOption: 'name',
        sortOrder: 'asc',
        hiddenItems: {},
        customFilters: {},
        customFiltersOrder: [],
        showHidden: false,
    });

    const [isCustomFilterOpened, setCustomFilterOpened] = useState(false);
    const [editingCustomFilter, setEditingCustomFilter] = useState(null);
    const [overlayPositions, setOverlayPositions] = useState([]);

    const handleFlash = (position) => {
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-furnitures-data', { filterId: 'artifact' });
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    useEffect(() => {
        onMessage('furnitures-data', (data) => {
            setItemsData(data);
        });

        return () => {
            removeMessage('furnitures-data');
        };
    }, []);

    const toggleAutopurchase = useCallback((id, flag) => {
        sendData('set-furniture-autopurchase', { id, flag, filterId: 'artifact' });
    }, [sendData]);

    const toggleHiddenItem = useCallback((id, flag) => {
        sendData('toggle-furniture-hidden', { id, flag, filterId: 'artifact' });
    }, [sendData]);

    const setShowHidden = useCallback((showHidden) => {
        sendData('set-furniture-show-hidden', { showHidden, filterId: 'artifact' });
    }, [sendData]);

    const setSearch = (searchData) => {
        sendData('set-furniture-search-text', { filterId: 'artifact', searchData: searchData });
    }

    const handlePinToggle = (id, newFlag) => {
        sendData('toggle-property-custom-filter-pinned', { id, flag: newFlag, filterId: 'artifact' });
    };

    const setActionsFilter = (filterId) => {
        sendData('apply-property-custom-filter', { id: filterId, filterId: 'artifact' })
    }

    const handleEditFilter = (id) => {
        const filterData = artifactsData.customFilters[id];
        setEditingCustomFilter({ ...filterData });
    };

    const handleDeleteFilter = (id) => {
        sendData('delete-property-custom-filter', { id, filterId: 'artifact' });
    };

    const handleAddFilter = () => {
        setEditingCustomFilter({ rules: [], condition: '', category: 'action', name: '' });
    };

    const handleClose = () => {
        setCustomFilterOpened(false);
    };

    const onDragEnd = (result) => {
        const {source, destination} = result;

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
            <div className={'complete'}>
                <p>Artifacts: {artifactsData.available ? artifactsData.available.filter(item => item.level > 0).length : 0} / {artifactsData.available ? artifactsData.available.length : 0}</p>
            </div>
            <div className={'filters'}>
                <label>
                    <SearchField
                        placeholder={'Search'}
                        value={artifactsData.searchData}
                        onSetValue={val => setSearch(val)}
                        scopes={ACTIONS_SEARCH_SCOPES}
                    />
                </label>
                <label>
                    Show Hidden
                    <input type={'checkbox'} checked={artifactsData.showHidden} onChange={e => setShowHidden(!artifactsData.showHidden)}/>
                </label>
            </div>
        </div>
        <div className={'categories flex-container sub-heading'}>
            <ul className={'menu'}>
                {artifactsData.propertyCategories.filter(one => one.isPinned || one.isSelected).map(category => (<li key={category.id} className={`category ${category.isSelected ? 'active' : ''}`} onClick={() => setActionsFilter(category.id)}>
                    <NewNotificationWrap isNew={newUnlocks?.[category.id]?.hasNew}>
                        <span>{category.name}({category.items.length})</span>
                    </NewNotificationWrap>
                </li> ))}
                <li className={'add-custom-filter additional'}>
                                <span className={'create-custom button-like'} onClick={() => {
                                    setCustomFilterOpened(true);
                                }}>Edit Filters</span>
                    {isCustomFilterOpened ? (<div className={'custom-filter-edit-wrap'}>
                        {editingCustomFilter ? (
                                <CustomFilter
                                    prefix={'actions-filter'}
                                    category={'artifact'}
                                    id={editingCustomFilter?.id}
                                    name={editingCustomFilter?.name}
                                    rules={editingCustomFilter?.rules}
                                    condition={editingCustomFilter?.condition}
                                    onCancel={() => {
                                        setEditingCustomFilter(null);
                                    }}
                                    onSave={(data) => {
                                        sendData('save-property-custom-filter', {...data, filterId: 'artifact'});
                                        setEditingCustomFilter(null);
                                    }}
                                />)
                            : (<CustomFiltersList
                                filterOrder={artifactsData.customFiltersOrder}
                                filters={artifactsData.customFilters}
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
                    {artifactsData.available.map(item =>
                        <NewNotificationWrap
                            key={`artifact_${item.id}`}
                            id={item.id}
                            className={'narrow-wrapper'}
                            isNew={newUnlocks?.[artifactsData.selectedCategory]?.items?.[item.id]?.hasNew}
                        >
                            <ArtifactCard
                                isMobile={isMobile}
                                key={item.id}
                                onFlash={handleFlash}
                                {...item}
                                onPurchase={purchaseItem}
                                onDelete={deleteItem}
                                onShowDetails={setItemDetails}
                                toggleAutopurchase={toggleAutopurchase}
                                isAutomationUnlocked={artifactsData.isAutomationUnlocked}
                                toggleHiddenItem={toggleHiddenItem}
                            />
                        </NewNotificationWrap>
                    )}
                    {overlayPositions.map((position, index) => (
                        <FlashOverlay key={index} position={position} />
                    ))}
                </div>
            </PerfectScrollbar>
        </div>
    </div></DragDropContext>)
};

const ArtifactCard = ({
    id, name, level, max, affordable, isLeveled, isCapped, isHidden, onFlash, onPurchase, onShowDetails,
    isAutoPurchase, onDelete, toggleAutopurchase, isAutomationUnlocked, isMobile, toggleHiddenItem
}) => {
    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);

    return (<div
        ref={elementRef}
        className={`card furniture flashable ${affordable?.hardLocked ? 'hard-locked' : ''}  ${!affordable?.isAffordable ? 'unavailable' : ''}`}
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
                        iconId={'icon_upgrade_v2'}
                        disabled={!affordable?.isAffordable || isCapped}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onPurchase(id)
                        }}
                        className={`purchase-button medium-sm ${isCapped ? 'capped' : ''}`}
                        style={{ '--progress': `${affordable?.percentage*100}%` }}
                    >Purchase</CustomButton>
                    {isAutomationUnlocked ? (<AutomationIcon
                        value={isAutoPurchase}
                        className={`medium-sm`}
                        onClick={(e) => {e.stopPropagation(); e.preventDefault(); toggleAutopurchase(id, !isAutoPurchase)}}
                    >{isAutoPurchase ? 'Autopurchase is turned on. Click to turn it off' : 'Autopurchase is turned off. Click to turn it on'}</AutomationIcon>) : null}
                    <TippyWrapper content={<div className={'hint-popup'}>{isHidden ? 'Show Artifact' : 'Hide Artifact'}</div> }>
                        <div className={'icon-content interface-icon medium-sm'} onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleHiddenItem(id, !isHidden)
                        }}>
                            {isHidden ? (<img src={"icons/interface/icon_show.png"}/>) : (<img src={"icons/interface/icon_hide.png"}/>) }
                        </div>
                    </TippyWrapper>
                </div>
            </div>
        </div>
    </div> )
};
