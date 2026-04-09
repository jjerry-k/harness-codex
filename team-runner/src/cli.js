import path from 'node:path';
import { loadTeamSpec, validateTeamSpec } from './parser.js';
import { buildExecutionPlan, executeTeam, runTeam } from './runner.js';

function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}

export async function runCli(args) {
  const [command, filePath] = args;

  if (!command || !filePath) {
    throw new Error('Usage: team-runner <validate|plan|run|execute> <team-spec.(json|yaml)>');
  }

  const { spec, absolutePath } = await loadTeamSpec(filePath);
  const validation = validateTeamSpec(spec);
  const baseDir = path.dirname(absolutePath);

  if (command === 'validate') {
    printJson({
      command,
      file: absolutePath,
      baseDir,
      ...validation
    });
    return;
  }

  if (!validation.valid) {
    printJson({
      command,
      file: absolutePath,
      baseDir,
      ...validation
    });
    process.exitCode = 1;
    return;
  }

  if (command === 'plan') {
    printJson({
      command,
      file: absolutePath,
      baseDir,
      plan: buildExecutionPlan(spec)
    });
    return;
  }

  if (command === 'run') {
    printJson({
      command,
      file: absolutePath,
      baseDir,
      result: await runTeam(spec, { baseDir })
    });
    return;
  }

  if (command === 'execute') {
    printJson({
      command,
      file: absolutePath,
      baseDir,
      result: await executeTeam(spec, { baseDir })
    });
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}
