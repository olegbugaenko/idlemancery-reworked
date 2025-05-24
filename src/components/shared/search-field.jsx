import React, { useEffect, useState, useRef } from "react";

export const SearchField = ({ value, onSetValue, scopes, placeholder }) => {
    const [search, setSearch] = useState(value?.search);
    const [selectedScopes, setSelectedScopes] = useState(null);
    const [isScopesOpened, setScopesOpened] = useState(false);

    const popupRef = useRef(null);

    useEffect(() => {
        if(!selectedScopes && value.selectedScopes && Array.isArray(value.selectedScopes)) {
            setSelectedScopes(value.selectedScopes)
        }
        setSearch(value?.search);
    }, [value?.search, value?.selectedScopes ? JSON.stringify(value?.selectedScopes ?? []) : '']);

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

    const onChangeSearch = (e) => {

        onSetValue({
            search: e.target.value.toLowerCase(),
            selectedScopes,
        });

        console.log('OPening')
        setScopesOpened(true);
    };

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
                    onChange={onChangeSearch}
                    onClick={() => setScopesOpened(true)}
                />
                <span className={'clear'} onClick={() => { setSearch('') }}>X</span>
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
