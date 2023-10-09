import React from "react";
import "../Tokens.css";
import tokenList from "../tokenList.json";

function Tokens() {
  return (
    <div className="tokens">
      <h2>Token List</h2>
      <ul className="list-group">
        <li className="list-group-info">
          <p>#</p>
          <p>Token Name</p>
        </li>
        {tokenList.map((token, index) => (
          <li key={index}>
            <div className="list-group-item">
              <p>{index + 1}</p>
              <img src={token.img} alt={token.ticker} className="token-logo" />
              <h4>{token.name}</h4>
              <p>{token.ticker}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Tokens;
