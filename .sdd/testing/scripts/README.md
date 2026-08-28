# SDDRA Test Suite

Purpose:
  Comprehensive test suite for the SDDRA system.
  Validates system integrity, chain execution, skill loading,
  resilience patterns, and prompt processing.

## Test Structure

```
.sdd/testing/
  INDEX.sdd                    # Testing knowledge base
  README.md                    # This file
  scripts/
    run.ps1                    # Test runner
    unit/                      # Unit tests
      test-sdd-structure.ps1   # Test .sdd/ file structure
      test-references.ps1      # Test @references resolve
      test-metadata.ps1        # Test metadata completeness
      test-language.ps1        # Test English-only content
    integration/               # Integration tests
      test-chain-graph.ps1     # Test chain graph execution
      test-skill-loading.ps1   # Test skill discovery and loading
      test-prompt-processing.ps1 # Test prompt processing
      test-decision-workflow.ps1 # Test decision lifecycle
    chain/                     # Chain-specific tests
      test-default-chain.ps1   # Test default chain
      test-fast-path.ps1       # Test fast path
      test-parallel.ps1        # Test parallel execution
    patterns/                  # Pattern tests
      test-circuit-breaker.ps1 # Test circuit breaker
      test-checkpoint.ps1      # Test checkpoint/restore
      test-degradation.ps1     # Test graceful degradation
    skills/                    # Skill tests
      test-skill-discovery.ps1 # Test skill discovery
      test-skill-relevance.ps1 # Test relevance scoring
      test-skill-gap.ps1       # Test gap analysis
  README.md                   # Test documentation
```

## Running Tests

### Run All Tests
```powershell
.s .sdd/testing/scripts/run.ps1
```

### Run Specific Test Category
```powershell
.s .sdd/testing/scripts/run.ps1 -Category unit
.s .sdd/testing/scripts/run.ps1 -Category integration
.s .sdd/testing/scripts/run.ps1 -Category chain
.s .sdd/testing/scripts/run.ps1 -Category patterns
.s .sdd/testing/scripts/run.ps1 -Category skills
```

### Run Specific Test
```powershell
.s .sdd/testing/scripts/run.ps1 -Test test-sdd-structure
.s .sdd/testing/scripts/run.ps1 -Test test-chain-graph
```

## Test Categories

### Unit Tests
Fast, isolated tests that validate individual components:
- .sdd/ file structure
- Reference resolution
- Metadata completeness
- Language compliance

### Integration Tests
Tests that validate component interactions:
- Chain graph execution
- Skill loading and discovery
- Prompt processing
- Decision workflow

### Chain Tests
Tests that validate chain execution:
- Default chain
- Fast path
- Parallel execution

### Pattern Tests
Tests that validate resilience patterns:
- Circuit breaker
- Checkpoint/restore
- Graceful degradation

### Skill Tests
Tests that validate skill system:
- Skill discovery
- Relevance scoring
- Gap analysis

## Test Results

Test results are output in:
- Console: colored pass/fail indicators
- File: `tests/results/latest.xml` (JUnit format)
- File: `tests/results/latest.html` (HTML report)

## CI/CD Integration

Tests are automatically run:
- On every commit (pre-commit hook)
- On every push (pre-push hook)
- On every PR (CI/CD pipeline)
- Nightly (full test suite)

## Test Writing Guidelines

### Test Structure
```powershell
Describe "Test Name" {
  BeforeAll {
    # Setup
  }
  
  AfterAll {
    # Cleanup
  }
  
  Context "Context Name" {
    It "should do something" {
      # Test implementation
      $result | Should -Be $expected
    }
  }
}
```

### Test Naming
- Test files: `test-<component>.ps1`
- Test names: descriptive, starting with "should"
- Context names: group related tests

### Assertions
- Use Pester assertions (`Should -Be`, `Should -Exist`, etc.)
- One assertion per test when possible
- Clear error messages

## State: +
