import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {AppProvider} from "./context/ui-context";

ReactDOM.render(<AppProvider><App /></AppProvider>, document.getElementById('root'));
