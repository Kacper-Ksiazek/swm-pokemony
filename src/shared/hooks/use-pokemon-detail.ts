import { useCallback, useEffect, useRef, useState } from "react";

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

  const loadDetail = useCallback(async (id: number) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setState({ detail: null, loading: true, error: null });

    try {
      const detail = await fetchPokemonDetail(id);

      if (requestIdRef.current !== requestId) {
        return;
      }

      setState({ detail, loading: false, error: null });
    } catch (error) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      const message = error instanceof Error ? error.message : "Failed to load Pokémon details";

      setState({ detail: null, loading: false, error: message });
    }
  }, []);

  useEffect(() => {
    if (pokemonId === null) {
      requestIdRef.current += 1;
      setState(idleState);
      return;
    }

    void loadDetail(pokemonId);
  }, [pokemonId, loadDetail]);

  const retry = useCallback(() => {
    if (pokemonId === null) {
      return;
    }
    void loadDetail(pokemonId);
  }, [pokemonId, loadDetail]);

  return {
    detail: state.detail,
    detailLoading: state.loading,
    detailError: state.error,
    retryDetail: retry,
  };
}
