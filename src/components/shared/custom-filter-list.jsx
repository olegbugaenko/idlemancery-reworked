import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import {TippyWrapper} from './tippy-wrapper.jsx';

/**
 * @param {Object} props
 * @param {string[]} props.filterOrder - масив ідентифікаторів, що визначає порядок відображення
 * @param {Object} props.filters - об’єкт { [id]: { name, isPinned, isRequired, ... } }
 * @param {Function} props.onPinToggle - викликається при зміні чекбокса `isPinned`
 * @param {Function} props.onApply - викликається при натисканні на "Apply Filter"
 * @param {Function} props.onEdit - викликається при натисканні на "Edit"
 * @param {Function} props.onDelete - викликається при натисканні на "Delete"
 * @param {boolean} props.showAddButton - чи показувати кнопку "Add"
 * @param {Function} props.onAdd - викликається при натисканні на "Add"
 * @param {boolean} props.showCloseButton - чи показувати кнопку "Close"
 * @param {Function} props.onClose - викликається при натисканні на "Close"
 * @param {string} [props.noFiltersHint="No custom filters were added yet"]
 * @param {string} [props.droppableId="custom-filters"] - Droppable ID для react-beautiful-dnd
 */
function CustomFiltersList({
                               filterOrder = [],
                               filters = {},
                               onPinToggle = () => {},
                               onApply = () => {},
                               onEdit = () => {},
                               onDelete = () => {},
                               showAddButton = false,
                               onAdd = () => {},
                               showCloseButton = false,
                               onClose = () => {},
                               noFiltersHint = 'No custom filters were added yet',
                               droppableId = 'custom-filters',
                           }) {
    return (
        <div className="list-wrap">
            <Droppable droppableId={droppableId}>
                {(provided) => (
                    <div
                        className="list-items"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {filterOrder.length > 0 ? (
                            filterOrder.map((id, index) => {
                                const one = filters[id];
                                if (!one) return null; // про всяк випадок

                                return (
                                    <Draggable key={id} draggableId={String(id)} index={index}>
                                        {(draggableProvided) => (
                                            <div
                                                className="flex-container filter-row"
                                                ref={draggableProvided.innerRef}
                                                {...draggableProvided.draggableProps}
                                                {...draggableProvided.dragHandleProps}
                                            >
                                                <span className="filter-name">{one.name}</span>

                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={!!one.isPinned}
                                                        onChange={() => onPinToggle(one.id, !one.isPinned)}
                                                    />
                                                </label>

                                                <TippyWrapper content={<div className="hint-popup">Apply Filter</div>}>
                                                    <div
                                                        className="icon-content run-icon interface-icon small"
                                                        onClick={() => onApply(one.id)}
                                                    >
                                                        <img src="icons/interface/filter.png" alt="Apply Filter" />
                                                    </div>
                                                </TippyWrapper>

                                                {!one.isRequired ? (
                                                    <>
                                                        <TippyWrapper content={<div className="hint-popup">Edit Filter</div>}>
                                                            <div
                                                                className="icon-content edit-icon interface-icon small"
                                                                onClick={() => onEdit(one.id)}
                                                            >
                                                                <img src="icons/interface/edit-icon.png" alt="Edit Filter" />
                                                            </div>
                                                        </TippyWrapper>

                                                        <TippyWrapper content={<div className="hint-popup">Delete Filter</div>}>
                                                            <div
                                                                className="icon-content edit-icon interface-icon small"
                                                                onClick={() => onDelete(one.id)}
                                                            >
                                                                <img src="icons/interface/delete.png" alt="Delete Filter" />
                                                            </div>
                                                        </TippyWrapper>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span />
                                                        <span className="hint yellow">Required</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                );
                            })
                        ) : (
                            <p className="hint">{noFiltersHint}</p>
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>

            {(showAddButton || showCloseButton) && (
                <div className="buttons">
                    {showAddButton && (
                        <button onClick={onAdd}>Add</button>
                    )}
                    {showCloseButton && (
                        <button onClick={onClose}>Close</button>
                    )}
                </div>
            )}
        </div>
    );
}

export default CustomFiltersList;
