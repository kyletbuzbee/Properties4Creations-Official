#!/usr/bin/env node

/**
 * Comprehensive Test Report Generator for Properties 4 Creations
 *
 * Generates detailed test reports with coverage metrics, performance analysis,
 * and actionable insights for QA automation framework.
 */

const fs = require('fs');
const path = require('path');

/**
 * Test Report Generator Class
 */
class TestReportGenerator {
  constructor() {
    this.results = {
      summary: {},
      unitTests: [],
      e2eTests: [],
      performance: [],
      accessibility: [],
      coverage: {},
      recommendations: []
    };
  }

  /**
   * Generate comprehensive test report
   */
  async generateReport(testResults) {
    const timestamp = new Date().toISOString();
    const reportDir = path.join(__dirname, '..', 'test-reports');
    const reportFilename = `test-report-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;

    // Ensure reports directory exists
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Compile test results
    this.compileResults(testResults);
    this.analyzeCoverage();
    this.generateRecommendations();

    const report = {
      metadata: {
        project: 'Properties 4 Creations',
        version: require('../package.json').version,
        timestamp: timestamp,
        environment: process.env.NODE_ENV || 'development',
        testTypes: ['unit', 'e2e', 'integration', 'accessibility', 'performance']
      },
      summary: this.results.summary,
      unitTests: this.results.unitTests,
      e2eTests: this.results.e2eTests,
      coverage: this.results.coverage,
      recommendations: this.results.recommendations,
      performance: this.results.performance,
      accessibility: this.results.accessibility
    };

    // Write JSON report
    const jsonPath = path.join(reportDir, reportFilename);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlPath = path.join(reportDir, 'latest-report.html');
    this.generateHTMLReport(report, htmlPath);

    return { jsonPath, htmlPath };
  }

  /**
   * Compile test results from various sources
   */
  compileResults(testResults) {
    this.results.summary = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      coveragePercentage: 0,
      executionTime: 0,
      testTypes: []
    };

    // Process Jest results (unit tests)
    if (testResults.jest) {
      this.processJestResults(testResults.jest);
    }

    // Process Playwright results (E2E tests)
    if (testResults.playwright) {
      this.processPlaywrightResults(testResults.playwright);
    }

    // Process Lighthouse results (performance/accessibility)
    if (testResults.lighthouse) {
      this.processLighthouseResults(testResults.lighthouse);
    }
  }

  /**
   * Process Jest unit test results
   */
  processJestResults(jestResults) {
    jestResults.forEach(suite => {
      suite.testResults.forEach(test => {
        this.results.summary.totalTests++;
        if (test.status === 'passed') {
          this.results.summary.passedTests++;
        } else if (test.status === 'failed') {
          this.results.summary.failedTests++;
        } else {
          this.results.summary.skippedTests++;
        }

        this.results.unitTests.push({
          title: test.title,
          suite: suite.testFilePath,
          status: test.status,
          duration: test.duration,
          failureMessages: test.failureMessages || []
        });
      });
    });

    // Process coverage if available
    if (jestResults.coverageMap) {
      this.processCoverage(jestResults.coverageMap);
    }
  }

  /**
   * Process Playwright E2E test results
   */
  processPlaywrightResults(playwrightResults) {
    playwrightResults.forEach(suite => {
      suite.suites.forEach(spec => {
        spec.tests.forEach(test => {
          this.results.summary.totalTests++;

          // Determine status
          const lastResult = test.results[test.results.length - 1];
          if (lastResult.status === 'passed') {
            this.results.summary.passedTests++;
          } else if (lastResult.status === 'failed') {
            this.results.summary.failedTests++;
          } else {
            this.results.summary.skippedTests++;
          }

          this.results.e2eTests.push({
            title: test.title,
            suite: suite.title,
            spec: spec.title,
            status: lastResult.status,
            duration: lastResult.duration,
            browser: lastResult.workerIndex,
            error: lastResult.error?.message,
            attachments: lastResult.attachments || []
          });
        });
      });
    });
  }

  /**
   * Process Lighthouse performance and accessibility results
   */
  processLighthouseResults(lighthouseResults) {
    this.results.performance.push({
      timestamp: new Date().toISOString(),
      firstContentfulPaint: lighthouseResults.audits['first-contentful-paint']?.displayValue,
      largestContentfulPaint: lighthouseResults.audits['largest-contentful-paint']?.displayValue,
      cumulativeLayoutShift: lighthouseResults.audits['cumulative-layout-shift']?.displayValue,
      speedIndex: lighthouseResults.audits['speed-index']?.displayValue,
      performanceScore: lighthouseResults.categories.performance?.score * 100
    });

    this.results.accessibility.push({
      timestamp: new Date().toISOString(),
      accessibilityScore: lighthouseResults.categories.accessibility?.score * 100,
      bestPracticesScore: lighthouseResults.categories['best-practices']?.score * 100,
      seoScore: lighthouseResults.categories.seo?.score * 100,
      criticalIssues: this.extractCriticalIssues(lighthouseResults.audits)
    });
  }

  /**
   * Extract critical accessibility and performance issues
   */
  extractCriticalIssues(audits) {
    const criticalIssues = [];

    Object.entries(audits).forEach(([key, audit]) => {
      if (audit.score < 0.5 && audit.details?.items?.length > 0) {
        criticalIssues.push({
          audit: key,
          title: audit.title,
          score: audit.score * 100,
          issues: audit.details.items.map(item => ({
            description: item.description || item.url || 'No description',
            node: item.node?.snippet || ''
          }))
        });
      }
    });

    return criticalIssues;
  }

  /**
   * Analyze test coverage
   */
  analyzeCoverage(coverageData) {
    this.results.coverage = {
      totalLines: 0,
      coveredLines: 0,
      totalFunctions: 0,
      coveredFunctions: 0,
      totalBranches: 0,
      coveredBranches: 0,
      files: []
    };

    // Process coverage data from Jest or other sources
    // This would be more complex in real implementation

    this.results.coverage.lineCoverage = 0;
    this.results.coverage.functionCoverage = 0;
    this.results.coverage.branchCoverage = 0;
  }

  /**
   * Process existing coverage data from Jest
   */
  processCoverage(coverageData) {
    // Simplified coverage processing
    this.results.coverage = coverageData || {};
  }

  /**
   * Generate actionable recommendations based on results
   */
  generateRecommendations() {
    const recommendations = [];

    // Analyze test results and coverage to generate insights
    if (this.results.summary.failedTests > 0) {
      recommendations.push({
        priority: 'high',
        category: 'bugs',
        title: 'Fix failing tests',
        description: `${this.results.summary.failedTests} tests are failing. Analyze error messages and fix underlying issues.`,
        estimatedEffort: '1-2 days'
      });
    }

    if (this.results.coverage.lineCoverage < 80) {
      recommendations.push({
        priority: 'medium',
        category: 'coverage',
        title: 'Increase test coverage',
        description: `Current line coverage is ${this.results.coverage.lineCoverage}%. Aim for 80%+ coverage.`,
        estimatedEffort: '2-3 days'
      });
    }

    if (this.results.performance.length > 0) {
      const avgPerformance = this.results.performance
        .reduce((sum, p) => sum + p.performanceScore, 0) / this.results.performance.length;

      if (avgPerformance < 90) {
        recommendations.push({
          priority: 'high',
          category: 'performance',
          title: 'Optimize performance',
          description: `Average Lighthouse performance score is ${avgPerformance.toFixed(1)}. Optimize images, lazy loading, and reduce render-blocking resources.`,
          estimatedEffort: '2-4 days'
        });
      }
    }

    if (this.results.accessibility.length > 0) {
      const avgAccessibility = this.results.accessibility
        .reduce((sum, a) => sum + a.accessibilityScore, 0) / this.results.accessibility.length;

      if (avgAccessibility < 90) {
        recommendations.push({
          priority: 'high',
          category: 'accessibility',
          title: 'Fix accessibility issues',
          description: `Average accessibility score is ${avgAccessibility.toFixed(1)}. Address critical WCAG violations.`,
          estimatedEffort: '1-3 days'
        });
      }
    }

    // General recommendations
    recommendations.push({
      priority: 'low',
      category: 'maintenance',
      title: 'Update test snapshots',
      description: 'Update Jest snapshots and visual regression baselines.',
      estimatedEffort: '4-6 hours'
    }, {
      priority: 'medium',
      category: 'automation',
      title: 'Add visual regression testing',
      description: 'Implement visual regression tests for critical UI components.',
      estimatedEffort: '1-2 days'
    });

    this.results.recommendations = recommendations;
  }

  /**
   * Generate HTML report with styling
   */
  generateHTMLReport(report, outputPath) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QA Test Report - Properties 4 Creations</title>
    <style>
        :root {
            --primary-color: #0B1120;
            --secondary-color: #C28E5A;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --error-color: #ef4444;
            --border-color: #e2e8f0;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, sans-serif; background: #f8fafc; color: #1f2937; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .header { background: var(--primary-color); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; }
        .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .card { background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
        .status-passed { color: var(--success-color); }
        .status-failed { color: var(--error-color); }
        .status-skipped { color: var(--warning-color); }
        .metric { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
        .label { font-size: 0.875rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
        .section { margin-bottom: 2rem; }
        .section-title { font-size: 1.5rem; font-weight: 600; color: var(--primary-color); margin-bottom: 1rem; border-bottom: 2px solid var(--secondary-color); padding-bottom: 0.5rem; }
        .test-item { padding: 1rem; border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 0.5rem; background: white; }
        .test-passed { border-left: 4px solid var(--success-color); }
        .test-failed { border-left: 4px solid var(--error-color); }
        .test-skipped { border-left: 4px solid var(--warning-color); }
        .recommendations { display: grid; gap: 1rem; }
        .recommendation { padding: 1rem; border-radius: 8px; border-left: 4px solid; }
        .recommendation.high { border-color: var(--error-color); background: rgba(239, 68, 68, 0.05); }
        .recommendation.medium { border-color: var(--warning-color); background: rgba(245, 158, 11, 0.05); }
        .recommendation.low { border-color: var(--secondary-color); background: rgba(194, 142, 90, 0.05); }
        .progress-bar { width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin: 0.5rem 0; }
        .progress-fill { height: 100%; background: var(--secondary-color); transition: width 0.3s ease; }
        .table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        .table th, .table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border-color); }
        .table th { background: #f8fafc; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>🧪 QA Test Report</h1>
            <p>Properties 4 Creations - ${new Date().toLocaleDateString()}</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </header>

        <section class="summary-cards">
            <div class="card">
                <div class="metric">${report.summary.totalTests || 0}</div>
                <div class="label">Total Tests</div>
            </div>
            <div class="card">
                <div class="metric status-passed">${report.summary.passedTests || 0}</div>
                <div class="label">Passed</div>
            </div>
            <div class="card">
                <div class="metric status-failed">${report.summary.failedTests || 0}</div>
                <div class="label">Failed</div>
            </div>
            <div class="card">
                <div class="metric status-skipped">${report.summary.skippedTests || 0}</div>
                <div class="label">Skipped</div>
            </div>
            <div class="card">
                <div class="metric">${report.summary.coveragePercentage || 0}%</div>
                <div class="label">Coverage</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${report.summary.coveragePercentage || 0}%"></div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">🎯 Performance Metrics</h2>
            ${report.performance.length > 0 ? `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Lighthouse Score</th>
                            <th>Current Value</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.performance.map(p => `
                            <tr>
                                <td>Performance Score</td>
                                <td>${p.performanceScore?.toFixed(0) || 'N/A'}</td>
                                <td>Lighthouse Audit</td>
                                <td class="${p.performanceScore >= 90 ? 'status-passed' : 'status-failed'}">
                                    ${p.performanceScore >= 90 ? '✅ Good' : '⚠️ Needs Improvement'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p>No performance data available. Run Lighthouse tests.</p>'}
        </section>

        <section class="section">
            <h2 class="section-title">♿ Accessibility Score</h2>
            ${report.accessibility.length > 0 ? `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Score</th>
                            <th>Status</th>
                            <th>Issues</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.accessibility.map(a => `
                            <tr>
                                <td>WCAG Compliance</td>
                                <td>${a.accessibilityScore?.toFixed(0) || 'N/A'}</td>
                                <td class="${a.accessibilityScore >= 90 ? 'status-passed' : 'status-failed'}">
                                    ${a.accessibilityScore >= 90 ? '✅ Compliant' : '⚠️ Needs Attention'}
                                </td>
                                <td>${a.criticalIssues?.length || 0} issues</td>
                            </tr>
                            <tr>
                                <td>Best Practices</td>
                                <td>${a.bestPracticesScore?.toFixed(0) || 'N/A'}</td>
                                <td class="${a.bestPracticesScore >= 90 ? 'status-passed' : 'status-failed'}">
                                    ${a.bestPracticesScore >= 90 ? '✅ Compliant' : '⚠️ Needs Attention'}
                                </td>
                                <td>-</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p>No accessibility data available. Run Lighthouse tests.</p>'}
        </section>

        <section class="section">
            <h2 class="section-title">🏆 Quality Recommendations</h2>
            <div class="recommendations">
                ${report.recommendations.map(rec => `
                    <div class="recommendation ${rec.priority}">
                        <h3>${rec.title} (${rec.priority.toUpperCase()})</h3>
                        <p>${rec.description}</p>
                        <small>Estimated effort: ${rec.estimatedEffort}</small>
                    </div>
                `).join('')}
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">📊 Detailed Test Results</h2>
            ${[...report.unitTests, ...report.e2eTests].map(test => `
                <div class="test-item test-${test.status}">
                    <h4>${test.title}</h4>
                    <p><strong>Suite:</strong> ${test.suite || test.spec || 'Unknown'}</p>
                    <p><strong>Status:</strong> <span class="status-${test.status}">${test.status.toUpperCase()}</span></p>
                    ${test.duration ? `<p><strong>Duration:</strong> ${test.duration}ms</p>` : ''}
                    ${test.error ? `<p><strong>Error:</strong> ${test.error}</p>` : ''}
                </div>
            `).join('')}
        </section>

        <footer style="text-align: center; margin-top: 3rem; color: #6b7280;">
            <p>Report generated by Properties 4 Creations QA Automation Framework</p>
        </footer>
    </div>
</body>
</html>`;

    fs.writeFileSync(outputPath, html);
  }

  /**
   * Generate CLI-compatible summary
   */
  generateSummary() {
    const { summary, recommendations } = this.results;

    console.log('🧪 QA Test Suite Results');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.passedTests} ✅`);
    console.log(`Failed: ${summary.failedTests} ❌`);
    console.log(`Skipped: ${summary.skippedTests} ⏭️`);
    console.log(`Coverage: ${summary.coveragePercentage}%`);
    console.log(`Execution Time: ${summary.executionTime}ms`);
    console.log('='.repeat(50));

    if (recommendations.length > 0) {
      console.log('🎯 Top Recommendations:');
      recommendations.slice(0, 3).forEach(rec => {
        console.log(`• ${rec.priority.toUpperCase()}: ${rec.title}`);
      });
    }
  }
}

module.exports = TestReportGenerator;

// CLI usage
if (require.main === module) {
  const generator = new TestReportGenerator();

  // Mock test results (in real usage, you'd pass actual results)
  const mockResults = {
    jest: [],
    playwright: [],
    lighthouse: {
      categories: {
        performance: { score: 0.85 },
        accessibility: { score: 0.95 },
        'best-practices': { score: 0.90 },
        seo: { score: 0.92 }
      },
      audits: {}
    }
  };

  generator.generateReport(mockResults)
    .then(({ jsonPath, htmlPath }) => {
      console.log('✓ Test reports generated:');
      console.log(`  JSON: ${jsonPath}`);
      console.log(`  HTML: ${htmlPath}`);
      console.log(`  Open the HTML file in your browser for a detailed report.`);
    })
    .catch(console.error);
}
