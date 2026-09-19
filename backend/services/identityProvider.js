// Identity abstraction (see architecture notes, "Future ASTU identity provider").
//
// ASTU does not currently expose a student-identity API. Rather than guessing
// at ID formats (UGR/xxxxx/xx and similar are only examples — ASTU has other
// programs) or building a fake ASTU integration, this module isolates the one
// thing the rest of the app needs today: "record whatever institutional ID
// the student gives us." When ASTU provides a real identity API, only this
// file needs to change — no controller or route calling it should need to.
//
// Today: LocalIdentityProvider trusts the submitted ID as-is (after basic
// shape checks) and does NOT claim to have verified it against any ASTU
// record. `verifyStudentId` is a placeholder that always reports "not
// verified" rather than pretending a check happened.

class LocalIdentityProvider {
  /**
   * Normalizes a raw institutional ID string. Returns null if it isn't a
   * usable, non-empty string. Does not enforce any particular format.
   */
  normalizeStudentId(rawId) {
    if (typeof rawId !== "string") return null;
    const trimmed = rawId.trim();
    if (trimmed.length === 0 || trimmed.length > 64) return null;
    return trimmed;
  }

  /**
   * Placeholder for a future call to a real ASTU identity API. Intentionally
   * always returns unverified today rather than fabricating a result.
   */
  async verifyStudentId(_studentId) {
    return { verified: false, reason: "ASTU identity API is not yet integrated." };
  }
}

// Swap this for a real ASTU-backed implementation later without touching
// any calling code — controllers only ever import `identityProvider`.
const identityProvider = new LocalIdentityProvider();

export default identityProvider;
