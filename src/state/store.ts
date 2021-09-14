import {
  Action,
  configureStore,
  ThunkAction,
  combineReducers,
} from "@reduxjs/toolkit";
import { streamingMiddleware } from "./middlewares/streaming/streaming.midleware";
import { orderBookReducer } from "../features/order-book/state";
import { processEventCb, getBufferedDataCb } from "./bufferedMessagesHandlers";

const rootReducer = combineReducers({
  orderBook: orderBookReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      streamingMiddleware(0, processEventCb, getBufferedDataCb)
    ),
});

export type AppDispatch = typeof store.dispatch;
// export type RootState = ReturnType<typeof store.getState>; // from docs
export type RootState = ReturnType<typeof rootReducer>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// AppThunk usage if needed:
// const sendMessage = (message: string): AppThunk<void> => {
//   return (dispatch, getState) => {
//     const state = getState(); // read something from state with type hints
//     setTimeout(() => {
//       dispatch({
//         type: "foo",
//         payload: message,
//       });
//     }, 1000);
//   };
// };
// ....
// <button onClick={() => dispatch(sendMessage("hi there"))}> Hi </button>
