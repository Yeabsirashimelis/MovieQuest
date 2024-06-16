import React, { useState } from "react";
import ReactDOM from "react-dom/client";
//import StarRatings from "./starRatings";
import "./index.css";
import App from "./App";

// function Test() {
//   const [movieRating, setMovieRating] = useState(0);
//   return (
//     <div>
//       <StarRatings color="blue" maxRating={10} onSetRating={setMovieRating} />
//       <p>this movie is rated {movieRating}</p>
//     </div>
//   );
// }

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRatings
      maxRating={5}
      messages={["terrible", "bad", "good", "Very good", "Amazing"]}
      defaultRating={3}
    />
    <StarRatings maxRating={10} color="red" size="50" className="something" />
    <Test /> */}
  </React.StrictMode>
);
