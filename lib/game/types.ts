export type Round = {
  id: string;
  image: string;
  lat: number;
  lng: number;
  city: string;
  region: string;
  country: string;
  source: "windy";
};

export type Guess = {
  lat: number;
  lng: number;
};

