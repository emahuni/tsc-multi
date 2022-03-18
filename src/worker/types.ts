import { Target } from "../config";

export interface WorkerOptions {
  target: Omit<Target, "extname">;
  extname?: string;
  verbose?: boolean;
  dry?: boolean;
  force?: boolean;
  watch?: boolean;
  clean?: boolean;
  projects: string[];
  cwd: string;
  compiler?: string;
  reportPrefix?: string;
  transpileOnly?: boolean;
}
