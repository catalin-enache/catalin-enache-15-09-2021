import "../styles/global.css";
import { Provider } from "react-redux";
import type { AppProps } from "next/app";
import { store } from "../state/store";
// import { enableMapSet } from "immer";
// enableMapSet(); //  if using JS Maps

function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default App;
