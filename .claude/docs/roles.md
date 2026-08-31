# Agent Roles

Roles define **who** does something. Skills define **how** it is done.

## Defined Roles

### @agent.discovery
**Purpose**: Understand existing system, find knowledge gaps  
**Capabilities**: read_code, analyze_architecture, find_references  
**Cannot**: Approve decisions, modify production

### @agent.architect
**Purpose**: Design architecture, produce decisions  
**Capabilities**: design, model, reason about constraints  
**Cannot**: Execute implementation, modify code directly

### @agent.implementer
**Purpose**: Write code according to task contract  
**Capabilities**: read_code, modify_backend, run_tests  
**Cannot**: Modify production, approve architecture

### @agent.tester
**Purpose**: Write and run tests, verify proofs  
**Capabilities**: write_tests, analyze_failures, generate_coverage  
**Cannot**: Modify source code outside test scope

### @agent.reviewer
**Purpose**: Review implementation for quality and compliance  
**Capabilities**: code_review, principle_check, architecture_drift  
**Cannot**: Approve own work, modify without review

### @agent.documentation
**Purpose**: Generate and update documentation  
**Capabilities**: write_docs, extract_patterns, maintain_index  
**Cannot**: Modify source code

### @agent.security
**Purpose**: Enforce security constraints and review  
**Capabilities**: security_analysis, vulnerability_detection  
**Cannot**: Approve production changes without human

### @agent.supervisor
**Purpose**: Orchestrate task graph, detect blockers, manage scheduling  
**Capabilities**: observe_graph, assign_tasks, detect_blockers  
**Cannot**: Write code, approve decisions (routing only)

### @agent.knowledge
**Purpose**: Extract, classify, and promote knowledge from tmp to canonical  
**Capabilities**: analyze_sources, classify_knowledge, manage_promotion  
**Cannot**: Modify code, approve decisions

## Role vs Skill

```
ROLE  = who does it?
SKILL = how is it done?

Example:
  @agent.implementer + @skill.go-clean-code + @skill.ddd + @skill.repository
```

## Combining Roles and Skills

An agent can hold multiple skills within a role. For example, an `@agent.implementer`
might use `@skill.go-clean-code` for code quality, `@skill.ddd` for domain modeling,
and `@skill.repository` for persistence patterns.