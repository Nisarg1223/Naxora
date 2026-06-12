import {configureStore} from '@reduxjs/toolkit'
import authReducer from './auth.slice.js';
import chatReducer from './features/chat/chat.slice.js'

export const store = configureStore({
    reducer:{
        auth:authReducer,
        chat:chatReducer
    }
})