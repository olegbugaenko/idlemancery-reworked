import React, { useEffect, useLayoutEffect, useState, useRef } from "react";

export const SearchField = ({ value, onSetValue, scopes, placeholder }) => {
    const [search, setSearch] = useState(value?.search || '');
    const [selectedScopes, setSelectedScopes] = useState(() => Array.isArray(value?.selectedScopes) ? value.selectedScopes : []);
    const [isScopesOpened, setScopesOpened] = useState(false);

    const popupRef = useRef(null);
    const inputRef = useRef(null);
    const caretPositionRef = useRef(null);

    useEffect(() => {
        if (Array.isArray(value?.selectedScopes)) {
            setSelectedScopes((prev) => {
                if (prev?.length === value.selectedScopes.length && prev.every((id, index) => id === value.selectedScopes[index])) {
                    return prev;
                }
                return [...value.selectedScopes];
            });
        }

        const nextSearch = value?.search ?? '';
        setSearch((prev) => (prev === nextSearch ? prev : nextSearch));
    }, [value?.search, value?.selectedScopes]);

    useEffect(() => {
        // skip set data c
        if(!Array.isArray(selectedScopes)) return;


    }, [search, selectedScopes]);

    const onToggleScope = (id) => {
        if (scopes.map((s) => s.id).includes(id)) {
            const newScopes = [...selectedScopes];
            if (!newScopes.includes(id)) {
                newScopes.push(id);
            } else {
                newScopes.splice(newScopes.indexOf(id), 1);
            }
            setSelectedScopes(newScopes);

            onSetValue({
                search,
                selectedScopes: newScopes,
            });
        }
    };

    const clearValue = () => {
        onSetValue({
            search: '',
            selectedScopes,
        })
        setSearch('');
    }

    const onChangeSearch = (e) => {
        const newValue = e.target.value.toLowerCase();
        caretPositionRef.current = e.target.selectionStart;
        setSearch(newValue);
        
        // Update parent component with debounced approach
        onSetValue({
            search: newValue,
            selectedScopes,
        });

        console.log('OPening')
        setScopesOpened(true);
    };

    useLayoutEffect(() => {
        if (caretPositionRef.current !== null && inputRef.current) {
            const position = caretPositionRef.current;
            caretPositionRef.current = null;
            inputRef.current.setSelectionRange(position, position);
        }
    }, [search]);

    const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            setScopesOpened(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    return (
        <div className="search-rel-wrap" ref={popupRef}>
            <div className={'search-input-wrap'}>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={search}
                    ref={inputRef}
                    onChange={onChangeSearch}
                    onClick={() => setScopesOpened(true)}
                />
                <span className={'clear'} onClick={() => { clearValue() }}>X</span>
            </div>
            {isScopesOpened && scopes?.length ? (
                <div className="scopes-popup">
                    <span className="title">Search by: </span>
                    <div className="chips-container">
                        {scopes.map((scope) => (
                            <div
                                key={scope.id}
                                className={`scope-chips ${selectedScopes && selectedScopes.includes(scope.id) ? "selected" : ""}`}
                                onClick={() => onToggleScope(scope.id)}
                            >
                                {scope.label}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
};
