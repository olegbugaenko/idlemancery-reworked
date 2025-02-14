import React, {useContext, useEffect, useMemo, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {HowToSign} from "../shared/how-to-sign.jsx";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import PerfectScrollbar from "react-perfect-scrollbar";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";

export const ActionListsPanel = ({ automationUnlocked, runningList, editListToDetails, lists, viewListToDetails, automationEnabled, toggleAutomation, autotriggerIntervalSetting, changeAutomationInterval }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [openedFor, setOpenedFor] = useState(null);


    const editList = (id) => {
        console.log('Set to edit: ', id);
        editListToDetails(id);
        setOpenedFor(null);
    }

    const runList = (id) => {
        sendData('run-list', { id });
        setOpenedFor(null);
    }

    const onDelete = (id) => {
        sendData('delete-action-list', { id });
        setOpenedFor('edit');
    }

    const setActionListOrder = (newOrder) => {
        sendData('set-action-lists-order', newOrder);
    };

    return (<div className={'action-lists-panel'}>
        <div className={'flex-container'}>
            <div className={'current-list panel-col'}>
                Current list: {runningList ? (<div className={'flex-container'}>
                <span>{runningList.name}</span>
                <div className={'icon-content stop-icon interface-icon'} onClick={() => runList(null)}>
                    <img src={"icons/interface/pause.png"}/>
                </div>
                <div className={'icon-content edit-icon interface-icon'} onClick={() => editList(runningList.id)}>
                    <img src={"icons/interface/edit-icon.png"}/>
                </div>
            </div>) : 'None'}
            </div>
            <div className={'lists-editor panel-col'}>
                <button onClick={() => editListToDetails()}>Create New</button>
            </div>
            <div className={'lists-editor panel-col'}>
                <button onClick={(e) => { e.stopPropagation(); setOpenedFor('edit')}}>Pick list</button>
                <ActionListsPopup lists={lists} isOpened={openedFor === 'edit'} setOpenedFor={setOpenedFor} onSelect={editList} onRun={runList} onHover={viewListToDetails} onDelete={onDelete} setActionListOrder={setActionListOrder}/>
            </div>
            {automationUnlocked ? (<>
                    <div className={'automation-enabled panel-col'}>
                        <label>
                            <input type={'checkbox'} checked={!!automationEnabled} onChange={toggleAutomation}/>
                            Lists automation enabled
                        </label>
                    </div>
                    <div className={'panel-col automation-interval'}>
                        <label>
                            Switch lists interval:
                            <select onChange={e => changeAutomationInterval(+e.target.value)} value={autotriggerIntervalSetting}>
                                <option value={10}>10 seconds</option>
                                <option value={30}>30 seconds</option>
                                <option value={60}>1 minute</option>
                                <option value={300}>5 minutes</option>
                                <option value={900}>15 minutes</option>
                                <option value={1800}>30 minutes</option>
                                <option value={3600}>1 hour</option>
                            </select>
                        </label>
                    </div>
                    <HowToSign scope={'action-lists'} />
                </>
            ) : null}

        </div>
    </div>)
}

export const ActionListsPopup = ({ lists, isOpened, setOpenedFor, onSelect, onHover, onRun, onDelete, setActionListOrder }) => {


    const popupRef = useRef(null);

    const [search, setSearch] = useState('')

    const listsDisplayed = useMemo(() => {
        if(!search) return lists;
        return lists.filter(l => l.name.includes(search));
    }, [lists, search])

    const onDragEnd = (result) => {
        const { source, destination } = result;

        // If dropped outside the list, do nothing
        if (!destination) return;

        // Reorder lists based on drag-and-drop
        const reorderedLists = Array.from(listsDisplayed);
        const [removed] = reorderedLists.splice(source.index, 1);
        reorderedLists.splice(destination.index, 0, removed);

        // Call the callback with the new order
        setActionListOrder(reorderedLists.map((list, index) => ({
            id: list.id,
            sort: index + 1, // Update the sort index
        })));
    };

    const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            setOpenedFor(null); // Close the popup if click outside
        }
    };

    useEffect(() => {
        if (isOpened) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpened]);

    if (!isOpened) return null;

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className={"list-selector"} ref={popupRef}>
                <div className={"list-selector-inner"}>
                    <div className={"search-wrap"}>
                        <input
                            type={"text"}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <Droppable droppableId="actionLists">
                        {(provided) => (
                            <div
                                className={"lists-wrap"}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <PerfectScrollbar>
                                    <div className={"list-inner"}>
                                        {listsDisplayed.map((list, index) => (
                                            <Draggable
                                                key={list.id}
                                                draggableId={list.id.toString()}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        className={"item"}
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onMouseEnter={() => onHover(list.id)}
                                                        onMouseLeave={() => onHover(null)}
                                                    >
                                                        <div className={"list-item-row flex-container"}>
                                                            <span className={"list-name"}>{list.name}</span>
                                                            <TippyWrapper content={<div className={"hint-popup"}>Run List</div>}>
                                                                <div
                                                                    className={"icon-content run-icon interface-icon small"}
                                                                    onClick={() => onRun(list.id)}
                                                                >
                                                                    <img src={"icons/interface/run.png"} />
                                                                </div>
                                                            </TippyWrapper>
                                                            <TippyWrapper content={<div className={"hint-popup"}>Edit List</div>}>
                                                                <div
                                                                    className={"icon-content edit-icon interface-icon small"}
                                                                    onClick={() => onSelect(list.id)}
                                                                >
                                                                    <img src={"icons/interface/edit-icon.png"} />
                                                                </div>
                                                            </TippyWrapper>
                                                            <TippyWrapper content={<div className={"hint-popup"}>Delete List</div>}>
                                                                <div
                                                                    className={"icon-content edit-icon interface-icon small"}
                                                                    onClick={() => onDelete(list.id)}
                                                                >
                                                                    <img src={"icons/interface/delete.png"} />
                                                                </div>
                                                            </TippyWrapper>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                </PerfectScrollbar>
                            </div>
                        )}
                    </Droppable>
                </div>
            </div>
        </DragDropContext>
    );
}