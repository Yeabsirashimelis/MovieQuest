import { useEffect, useRef, useState } from "react";
import StarRating from "./starRatings";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const key = "133fa226";

export default function App() {
  const [query, setQuery] = useState("");

  const [selectedId, setSelectedId] = useState(null);

  const { movies, isLoading, error } = useMovies(query);

  const [watched, setWatched] = useLocalStorageState([], "watched");

  /*
  //JUST A REFERENCE
  useEffect(function () {
    console.log("after initial render only");
  }, []);
  useEffect(function () {
    console.log("after every render");
  });
  useEffect(
    function () { 
      console.log("if query changes");
    },
    [query]
  );
  console.log("during render");
  */

  function handleSelectMovie(id) {
    // setSelectedId((selectedId) =>
    //   id === selectedId ? setSelectedId(null) : setSelectedId(id)
    // );
    setSelectedId(id === selectedId ? null : id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatchedMovie(movie) {
    setWatched((watched) => [...watched, movie]);
    //when we use the event handler function we need to manually delete the remove elements on the local storage
    //localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((watched) => watched.imdbID !== id));
  }

  return (
    <>
      {/* by using component composition we can reduce prop drilling */}
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} handleSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetials
              selectedId={selectedId}
              handleCloseMovie={handleCloseMovie}
              handleAddWatchedMovie={handleAddWatchedMovie}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                handleDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>🚫</span>
      {message}
    </p>
  );
}

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);
  // useEffect(function () {
  //   const el = document.querySelector(".search");
  //   el.focus();
  // }, []);

  useEffect(
    function () {
      function callBack(e) {
        if (document.activeElement === inputEl.current) return;
        if (e.code === "Enter") {
          inputEl.current.focus();
          setQuery("");
        }
      }
      document.addEventListener("keydown", callBack);
      return () => document.addEventListener("keydown", callBack);
    },
    [setQuery]
  );

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  //REUSEABLE COMPONENT FOR THE TWO MAIN BOXES
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, handleSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          handleSelectMovie={handleSelectMovie}
          key={movie.imdbID}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, handleSelectMovie }) {
  return (
    <li onClick={() => handleSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetials({
  selectedId,
  handleCloseMovie,
  handleAddWatchedMovie,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const countRef = useRef(0);

  useEffect(
    function () {
      if (userRating) countRef.current = countRef.current + 1;
    },
    [userRating]
  );

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  function handleAdd() {
    const newWathcedMovie = {
      imdbID: selectedId,
      Title: movie.Title,
      Year: movie.Year,
      Poster: movie.Poster,
      imdbRating: Number(movie.imdbRating),
      Runtime: movie.Runtime,
      userRating,
      countRatingDescions: countRef.current,
    };

    handleAddWatchedMovie(newWathcedMovie);
    handleCloseMovie(null);
  }

  /*
       JUST FORBIDDEN (IN STATE RULES)

  if(imdbRating > 8) const[isTop, setIsTop] = useState(true)
  const [isTop, setIsTop] = useState(movie.imdbRating > 8); // will not setted to true, even if it finds a movie rating greater than 8. unless we use the setter function down below
  console.log(isTop);
  */

  useKey("Escape", handleCloseMovie);

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          ` http://www.omdbapi.com/?apikey=${key}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!movie) return; //not to see undefined on the title if the movies array is empty
      document.title = `Movie ${movie?.Title}`;
      //cleaning up function
      return function () {
        document.title = "usePopcorn";
      };
    },
    [movie]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={handleCloseMovie}>
              ⬅
            </button>
            <img src={movie.Poster} alt={`poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{movie.Title}</h2>
              <p>
                {movie.Released} &bull; {movie.Runtime}
              </p>
              <p>{movie.Genre}</p>
              <p>
                <span>⭐</span>
                {movie.imdbRating} imdb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      Add to List
                    </button>
                  )}
                </>
              ) : (
                <p>You rated this movie {watchedUserRating}⭐ </p>
              )}
            </div>
            <p>
              <em>{movie.Plot}</em>
            </p>
            <p>Starring {movie.Actors}</p>
            <p>Directed by {movie.Director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(
    watched.map((movie) => Number(movie.Runtime.split(" ")[0]))
  );

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime}min </span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, handleDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          handleDeleteWatched={handleDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, handleDeleteWatched }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.Runtime}</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => handleDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

/*
component composition:combining different components
    using the children prop (or explicitly defined props)
*/

/*
         Component(instance) life cycle
MOUNT/INITIAL RENDER     =>   RE-RENDER(optional)    =>   UNMOUNT/DIES  
-fresh states adn props     -state changes              -state and props are destroyed
-are created                -props change
                            -parent re-renders
                            -context changes

*/

/*
REMEMBER - SIDE EFFECT should not happen during rendering
A side effect is basically any "interacction b/n react component and the world outside the component."
  we can also think of a side as "code that actually does sth". examples:data fetching, setting up subscriptions,
    setting up timers, manually accesing the DOM

effect allow us to write code that will run at different moments: mout, re-render, or unmount

*/

/* If we want to fetch data after a certain event happens, just use the use the EVENT HANDLER FUNCIONS to fetch the data
 And use USEEFFECT if we want to excute after the component is mounted/rendered 
 REMEMBER - PREFERRED WAY OF CREATING SIDE EFFECTS IS THE EVENT HANDLER FUNCTION
 */

/*
     useEffect cleanup funcion
 -function that we can return from an effect (optional
  runs on to two different occasions:
     1,before the effect is excuted again to clean up the results of the previous side effects
     2,After a component has unmounted   
clean up function is neccessary when the side effect keeps happening after the component has been re-rendered or unmounted

-Each effect should do only one thing! use one useEffect hook for each side effect this makes effects easier to clean up
 */

/*
       RULES OF HOOKS
 1,DON'T CALL HOOKS AT THE TOP LEVEL(call here means just declaring them)
    -don't call hooks inside conditionals, loops and nested functions or sfter any early return
 2, only call hooks inside a function component or a custom hook
*/

/*   
     SUMMARY OF STATE
1.creating a state - with the usual way or with the callback function(pure with out arguments) if the value is depends on some computations like reaading from the local storage
2.updating the state - using the setter function simply by passing values(simple way) or a call back functions if the updated result us depends on the previously setted(current state) results
   -make sure to not mutate objects or arrays, but replace them
 */

/*
    REF with useref
  -box (object) with a mutable.current property that is persisted accros renders ("normal variables are always reset")
    to=wo big use cases
  1,creating a varibale that stays the same between  renders (e.g previous state, setTimeout id,etc...)
  2,selecting and storing DOM elements 
Refs are for data that is not rendered:usually only appear in the event handlers or effects, not in JSX (otherwise use state)

similarity and difference b/n refs and state
  similarity :
  -both persists across renders
  Difference : updating causes re-render in state but no the case in the refs
  remember : the data changes at some point in the refs like states, but we only want the browser to understand the changes, not to render something
  -unlike states, refs undating is synchronous
   */
