export type Point = {
  id: string;
  name: string;
  location: {
    lat: number;
    lon: number;
    height?: number;
  };
  visited: boolean;
  tags?: string[];
};
