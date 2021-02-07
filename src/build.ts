import { fork } from "child_process";
import { join } from "path";
import { Config, Target } from "./config";
import { WorkerOptions } from "./worker/types";
import stringToStream from "string-to-stream";
import { Stream } from "stream";

const WORKER_PATH = join(__dirname, "worker/entry.js");

type Stdio = "ignore" | "inherit" | Stream;

export interface BuildOptions extends Config {
  watch?: boolean;
  clean?: boolean;
  stdout?: Stdio;
  stderr?: Stdio;
}

export async function build({
  targets,
  stdout = "inherit",
  stderr = "inherit",
  verbose,
  watch,
  clean,
  projects,
  cwd,
}: BuildOptions): Promise<number> {
  function runWorker(target: Target): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const data: WorkerOptions = {
        target,
        verbose,
        watch,
        clean,
        projects,
      };

      const worker = fork(WORKER_PATH, [], {
        cwd,
        stdio: ["pipe", stdout, stderr, "ipc"],
      });

      if (worker.stdin) {
        stringToStream(JSON.stringify(data)).pipe(worker.stdin);
      }

      worker.on("error", reject);
      worker.on("exit", resolve);
    });
  }

  const codes = await Promise.all(targets.map((target) => runWorker(target)));

  return codes.find((code) => code !== 0) || 0;
}