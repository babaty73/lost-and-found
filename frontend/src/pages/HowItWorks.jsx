import { Link } from "react-router-dom";
import "./HowItWorks.css";

// Replaces the old "Dashboard" page, which showed a "Retrieved Items" stat
// that was never actually wired to any backend field and always read zero.
// This page is public (no login exists for students) and explains the
// process instead of showing a fake counter.
function HowItWorks() {
  return (
    <div className="dashboard-container">
      <h1 className="fade-in">How It Works</h1>
      <p className="how-it-works-intro fade-in">
        The ASTU Student Union Lost &amp; Found office physically receives, stores, and
        releases items. This site helps you report, search, and stay in the loop — it
        never gives anyone physical possession of an item on its own.
      </p>

      <div className="how-it-works-steps">
        <div className="how-it-works-step fade-in">
          <h2>1. Lost something?</h2>
          <p>
            <Link to="/report-lost">Report it</Link> with a description and your
            institutional student ID. No account or password needed.
          </p>
        </div>

        <div className="how-it-works-step fade-in">
          <h2>2. Found something?</h2>
          <p>
            Bring it to the ASTU Student Union Lost &amp; Found office. Staff will
            register it, and it will appear in the <Link to="/found-items">found items list</Link>.
          </p>
        </div>

        <div className="how-it-works-step fade-in">
          <h2>3. Think you see your item?</h2>
          <p>
            Open its listing and submit a claim. You'll explain why you believe it's
            yours (or describe it if you're helping a friend recover it).
          </p>
        </div>

        <div className="how-it-works-step fade-in">
          <h2>4. Student Union reviews</h2>
          <p>
            The office reviews every claim on an item — there can be more than one —
            and decides which, if any, is verified. Submitting a claim never
            guarantees the item is released to you.
          </p>
        </div>

        <div className="how-it-works-step fade-in">
          <h2>5. Verified? Visit in person</h2>
          <p>
            If your claim is verified, visit the Student Union with your institutional
            student ID. Staff confirm your identity in person before releasing anything.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;
