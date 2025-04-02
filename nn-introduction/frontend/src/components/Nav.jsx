import { NavLink } from "react-router-dom";
import styles from "./Nav.module.css";
function Nav() {
  return (
    <nav className={styles.nav}>
      <ul>
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        <li>
          <NavLink to="/PreviewTestImages">Preview Test Images</NavLink>
        </li>
        <li>
          <NavLink to="/ImagePrediction">Image Prediction</NavLink>
        </li>
        <li>
          <NavLink to="/ImagePredictionMlp">Image Prediction Mlp</NavLink>
        </li>
        <li>
          <NavLink to="/TestPerceptron">Test Perceptron</NavLink>
        </li>
      </ul>
    </nav>
  );
}
export default Nav;
