import "./styles.css";
import Game from "./components/Game";
import TrainPage from "./train";

export default function App() {
  return (
    <div className="App">
      <Game rows={20} columns={10} />
      {/* <TrainPage/> */}
    </div>
  );
}
