import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/ui-context';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
        <AppProvider>
            <App />
        </AppProvider>
);

