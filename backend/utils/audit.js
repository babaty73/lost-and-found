import AuditLog from "../models/AuditLog.js";

/**
 * Records one administrative action. Failures to write an audit entry are
 * logged but never block the underlying action — an audit trail should not
 * be able to take down the actual workflow it's observing.
 *
 * @param {object} params
 * @param {string|null} params.actorId - Mongo id of the acting admin, or null for a system-triggered event.
 * @param {string} params.action - short machine-readable action name, e.g. "CLAIM_VERIFIED".
 * @param {string|null} [params.itemId]
 * @param {string|null} [params.claimId]
 * @param {string} [params.details]
 */
export async function logAction({ actorId = null, action, itemId = null, claimId = null, details = "" }) {
  try {
    await AuditLog.create({
      actor: actorId,
      action,
      item: itemId,
      claim: claimId,
      details,
    });
  } catch (err) {
    console.error("Failed to write audit log entry:", err.message);
  }
}
