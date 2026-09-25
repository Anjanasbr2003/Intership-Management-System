/**
 * Server-side authoritative pricing catalog.
 * Client requests MUST NEVER supply or override monetary amounts.
 */
const PRICING_CATALOG = Object.freeze({
  JOB_POSTING_STANDARD: {
    id: 'job_posting_standard',
    name: 'Standard Internship Vacancy',
    currency: 'LKR',
    amount: 0, // Free tier for standard university postings
    description: 'Standard 30-day university internship vacancy listing',
  },
  JOB_POSTING_FEATURED: {
    id: 'job_posting_featured',
    name: 'Featured Internship Vacancy',
    currency: 'LKR',
    amount: 1500000, // In cents/smallest currency unit e.g. 15,000.00 LKR
    description: 'Highlighted vacancy listing with top algorithmic placement for 30 days',
  },
  EMPLOYER_ANNUAL_MEMBERSHIP: {
    id: 'employer_annual_membership',
    name: 'Enterprise Corporate Partnership',
    currency: 'LKR',
    amount: 15000000, // 150,000.00 LKR
    description: 'Unlimited verified internship listings and candidate matching for 1 year',
  },
  STUDENT_VERIFIED_CERTIFICATE: {
    id: 'student_verified_certificate',
    name: 'Verified Digital Internship Completion Certificate',
    currency: 'LKR',
    amount: 250000, // 2,500.00 LKR
    description: 'Digitally signed and cryptographically verifiable internship completion credential',
  },
});

/**
 * Retrieve verified price and metadata strictly from server catalog
 * @param {string} tierId
 * @returns {Object} item details including server-enforced amount and currency
 */
const getServerSidePrice = (tierId) => {
  const item = PRICING_CATALOG[tierId] || Object.values(PRICING_CATALOG).find(p => p.id === tierId);
  if (!item) {
    throw new Error(`Invalid pricing tier: ${tierId}. Price cannot be determined.`);
  }
  return { ...item };
};

module.exports = {
  PRICING_CATALOG,
  getServerSidePrice,
};
