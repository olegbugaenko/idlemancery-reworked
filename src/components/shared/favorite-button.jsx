import React, { useContext, useCallback, useMemo } from "react";
import WorkerContext from "../../context/worker-context";
import { useWorkerClient } from "../../general/client";
import { CustomButton } from "./buttons/custom-button.jsx";

const FavoriteButtonComponent = ({ type, id, isFavorite = false, className = "" }) => {
    const worker = useContext(WorkerContext);
    const { sendData } = useWorkerClient(worker);

    const toggleFavorite = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        sendData('toggle-favorite', { type, id });
    }, [type, id, sendData]);

    const favoriteClassName = useMemo(() => (
        `favorite-btn ${isFavorite ? 'favorited' : ''} ${className}`.trim()
    ), [className, isFavorite]);

    return (
        <CustomButton
            iconId="favorite"
            className={favoriteClassName}
            onClick={toggleFavorite}
        >
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </CustomButton>
    );
};

const areFavoriteButtonPropsEqual = (prevProps, nextProps) => (
    prevProps.type === nextProps.type
    && prevProps.id === nextProps.id
    && prevProps.isFavorite === nextProps.isFavorite
    && prevProps.className === nextProps.className
);

export const FavoriteButton = React.memo(FavoriteButtonComponent, areFavoriteButtonPropsEqual);
