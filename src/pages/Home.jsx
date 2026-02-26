import "./Home.css";
import image from "../assets/shocked.jpg";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-container">
      <div className="home-hero">
        <div className="home-text">
          <h1>Welcome to ASTU Digital <br />"Lost & Found"</h1>

          <p className="home-description">
            Worried about losing your belongings on campus? Don’t stress!{" "}
            <strong>ASTU Digital Lost & Found</strong> makes it easy to report 
            items you’ve found or lost, search for recovered belongings, 
            and help your fellow students get their property back quickly.{" "}
            <em>Your campus life just got safer and smarter!</em>
          </p>

          <div className="home-buttons">
            <Link to="/report-lost">
              <button className="home-button">Report Found Item</button>
            </Link>

            <Link to="/report-found">
              <button className="home-button">Search for Found Items</button>
            </Link>
          </div>
        </div>

        <div className="home-image-container">
          <img src={image} alt="Shocked" className="home-image" />
        </div>
      </div>
    </div>
  );
}

export default Home;
