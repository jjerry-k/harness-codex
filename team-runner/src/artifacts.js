import path from 'node:path';

export function artifactPathForRole(spec, role) {
  const root = spec.artifacts?.root || 'artifacts';
  return role.outputs?.map((output) => path.join(root, path.basename(output))) || [];
}

export function collectArtifactPlan(spec) {
  return (spec.roles || []).map((role) => ({
    role: role.name,
    outputs: artifactPathForRole(spec, role)
  }));
}
