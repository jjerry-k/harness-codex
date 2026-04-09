import fs from 'node:fs/promises';
import path from 'node:path';
import { REQUIRED_TOP_LEVEL_FIELDS, SPAWN_DECISIONS } from './types.js';

export async function loadTeamSpec(filePath) {
  const absolutePath = path.resolve(filePath);
  const raw = await fs.readFile(absolutePath, 'utf8');
  const spec = JSON.parse(raw);
  return { spec, absolutePath };
}

export function validateTeamSpec(spec) {
  const errors = [];

  for (const field of REQUIRED_TOP_LEVEL_FIELDS) {
    if (!(field in spec)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (spec.roles && !Array.isArray(spec.roles)) {
    errors.push('roles must be an array');
  }

  if (spec.roles && Array.isArray(spec.roles)) {
    spec.roles.forEach((role, index) => {
      if (!role.name) errors.push(`roles[${index}].name is required`);
      if (!role.mission) errors.push(`roles[${index}].mission is required`);
      if (!Array.isArray(role.outputs)) errors.push(`roles[${index}].outputs must be an array`);
    });
  }

  if (spec.spawnDecision && !SPAWN_DECISIONS.has(spec.spawnDecision)) {
    errors.push(`spawnDecision must be one of: ${Array.from(SPAWN_DECISIONS).join(', ')}`);
  }

  if (spec.artifacts && !spec.artifacts.root) {
    errors.push('artifacts.root is required');
  }

  if (spec.merge && !spec.merge.owner) {
    errors.push('merge.owner is required');
  }

  if (spec.validation && !spec.validation.owner) {
    errors.push('validation.owner is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
