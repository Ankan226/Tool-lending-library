const ALLOWED_STATUSES = ['Available', 'Checked Out', 'Under Repair'];
const ALLOWED_CONDITIONS = ['New', 'Good', 'Fair', 'Needs Repair'];


function validateTool(data, { partial = false } = {}) {
  const errors = {};

  const isMissing = (value) => value === undefined || value === null || String(value).trim() === '';

  if (!partial || data.name !== undefined) {
    if (isMissing(data.name)) errors.name = 'Name is required.';
  }

  if (!partial || data.category !== undefined) {
    if (isMissing(data.category)) errors.category = 'Category is required.';
  }

  if (!partial || data.condition !== undefined) {
    if (isMissing(data.condition)) {
      errors.condition = 'Condition is required.';
    } else if (!ALLOWED_CONDITIONS.includes(data.condition)) {
      errors.condition = `Condition must be one of: ${ALLOWED_CONDITIONS.join(', ')}.`;
    }
  }

  if (!partial || data.status !== undefined) {
    if (isMissing(data.status)) {
      errors.status = 'Status is required.';
    } else if (!ALLOWED_STATUSES.includes(data.status)) {
      errors.status = `Status must be one of: ${ALLOWED_STATUSES.join(', ')}.`;
    }
  }

  if (data.status === 'Checked Out' && isMissing(data.borrower)) {
    errors.borrower = 'Borrower name is required when status is Checked Out.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateTool, ALLOWED_STATUSES, ALLOWED_CONDITIONS };