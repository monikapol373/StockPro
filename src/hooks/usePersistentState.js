import { useState, useEffect } from "react";
import { apiEnabled, apiGet, apiPut } from "../utils/syncApi";

function usePersistentState(key, initialValue, validate) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return initialValue;
      const parsed = JSON.parse(saved);
      if (validate && !validate(parsed)) return initialValue;
      return parsed;
    } catch {
      return initialValue;
    }
  });
  const [ready, setReady] = useState(!apiEnabled);

  // 1. page load par server se data lao (server ka data local se upar maana jata hai)
  useEffect(() => {
    if (!apiEnabled) return;
    let cancelled = false;
    apiGet(key)
      .then((res) => {
        if (cancelled) return;
        if (res.found && (!validate || validate(res.value))) setValue(res.value);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // 2. har badlav par localStorage mein likho, aur server par bhejo (thoda ruk kar)
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full ya blocked */
    }
    if (!apiEnabled || !ready) return;
    const t = setTimeout(() => {
      apiPut(key, value).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [key, value, ready]);

  return [value, setValue];
}

export default usePersistentState;