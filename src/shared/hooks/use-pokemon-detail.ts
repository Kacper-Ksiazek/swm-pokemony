import { useEffect, useRef, useState } from "react";

import { fetchPokemonDetail, type PokemonDetail } from "@/data/pokemon-api";

type DetailState = {
  detail: PokemonDetail | null;
  loading: boolean;
  error: string | null;
};

const idleState: DetailState = {
  detail: null,
  loading: false,
  error: null,
};

export function usePokemonDetail(pokemonId: number | null) {
  const [state, setState] = useState<DetailState>(idleState);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (pokemonId === null) {
      requestIdRef.current += 1;
      return;
    }

    loadPokemonDetail(pokemonId, requestIdRef, setState);
  }, [pokemonId]);

  function retryDetail() {
    if (pokemonId === null) {
      return;
    }

    loadPokemonDetail(pokemonId, requestIdRef, setState);
  }

  const effectiveState = pokemonId === null ? idleState : state;

  return {
    detail: effectiveState.detail,
    detailLoading: effectiveState.loading,
    detailError: effectiveState.error,
    retryDetail,
  };
}

function loadPokemonDetail(
  id: number,
  requestIdRef: { current: number },
  setState: (state: DetailState) => void,
) {
  const requestId = requestIdRef.current + 1;
  requestIdRef.current = requestId;

  setState({ detail: null, loading: true, error: null });

  void fetchPokemonDetail(id)
    .then((detail) => {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setState({ detail, loading: false, error: null });
    })
    .catch((error) => {
      if (requestIdRef.current !== requestId) {
        return;
      }

      const message = error instanceof Error ? error.message : "Failed to load Pokémon details";

      setState({ detail: null, loading: false, error: message });
    });
}
