import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Homepage from "./Homepage";
import FeatureSection from "./FeatureSection";
import CollectionSection from "./CollectionSection";
import ContactSection from "./ContactSection";

function Landing() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleGetStarted = () => navigate("/register");
  const handleSignIn = () => navigate("/login");
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="overflow-x-hidden">
      <title>Scene Weaver</title>
      
      <Navbar 
        toggleMenu={toggleMenu} 
        isMenuOpen={isMenuOpen} 
        handleSignIn={handleSignIn} 
        handleGetStarted={handleGetStarted} 
      />
      
      <Homepage handleGetStarted={handleGetStarted} />
      <FeatureSection />
      <CollectionSection />
      <ContactSection />
      
      {/* Scroll Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          var prevScrollpos = window.pageYOffset;
          window.onscroll = function () {
            var currentScrollPos = window.pageYOffset;
            if (window.innerWidth > 768) { // Only apply to desktop
              document.querySelector("nav").style.top = prevScrollpos > currentScrollPos ? "0" : "-50px";
            }
            prevScrollpos = currentScrollPos;
          };`,
        }}
      />
    </div>
  );
}

export default Landing;