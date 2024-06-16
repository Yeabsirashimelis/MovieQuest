import { useState, useEffect } from "react";

export function useLocalStorageState(initialState, key) {
  const [value, storedValue] = useState(function () {
    //when we use the local storage, we must pass a callback function in order to set a value
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialState; //the react always uses the returned thing as the initial value of the state
  });

  useEffect(
    //we don't need to manually  delete the remove item form the list when we use effects, b/c it sets each updated movies item on the local storage
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key]
  );

  return [value, storedValue];
}
