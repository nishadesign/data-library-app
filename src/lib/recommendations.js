const ISSUE_LIBRARY = [
  {
    templateId: 'date-format',
    title: 'Standardize date formatting',
    issueType: 'dateFormat',
    severity: 'warning',
    confidence: 91,
    fixability: 'safe',
    summary: 'Multiple date formats appear in the same field.',
    whyItMatters: 'Mixed formats reduce filter accuracy and can cause the agent to compare timelines incorrectly.',
    suggestedFix: 'Normalize dates to ISO format before indexing.',
    beforeSample: 'close_date: 03/04/2026, 2026-03-05, Mar 6 2026',
    afterSample: 'close_date: 2026-03-04, 2026-03-05, 2026-03-06',
  },
  {
    templateId: 'duplicate-rows',
    title: 'Remove duplicate rows',
    issueType: 'duplicateRows',
    severity: 'critical',
    confidence: 96,
    fixability: 'safe',
    summary: 'Repeated records were detected with matching keys and values.',
    whyItMatters: 'Duplicate content can over-weight certain answers and create conflicting retrieval results.',
    suggestedFix: 'Keep the most complete record and remove exact duplicates.',
    beforeSample: '2 duplicate account rows found for account_id 4418',
    afterSample: '1 canonical account row kept for account_id 4418',
  },
  {
    templateId: 'null-required',
    title: 'Fill blanks in required fields',
    issueType: 'missingValues',
    severity: 'critical',
    confidence: 83,
    fixability: 'review',
    summary: 'Required fields contain blanks or null values.',
    whyItMatters: 'Missing values reduce answer completeness and make downstream validation harder.',
    suggestedFix: 'Backfill blanks from adjacent rows or mark them for manual review.',
    beforeSample: 'priority: null, owner: "", escalation_tier: null',
    afterSample: 'priority: Medium, owner: Regional Support, escalation_tier: Tier 2',
  },
  {
    templateId: 'category-normalization',
    title: 'Normalize category labels',
    issueType: 'categoryNormalization',
    severity: 'warning',
    confidence: 88,
    fixability: 'safe',
    summary: 'Similar category labels are being treated as different values.',
    whyItMatters: 'Inconsistent labels fragment search results and weaken aggregation quality.',
    suggestedFix: 'Map related labels to a single preferred value.',
    beforeSample: 'region: US, U.S., United States',
    afterSample: 'region: United States',
  },
  {
    templateId: 'mixed-types',
    title: 'Resolve mixed data types',
    issueType: 'mixedTypes',
    severity: 'warning',
    confidence: 78,
    fixability: 'review',
    summary: 'The same field contains text and numeric values.',
    whyItMatters: 'Mixed types make sorting, filtering, and reasoning over values less reliable.',
    suggestedFix: 'Convert values into one canonical type and preserve invalid rows for review.',
    beforeSample: 'annual_revenue: 42000, unknown, 58100',
    afterSample: 'annual_revenue: 42000, null, 58100',
  },
  {
    templateId: 'encoding',
    title: 'Repair unreadable characters',
    issueType: 'encoding',
    severity: 'warning',
    confidence: 86,
    fixability: 'safe',
    summary: 'Unreadable or broken encoded characters were found.',
    whyItMatters: 'Corrupted text lowers retrieval quality and can hide key business terms.',
    suggestedFix: 'Normalize the source encoding and replace malformed characters.',
    beforeSample: 'customer_note: Payment received â€” pending reconciliation',
    afterSample: 'customer_note: Payment received - pending reconciliation',
  },
  {
    templateId: 'pii-warning',
    title: 'Mask sensitive data before indexing',
    issueType: 'piiWarning',
    severity: 'critical',
    confidence: 74,
    fixability: 'manual',
    summary: 'Possible sensitive values like emails or account IDs were detected.',
    whyItMatters: 'Sensitive data should be reviewed before it becomes broadly searchable by agents.',
    suggestedFix: 'Mask or exclude the sensitive fields before publishing the dataset.',
    beforeSample: 'email: jordan.lee@acme.com, tax_id: 18-4459911',
    afterSample: 'email: [masked], tax_id: [masked]',
  },
]

const PRODUCT_RETURN_POLICY_RECOMMENDATIONS = [
  {
    templateId: 'conflicting-return-windows',
    title: 'Conflicting return windows',
    issueType: 'policyConflict',
    severity: 'warning',
    confidence: 97,
    fixability: 'review',
    summary: 'The policy defines overlapping 14-day, 30-day, 60-day, and 90-day return windows.',
    whyItMatters: 'Customers and support teams will interpret eligibility differently when multiple timelines apply.',
    suggestedFix: 'Consolidate rules under one base policy',
    beforeSample: '30 days of delivery, 60 days of purchase, 14 days for promos, 90 days for premium members',
    afterSample: 'Use one primary return window with clearly scoped exceptions',
  },
  {
    templateId: 'refund-timing-conflict',
    title: 'Refund timing conflict',
    issueType: 'policyConflict',
    severity: 'warning',
    confidence: 95,
    fixability: 'review',
    summary: 'Refunds are described as post-inspection, within 24 hours, and sometimes immediate on initiation.',
    whyItMatters: 'Contradictory refund timing creates inconsistent customer expectations and agent responses.',
    suggestedFix: 'Define a single refund workflow',
    beforeSample: '5-7 business days after inspection, 24 hours for store credit, immediate in some cases',
    afterSample: 'Set one default refund timeline and document explicit exceptions',
  },
  {
    templateId: 'return-shipping-ambiguity',
    title: 'Return shipping ambiguity',
    issueType: 'policyAmbiguity',
    severity: 'warning',
    confidence: 93,
    fixability: 'review',
    summary: 'Free return shipping rules vary by defect status, order value, promotions, and international exclusions.',
    whyItMatters: 'Agents may give the wrong shipping guidance when several free-return rules compete.',
    suggestedFix: 'Clarify free shipping eligibility',
    beforeSample: 'Defective items free, orders over $50 free, holiday orders free, international excluded',
    afterSample: 'Define one eligibility hierarchy for free return shipping',
  },
]

function hashValue(input = '') {
  return input.split('').reduce((acc, char, index) => acc + (char.charCodeAt(0) * (index + 1)), 0)
}

function getIssueCount(seed) {
  if (seed % 5 === 0) return 0
  if (seed % 2 === 0) return 2
  return 3
}

function normalizeFileName(fileName = '') {
  return fileName.trim().toLowerCase()
}

function getSpecialCaseRecommendations(file) {
  const normalizedName = normalizeFileName(file?.name)

  if (normalizedName === 'product return policy.pdf') {
    return PRODUCT_RETURN_POLICY_RECOMMENDATIONS
  }

  return null
}

export function createRecommendationsForFiles(files = []) {
  return files.flatMap((file, index) => {
    const fileId = file.id || `${file.name}-${index}`
    const specialCaseTemplates = getSpecialCaseRecommendations(file)

    if (specialCaseTemplates) {
      return specialCaseTemplates.map((template) => ({
        id: `${fileId}-${template.templateId}`,
        fileId,
        fileName: file.name || `File ${index + 1}`,
        title: template.title,
        issueType: template.issueType,
        severity: template.severity,
        confidence: template.confidence,
        fixability: template.fixability,
        status: 'new',
        summary: template.summary,
        whyItMatters: template.whyItMatters,
        suggestedFix: template.suggestedFix,
        beforeSample: template.beforeSample,
        afterSample: template.afterSample,
        suggestedAfterSample: template.afterSample,
      }))
    }

    const seed = hashValue(`${file.name || 'file'}-${index}`)
    const issueCount = getIssueCount(seed)

    if (issueCount === 0) return []

    return Array.from({ length: issueCount }, (_, issueIndex) => {
      const template = ISSUE_LIBRARY[(seed + issueIndex) % ISSUE_LIBRARY.length]
      return {
        id: `${fileId}-${template.templateId}`,
        fileId,
        fileName: file.name || `File ${index + 1}`,
        title: template.title,
        issueType: template.issueType,
        severity: template.severity,
        confidence: template.confidence,
        fixability: template.fixability,
        status: 'new',
        summary: template.summary,
        whyItMatters: template.whyItMatters,
        suggestedFix: template.suggestedFix,
        beforeSample: template.beforeSample,
        afterSample: template.afterSample,
        suggestedAfterSample: template.afterSample,
      }
    })
  })
}

export function mergeRecommendationState(nextRecommendations, previousRecommendations = []) {
  const previousById = new Map(previousRecommendations.map((recommendation) => [recommendation.id, recommendation]))

  return nextRecommendations.map((recommendation) => {
    const previous = previousById.get(recommendation.id)
    return previous
      ? {
          ...recommendation,
          status: previous.status,
          afterSample: previous.afterSample,
          suggestedAfterSample: previous.suggestedAfterSample || recommendation.suggestedAfterSample,
        }
      : recommendation
  })
}

export function summarizeRecommendations(recommendations = []) {
  const actionable = recommendations.filter((recommendation) => recommendation.status === 'new')
  const filesAffected = new Set(actionable.map((recommendation) => recommendation.fileId)).size

  return {
    total: recommendations.length,
    actionable: actionable.length,
    filesAffected,
    safe: actionable.filter((recommendation) => recommendation.fixability === 'safe').length,
    review: actionable.filter((recommendation) => recommendation.fixability === 'review').length,
    manual: actionable.filter((recommendation) => recommendation.fixability === 'manual').length,
    applied: recommendations.filter((recommendation) => recommendation.status === 'applied').length,
    dismissed: recommendations.filter((recommendation) => recommendation.status === 'dismissed').length,
    lowConfidence: actionable.filter((recommendation) => recommendation.confidence < 80).length,
  }
}

export function groupRecommendations(recommendations = []) {
  const groups = [
    {
      key: 'safe',
      title: 'Auto-fix available',
      description: 'High-confidence fixes that are safe to apply in bulk.',
      items: recommendations.filter(
        (recommendation) => recommendation.fixability === 'safe' && recommendation.status === 'new'
      ),
    },
    {
      key: 'review',
      title: 'Needs review',
      description: 'AI found a likely fix, but a human should confirm the change.',
      items: recommendations.filter(
        (recommendation) => recommendation.fixability === 'review' && recommendation.status === 'new'
      ),
    },
    {
      key: 'manual',
      title: 'Manual cleanup required',
      description: 'AI can flag the issue, but the final remediation should stay manual.',
      items: recommendations.filter(
        (recommendation) => recommendation.fixability === 'manual' && recommendation.status === 'new'
      ),
    },
  ]

  return groups.filter((group) => group.items.length > 0)
}

export function getFileRecommendationStats(fileId, recommendations = []) {
  const items = recommendations.filter(
    (recommendation) => recommendation.fileId === fileId && recommendation.status === 'new'
  )

  return {
    count: items.length,
    safe: items.filter((recommendation) => recommendation.fixability === 'safe').length,
    review: items.filter((recommendation) => recommendation.fixability === 'review').length,
    manual: items.filter((recommendation) => recommendation.fixability === 'manual').length,
    highestSeverity: items.some((recommendation) => recommendation.severity === 'critical')
      ? 'critical'
      : items.some((recommendation) => recommendation.severity === 'warning')
        ? 'warning'
        : 'none',
  }
}
