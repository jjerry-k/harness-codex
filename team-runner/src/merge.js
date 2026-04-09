export function canMerge(spec) {
  const required = spec.merge?.requires || [];
  return {
    ready: required.length > 0,
    requiredArtifacts: required
  };
}

export function buildMergePlan(spec) {
  return {
    owner: spec.merge?.owner,
    requiredArtifacts: spec.merge?.requires || [],
    validationOwner: spec.validation?.owner
  };
}
