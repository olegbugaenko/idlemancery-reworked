import React, { useEffect, useState, useRef } from "react";

export const SearchField = ({ value, onSetValue, scopes, placeholder }) => {
    const [search, setSearch] = useState(value?.search);
    const [selectedScopes, setSelectedScopes] = useState(null);
    const [isScopesOpened, setScopesOpened] = useState(true);

    const popupRef = useRef(null);

    useEffect(() => {
        if(!selectedScopes && value.selectedScopes) {
            setSelectedScopes(value.selectedScopes)
        }
    }, [value]);

    useEffect(() => {
        // skip set data c
        if(!Array.isArray(selectedScopes)) return;

        onSetValue({
            search,
            selectedScopes,
        });
    }, [search, selectedScopes]);

    useEffect(() => {
        if (search) {
            setScopesOpened(true);
        } else {
            setScopesOpened(false);
        }
    }, [search]);

    const onToggleScope = (id) => {
        console.log('Scopes: ', scopes, selectedScopes);
        if (scopes.map((s) => s.id).includes(id)) {
            const newScopes = [...selectedScopes];
            if (!newScopes.includes(id)) {
                newScopes.push(id);
            } else {
                newScopes.splice(newScopes.indexOf(id), 1);
            }
            setSelectedScopes(newScopes);
        }
    };

    const onChangeSearch = (e) => {
        setSearch(e.target.value.toLowerCase());
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
