export function compileRolePrompt(role, spec) {
  const lines = [
    `You are acting as role: ${role.name}.`,
    `Mission: ${role.mission}`,
    `Project goal: ${spec.goal}`,
    `Pattern: ${spec.pattern}`,
    `Spawn decision: ${spec.spawnDecision}`,
    'Expected outputs:'
  ];

  for (const output of role.outputs || []) {
    lines.push(`- ${output}`);
  }

  lines.push('Follow the team spec and produce the requested artifact-oriented result.');
  return lines.join('\n');
}

export function compileOrchestratorSummary(spec) {
  return [
    `Team: ${spec.name}`,
    `Goal: ${spec.goal}`,
    `Pattern: ${spec.pattern}`,
    `Spawn decision: ${spec.spawnDecision}`,
    `Merge owner: ${spec.merge?.owner}`,
    `Validation owner: ${spec.validation?.owner}`
  ].join('\n');
}
