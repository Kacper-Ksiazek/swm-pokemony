import type { BodyDetails } from "../types";

export const DETAILS_BY_BODY_ID: Record<string, BodyDetails> = {
  sun: {
    category: "Gwiazda · Żółty karzeł",
    description:
      "Centralna gwiazda Układu Słonecznego skupiająca 99,86% jego masy. W jej jądrze wodór zamienia się w hel, dostarczając energię wszystkim planetom.",
    facts: [
      { label: "Średnica", value: "1,39 mln km", earthRef: "109,3× Ziemi" },
      { label: "Masa", value: "1,99 × 10³⁰ kg", earthRef: "333 000× Ziemi" },
      { label: "Grawitacja", value: "274 m/s²", earthRef: "27,9× Ziemi" },
    ],
  },
  mercury: {
    category: "Planeta skalista",
    description:
      "Najmniejsza i najbliższa Słońcu planeta, pokryta kraterami przypominającymi Księżyc. Brak gęstej atmosfery powoduje skrajne różnice temperatur między dniem a nocą.",
    facts: [
      { label: "Średnica", value: "4 879 km", earthRef: "0,38× Ziemi" },
      { label: "Masa", value: "3,30 × 10²³ kg", earthRef: "0,055× Ziemi" },
      { label: "Rok", value: "88 dni", earthRef: "0,24× Ziemi" },
    ],
  },
  venus: {
    category: "Planeta skalista",
    description:
      "Najgorętsza planeta Układu Słonecznego przez gęstą atmosferę z dwutlenku węgla i silny efekt cieplarniany. Obraca się wokół własnej osi w kierunku przeciwnym do większości planet.",
    facts: [
      { label: "Średnica", value: "12 104 km", earthRef: "0,95× Ziemi" },
      { label: "Masa", value: "4,87 × 10²⁴ kg", earthRef: "0,82× Ziemi" },
      { label: "Rok", value: "224,7 dnia", earthRef: "0,62× Ziemi" },
    ],
  },
  earth: {
    category: "Planeta skalista",
    description:
      "Trzecia planeta od Słońca i jedyne znane miejsce z ciekłą wodą na powierzchni oraz życiem. Jej pole magnetyczne chroni atmosferę przed wiatrem słonecznym.",
    facts: [
      { label: "Średnica", value: "12 742 km" },
      { label: "Masa", value: "5,97 × 10²⁴ kg" },
      { label: "Rok", value: "365,25 dnia" },
    ],
  },
  moon: {
    category: "Naturalny satelita Ziemi",
    description:
      "Jedyny naturalny satelita Ziemi i piąty co do wielkości księżyc w Układzie Słonecznym. Jego grawitacja napędza ziemskie pływy i stabilizuje nachylenie osi naszej planety.",
    facts: [
      { label: "Średnica", value: "3 474 km", earthRef: "0,27× Ziemi" },
      { label: "Masa", value: "7,35 × 10²² kg", earthRef: "0,012× Ziemi" },
      { label: "Grawitacja", value: "1,62 m/s²", earthRef: "0,17× Ziemi" },
    ],
  },
  iss: {
    category: "Załogowa stacja orbitalna",
    description:
      "Międzynarodowa Stacja Kosmiczna krąży po niskiej orbicie okołoziemskiej z prędkością ok. 27 600 km/h, wykonując około 16 okrążeń Ziemi na dobę.",
    facts: [
      { label: "Rozpiętość", value: "109 m", earthRef: "117 tys.× mniejsza" },
      { label: "Masa", value: "~420 t", earthRef: "7 × 10⁻¹⁹× Ziemi" },
      { label: "Obieg", value: "93 min", earthRef: "15,5× / dobę" },
    ],
  },
  mars: {
    category: "Planeta skalista",
    description:
      "Czerwona Planeta zawdzięcza barwę tlenkom żelaza w pyle pokrywającym jej powierzchnię. Znajduje się tu Olympus Mons — najwyższy znany wulkan w Układzie Słonecznym.",
    facts: [
      { label: "Średnica", value: "6 779 km", earthRef: "0,53× Ziemi" },
      { label: "Masa", value: "6,42 × 10²³ kg", earthRef: "0,11× Ziemi" },
      { label: "Rok", value: "687 dni", earthRef: "1,88× Ziemi" },
    ],
  },
  jupiter: {
    category: "Gazowy olbrzym",
    description:
      "Największa planeta Układu Słonecznego, zbudowana głównie z wodoru i helu. Słynie z Wielkiej Czerwonej Plamy — gigantycznego anticyklonu większego od Ziemi.",
    facts: [
      { label: "Średnica", value: "139 820 km", earthRef: "10,97× Ziemi" },
      { label: "Masa", value: "1,90 × 10²⁷ kg", earthRef: "317,8× Ziemi" },
      { label: "Rok", value: "11,9 lat", earthRef: "11,9× Ziemi" },
    ],
  },
  saturn: {
    category: "Gazowy olbrzym",
    description:
      "Druga co do wielkości planeta, znana z rozległego systemu pierścieni z lodu i skał. Ma najmniejszą średnią gęstość spośród wszystkich planet — mniejszą niż woda.",
    facts: [
      { label: "Średnica", value: "116 460 km", earthRef: "9,14× Ziemi" },
      { label: "Masa", value: "5,68 × 10²⁶ kg", earthRef: "95,2× Ziemi" },
      { label: "Rok", value: "29,5 lat", earthRef: "29,5× Ziemi" },
    ],
  },
  uranus: {
    category: "Lodowy olbrzym",
    description:
      "Błękitno-zielony lodowy olbrzym zawierający metan w atmosferze. Jego oś obrotu jest nachylona niemal równolegle do płaszczyzny orbity, więc planeta „toczy się” wokół Słońca.",
    facts: [
      { label: "Średnica", value: "50 724 km", earthRef: "3,98× Ziemi" },
      { label: "Masa", value: "8,68 × 10²⁵ kg", earthRef: "14,5× Ziemi" },
      { label: "Rok", value: "84 lata", earthRef: "84× Ziemi" },
    ],
  },
  neptune: {
    category: "Lodowy olbrzym",
    description:
      "Najdalsza z głównych planet Układu Słonecznego, o intensywnie niebieskim kolorze. Wieje na nim najszybszy wiatr spośród wszystkich planet — przekraczający 2 000 km/h.",
    facts: [
      { label: "Średnica", value: "49 244 km", earthRef: "3,86× Ziemi" },
      { label: "Masa", value: "1,02 × 10²⁶ kg", earthRef: "17,1× Ziemi" },
      { label: "Rok", value: "164,8 lat", earthRef: "165× Ziemi" },
    ],
  },
};
