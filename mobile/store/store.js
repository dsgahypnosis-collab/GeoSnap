import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import rockReducer from './slices/rockSlice';
import gamificationReducer from './slices/gamificationSlice';
import geologistReducer from './slices/geologistSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    rocks: rockReducer,
    gamification: gamificationReducer,
    geologist: geologistReducer,
  },
});

export default store;