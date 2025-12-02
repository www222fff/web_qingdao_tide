export interface TideData {
  time: string;
  height: number;
  type: string;
}

export interface TideDay {
  date: string;
  type: string;
  data: TideData[];
}

export interface TideResponse {
  hourly?: {
    time: string[];
    sea_level_height_msl: number[];
  };
}
