function inferRoleKind(name = '') {
  const normalized = String(name).toLowerCase();
  if (normalized === 'orchestrator') return 'orchestrator';
  if (normalized === 'reviewer' || normalized === 'qa' || normalized === 'reviewer-qa') return 'reviewer';
  if (normalized.includes('builder') || normalized.includes('implementer')) return 'builder';
  if (normalized.includes('analyst') || normalized.includes('research')) return 'analyst';
  return 'general';
}

function normalizeDependencies(spec, roles) {
  const roleNames = new Set((roles || []).map((role) => role.name));
  const nonReviewRoles = (roles || []).filter((role) => inferRoleKind(role.name) !== 'reviewer');
  const workerRoles = nonReviewRoles.filter((role) => inferRoleKind(role.name) !== 'orchestrator');

  return (roles || []).map((role) => {
    const explicit = Array.isArray(role.dependsOn) ? role.dependsOn.filter((name) => roleNames.has(name)) : null;
    if (explicit && explicit.length) {
      return { ...role, dependsOn: explicit };
    }

    const kind = inferRoleKind(role.name);
    if (kind === 'orchestrator') {
      return { ...role, dependsOn: [] };
    }

    if (kind === 'reviewer') {
      return { ...role, dependsOn: workerRoles.map((item) => item.name) };
    }

    if (role.name !== spec.merge?.owner && roleNames.has(spec.merge?.owner)) {
      return { ...role, dependsOn: ['orchestrator'] };
    }

    return { ...role, dependsOn: [] };
  });
}

function decideRoleMode(role, spec) {
  const requested = role.executionMode || role.execution || 'auto';
  if (requested === 'inline' || requested === 'subagent') {
    return {
      mode: requested,
      reason: `role requested ${requested}`
    };
  }

  const kind = inferRoleKind(role.name);
  if (spec.spawnDecision === 'single-session') {
    return { mode: 'inline', reason: 'team spec forces a single session' };
  }

  if (kind === 'orchestrator') {
    return { mode: 'inline', reason: 'orchestrator keeps control in the parent session' };
  }

  if (kind === 'reviewer') {
    if (spec.spawnDecision === 'spawn-recommended') {
      return { mode: 'inline', reason: 'review stays inline after worker artifacts arrive' };
    }
    return { mode: 'inline', reason: 'review is lightweight enough to keep inline by default' };
  }

  if (spec.spawnDecision === 'spawn-recommended') {
    return { mode: 'subagent', reason: 'independent worker role under spawn-recommended' };
  }

  if (spec.spawnDecision === 'spawn-optional') {
    if (role.parallelSafe === true || kind === 'builder' || kind === 'analyst') {
      return { mode: 'subagent', reason: 'role looks parallel-safe under spawn-optional' };
    }
    return { mode: 'inline', reason: 'kept inline because parallel benefit is uncertain' };
  }

  return { mode: 'inline', reason: 'fallback inline mode' };
}

export function buildSpawnPlan(spec, roles) {
  const normalizedRoles = normalizeDependencies(spec, roles).map((role) => {
    const decision = decideRoleMode(role, spec);
    return {
      ...role,
      dependsOn: role.dependsOn || [],
      mode: decision.mode,
      decisionReason: decision.reason,
      kind: inferRoleKind(role.name)
    };
  });

  const pending = new Map(normalizedRoles.map((role) => [role.name, role]));
  const completed = new Set();
  const waves = [];

  while (pending.size) {
    const ready = [...pending.values()].filter((role) => role.dependsOn.every((name) => completed.has(name)));
    if (!ready.length) {
      return {
        strategy: 'blocked',
        roles: normalizedRoles,
        waves,
        blocked: [...pending.values()].map((role) => ({
          role: role.name,
          dependsOn: role.dependsOn
        }))
      };
    }

    const inline = ready.filter((role) => role.mode === 'inline').map((role) => role.name);
    const subagents = ready.filter((role) => role.mode === 'subagent').map((role) => role.name);

    waves.push({
      index: waves.length,
      ready: ready.map((role) => role.name),
      inline,
      subagents
    });

    ready.forEach((role) => {
      completed.add(role.name);
      pending.delete(role.name);
    });
  }

  return {
    strategy: normalizedRoles.some((role) => role.mode === 'subagent') ? 'dynamic-subagents' : 'inline-only',
    roles: normalizedRoles,
    waves,
    blocked: []
  };
}
