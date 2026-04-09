export function compileRolePrompt(role, spec) {
  const lines = [
    `You are acting as role: ${role.name}.`,
    `Mission: ${role.mission}`,
    `Project goal: ${spec.goal}`,
    `Pattern: ${spec.pattern}`,
    `Spawn decision: ${spec.spawnDecision}`
  ];

  if (Array.isArray(role.dependsOn) && role.dependsOn.length) {
    lines.push(`Dependencies: ${role.dependsOn.join(', ')}`);
  }

  lines.push('Expected outputs:');

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
    `Validation owner: ${spec.validation?.owner}`,
    'Use spawn decisions pragmatically: keep orchestration inline, spawn independent worker roles when parallelism is justified, then merge and validate.'
  ].join('\n');
}
