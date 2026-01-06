# Google Antigravity Agent Manager - Official Overview

## Introduction
The **Agent Manager** (accessible via `Command + E` (Mac) or `Ctrl + E` (Windows)) is the central control plane for your AI coding partner. Unlike the chat interface, which focuses on conversational intent, the Agent Manager is designed for configuration, observability, and automation.

## Key Features

### 1. Context & Persona Management
The Agent Manager allows you to define the *identity* and *constraints* of the AI agent for the current session.
- **System Prompt**: A text area to define high-level behavioral instructions (e.g., "Act as a Senior React Developer").
- **Project Rules**: Persistent rules that apply across sessions (e.g., "Always use TypeScript").
- **Memory Management**: View and clear the file context or conversation history the agent is currently aware of.

### 2. Workflow Automation (Agent Workflows)
Workflows turn repetitive multi-step tasks into executable actions.
- **Trigger**: Workflows can be triggered manually via UI buttons or via slash commands in chat (e.g., `/deploy`).
- **Definition**: Workflows are typically defined in markdown files (e.g., `.agent/workflows/*.md`).
- **Execution**: The Agent Manager visualizes the steps and logs the output of each command in real-time.

### 3. Observability & Logs
A dedicated "Logs" or "History" tab provides deep insights into agent actions.
- **Terminal Output**: View raw stdout/stderr from executed shell commands.
- **Tool Calls**: See exactly which tools (e.g., `write_to_file`, `grep_search`) were invoked and their arguments.
- **Error Tracing**: Critical for debugging why an agent failed to complete a task.

## Best Practices
- **Define Personas**: Create markdown files for different roles (Engineer, Designer, QA) and load them into the System Prompt as needed.
- **Automate Routine**: If you run a sequence of commands more than twice, turn it into a Workflow.
- **Monitor**: Use the Logs view when the agent behavior seems unexpected.
