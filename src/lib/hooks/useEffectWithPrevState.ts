import { DependencyList, useEffect, useRef } from "react";

export default function useEffectWithPrevState(
  effect: (previous: DependencyList) => void,
  deps: DependencyList
) {
  const prevDeps = useRef(deps);

  useEffect(() => {
    const unmountHandler = effect(prevDeps.current);
    prevDeps.current = deps;
    return unmountHandler;
  }, deps);
}
