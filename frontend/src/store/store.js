import { configureStore } from '@reduxjs/toolkit';
import { storefrontApi } from '../services/storefrontApi';

export const store = configureStore({
  reducer: {
    [storefrontApi.reducerPath]: storefrontApi.reducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(storefrontApi.middleware),
});
