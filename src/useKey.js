import { useEffect } from "react";

export function useKey(key, action) {
  useEffect(
    function () {
      function callBack(e) {
        if (e.code.toLowerCase() === key.toLowerCase()) {
          action();
        }
      }
      document.addEventListener("keydown", callBack);
      return function () {
        //we remove the event listener b/c each time this effect is excuted the same function is created and added to the document
        document.removeEventListener("keydown", callBack);
      };
    },
    [action, key]
  );
}
