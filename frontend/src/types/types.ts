export interface IFix {
  fix_name: string;
  min_alt: string;
  max_alt: string;
  x: number;
  y: number;
}

export interface IChart {
  _id: string;
  airport_id: string;
  name: string;
  type: "SID" | "STAR";
  map_url: string;
  fixes: IFix[];
}

export interface IGameMode {
  guessFixes: boolean;
  guessAlts: boolean;
}
