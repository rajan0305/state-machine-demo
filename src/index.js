import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { inspect } from '@xstate/inspect';

console.clear();

// inspect({
//   iframe: false
// });

const rootElement = document.getElementById('root');
ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  rootElement
);
