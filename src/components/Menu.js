import "./Menu.css";
import "./Instructions"
import Instructions from "./Instructions";

const Menu = ({ onClick }) => (
  <div className="Menu">
    <Instructions/>
    <button className="Button" onClick={onClick}>
      Play Tetris
    </button>
  </div>
);

export default Menu;
