const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'and', 'or', 'but', 'if', 'then', 'else', 'for', 'to', 'of', 'in',
  'on', 'at', 'by', 'with', 'about', 'as', 'from', 'this', 'that',
  'these', 'those', 'it', 'its', 'do', 'does', 'did', 'how', 'what',
  'when', 'where', 'why', 'who', 'which', 'whose', 'have', 'has',
  'had', 'can', 'could', 'should', 'would', 'will', 'shall', 'may',
  'might', 'our', 'your', 'their', 'my', 'his', 'her', 'us', 'them',
])

function tokenize(text) {
  if (!text) return []
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOP_WORDS.has(token))
}

function scoreFile(questionTokens, file, snippetBank) {
  const fileNameTokens = tokenize(file.name)
  const fileSnippets = snippetBank?.[file.name] || []
  let bestScore = 0
  let bestSnippet = null

  if (fileNameTokens.length > 0) {
    const overlap = questionTokens.filter(t => fileNameTokens.includes(t)).length
    const baseScore = overlap > 0 ? Math.min(0.55 + overlap * 0.08, 0.78) : 0
    if (baseScore > bestScore) {
      bestScore = baseScore
      bestSnippet = `Reference to ${file.name} (no snippet available).`
    }
  }

  for (const snippet of fileSnippets) {
    const snippetTokens = tokenize(snippet)
    const overlap = questionTokens.filter(t => snippetTokens.includes(t)).length
    if (overlap === 0) continue
    const score = Math.min(0.6 + overlap * 0.07 + Math.random() * 0.04, 0.97)
    if (score > bestScore) {
      bestScore = score
      bestSnippet = snippet
    }
  }

  if (bestScore === 0) return null
  return { fileName: file.name, snippet: bestSnippet, score: Number(bestScore.toFixed(2)) }
}

function buildSnippetBank(libraryFiles) {
  const bank = {}
  for (const file of libraryFiles) {
    bank[file.name] = [
      `${file.name} contains key information related to ${file.name.replace(/[._-]+/g, ' ')}.`,
      `Detail rows in ${file.name} reference ticket counts, escalations, and resolution timing.`,
    ]
  }
  return bank
}

function evaluateTestCase(testCase, libraryFiles) {
  const questionTokens = tokenize(testCase.question)
  const snippetBank = buildSnippetBank(libraryFiles)

  const scored = libraryFiles
    .map(file => scoreFile(questionTokens, file, snippetBank))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  const retrievedFileNames = scored.map(c => c.fileName)
  const failureReasons = []

  const expected = testCase.expectedSources || []
  const missingExpected = expected.filter(name => !retrievedFileNames.includes(name))
  if (missingExpected.length > 0) {
    failureReasons.push(`Expected source${missingExpected.length > 1 ? 's' : ''} ${missingExpected.join(', ')} not found in top results`)
  }

  const sourceList = retrievedFileNames.length > 0
    ? retrievedFileNames.slice(0, 2).join(' and ')
    : 'no matching documents'
  const firstSnippet = scored[0]?.snippet || 'no relevant snippet was retrieved.'
  const groundedAnswer = scored.length > 0
    ? `Based on ${sourceList}: ${firstSnippet}`
    : `No matching content was found in this library for this question.`

  if (testCase.expectedAnswer && testCase.expectedAnswer.trim()) {
    const expectedTokens = tokenize(testCase.expectedAnswer)
    const answerTokens = tokenize(groundedAnswer)
    const matched = expectedTokens.some(token => answerTokens.includes(token))
    if (!matched) {
      failureReasons.push(`Reference answer "${testCase.expectedAnswer}" not present in grounded response`)
    }
  }

  return {
    runAt: new Date().toISOString(),
    status: failureReasons.length === 0 ? 'pass' : 'fail',
    retrievedChunks: scored,
    groundedAnswer,
    failureReasons,
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export async function runTestSet({
  testCases,
  libraryFiles,
  onCaseStart,
  onCaseFinish,
  cancelRef,
}) {
  const results = []
  for (const testCase of testCases) {
    if (cancelRef?.current) return results
    onCaseStart?.(testCase.id)
    await delay(600 + Math.random() * 600)
    if (cancelRef?.current) return results
    const result = evaluateTestCase(testCase, libraryFiles)
    results.push({ id: testCase.id, result })
    onCaseFinish?.(testCase.id, result)
  }
  return results
}

export function runSingleTestCase(testCase, libraryFiles) {
  return evaluateTestCase(testCase, libraryFiles)
}
