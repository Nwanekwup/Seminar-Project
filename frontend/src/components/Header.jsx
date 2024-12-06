import React from "react";
import { Link, useParams } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const { userId } = useParams();
  return (
    <header className="header">
      <h1>RhythME</h1>
      <nav className="navbar">
        <ul>
          <li>
            <Link to={`/home/${userId}`}>Home</Link>
          </li>
          <li>
            <Link to={`/search/${userId}`}>Music Recommendations</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;