
export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SearchResult {
  text: string;
  sources: GroundingSource[];
  imageUrl?: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface HistoricalEra {
  id: string;
  title: string;
  period: string;
  description: string;
  icon: string;
}

export interface TopicCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  query: string;
  color: string;
}
