/* eslint-disable react-refresh/only-export-components */
import "./styles/index.scss";
import { Routing } from "../pages";
import { withProviders } from "./providers";

const App = () => {
  return (
    <div className="app">
      <Routing />
    </div>
  );
};

export default withProviders(App);
