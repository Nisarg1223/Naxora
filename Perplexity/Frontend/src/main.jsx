import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '../src/app/App.jsx'
import { store } from './app/app.stores.jsx'
import {Provider} from 'react-redux';

createRoot(document.getElementById('root')).render(

    <Provider store={store}>
    <App />
    </Provider>
  
)
