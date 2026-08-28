# Prompt: Build Payment Module

Purpose:
  Example prompt for building a payment module with refund functionality.

Source:
  User request

Context:
  This is an example prompt demonstrating the prompt folder structure.
  In a real scenario, this would be an actual user request.

Prompt:
  "Build a payment module with refund functionality for an e-commerce platform.
   The module should handle:
   - Payment processing (charge)
   - Refund processing (full and partial)
   - Payment status tracking
   - Webhook handling for payment events
   - Error handling and retries"

Expected Skills:
  - SKILL-API-PAYMENT-L1 (first skill)
  - SKILL-DB-PAYMENT-L2
  - SKILL-BE-PAYMENT-L3
  - SKILL-FE-PAYMENT-L2

Expected Decisions:
  - DEC-100: Use PostgreSQL for payment transactions
  - DEC-101: Implement idempotent refunds
  - DEC-102: Use Stripe as payment gateway

Expected Tasks:
  - TASK-201: Design payment schema
  - TASK-202: Implement payment service
  - TASK-203: Implement refund service
  - TASK-204: Add webhook handlers
  - TASK-205: Write tests

Status: example

State: +
