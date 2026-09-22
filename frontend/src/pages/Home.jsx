import "./Home.css";
import image from "../assets/shocked.jpg";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-container">
      <div className="home-hero">
        <div className="home-text">
          <h1>
            Welcome to ASTU Digital <br />
            "Lost &amp; Found"
          </h1>

          <p className="home-description">
            Lost something on campus? Report it in a couple of minutes — no account
            needed. Found something? Report it online, then bring it to the ASTU
            Student Union Lost &amp; Found office to complete the handover.
          </p>

          <div className="home-buttons">

            <Link to="/report-found">
              <button className="home-button">Found something? Report it.</button>
            </Link>

            <Link to="/found-items">
              <button className="home-button">Looking for something? Search found items.</button>
            </Link>
          </div>

          <p className="home-note">
            Reporting a found item online is only step one — it stays private until
            you bring the physical item to the <strong>ASTU Student Union Lost &amp; Found
            office</strong>. Once the office receives it, it's published here so its
            owner can find it.
          </p>
        </div>

        <div className="home-image-container">
          <img src={image} alt="Student surprised after losing a personal item" className="home-image" />
        </div>
      </div>
    </div>
  );
}

export default Home;
