export declare const GENERATED_BANNER_PREFIX: string;
export declare function syncAgents(): { written: string[] };
export declare function checkAgents(): {
  drift: string[];
  orphans: string[];
  files: Array<{ path: string; hasBanner: boolean; protocolHash: string }>;
};
