export function buildValidationPlan(spec) {
  return {
    owner: spec.validation?.owner,
    requiredArtifacts: spec.validation?.requires || []
  };
}

export function isDone(spec) {
  return {
    done: false,
    reason: `Validation by ${spec.validation?.owner || 'unknown'} still required`
  };
}
