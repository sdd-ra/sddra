import fs from "fs";
import path from "path";

export interface SubtaskMapping {
  subtaskId: string;        // ST-NNN-NN
  layer: string;            // DB|BE|API|FE|MD|DC|Test
  goal: string;
}

export interface TaskMapping {
  taskId: string;           // T-NNN
  title: string;
  subtasks: SubtaskMapping[];
}

export interface PromptMapping {
  promptId: string;
  promptText: string;
  chainArm: string;         // P1|D1|S1|C1|R1|DEP1|UNKNOWN
  tasks: TaskMapping[];
}

export class PromptTaskMapper {
  private sddRoot: string;
  private projectRoot: string;

  constructor(sddRoot = ".sdd", projectRoot = ".") {
    this.sddRoot = sddRoot;
    this.projectRoot = projectRoot;
  }

  classifyChainArm(text: string): string {
    if (!text) {
      return "UNKNOWN";
    }
    const lower = text.toLowerCase();

    // ChainArmMapping (from sdd-intents.sdd):
    // "write / plan / design / document" -> D1
    if (lower.includes("write") || lower.includes("plan") || lower.includes("design") || lower.includes("document")) {
      return "D1";
    }
    // "implement / code / build / develop" -> C1
    if (lower.includes("implement") || lower.includes("code") || lower.includes("build") || lower.includes("develop")) {
      return "C1";
    }
    // "review / audit / test / verify" -> R1
    if (lower.includes("review") || lower.includes("audit") || lower.includes("test") || lower.includes("verify")) {
      return "R1";
    }
    // "deploy / release / publish" -> DEP1
    if (lower.includes("deploy") || lower.includes("release") || lower.includes("publish")) {
      return "DEP1";
    }
    // "analyze / explain / understand" -> P1
    if (lower.includes("analyze") || lower.includes("explain") || lower.includes("understand")) {
      return "P1";
    }
    // "spec / define / model / schema" -> S1
    if (lower.includes("spec") || lower.includes("define") || lower.includes("model") || lower.includes("schema")) {
      return "S1";
    }

    return "UNKNOWN";
  }

  private deriveTitle(text: string): string {
    if (!text) {
      return "Untitled task";
    }
    // Truncate at first period, semicolon, or newline; max 60 chars
    let cleaned = text.trim();
    const matchEnd = cleaned.search(/[.;\n\r]/);
    if (matchEnd > 0) {
      cleaned = cleaned.substring(0, matchEnd).trim();
    }
    if (cleaned.length > 60) {
      cleaned = cleaned.substring(0, 57).trim() + "...";
    }
    return cleaned;
  }

  mapPrompt(text: string, index: number = 0): PromptMapping {
    const promptText = text.trim();
    const chainArm = this.classifyChainArm(promptText);
    const promptId = `P-${String(index + 1).padStart(3, "0")}`;

    const taskId = `T-${String(index + 1).padStart(3, "0")}`;
    const title = this.deriveTitle(promptText);
    const subtasks: SubtaskMapping[] = [
      { subtaskId: `${taskId}-01`, layer: "DB", goal: "Define data model and schema" },
      { subtaskId: `${taskId}-02`, layer: "BE", goal: "Implement backend logic" },
      { subtaskId: `${taskId}-03`, layer: "API", goal: "Design and implement API endpoints" },
      { subtaskId: `${taskId}-04`, layer: "FE", goal: "Build user interface components" },
      { subtaskId: `${taskId}-05`, layer: "MD", goal: "Create documentation" },
      { subtaskId: `${taskId}-06`, layer: "DC", goal: "Define deployment/configuration" },
      { subtaskId: `${taskId}-07`, layer: "Test", goal: "Write and run tests" },
    ];

    const tasks: TaskMapping[] = [
      {
        taskId,
        title,
        subtasks,
      },
    ];

    return {
      promptId,
      promptText: promptText.length > 120 ? promptText.substring(0, 117) + "..." : promptText,
      chainArm,
      tasks,
    };
  }

  mapInbox(): PromptMapping[] {
    const inboxPath = path.join(this.projectRoot, "prompts", "inbox");
    const mappings: PromptMapping[] = [];

    if (!fs.existsSync(inboxPath)) {
      return mappings;
    }

    const files = fs
      .readdirSync(inboxPath)
      .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
      .sort();

    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(inboxPath, files[i]);
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const mapping = this.mapPrompt(content, i);
        mapping.promptId = files[i];
        mappings.push(mapping);
      } catch {
        // Skip unreadable files
      }
    }

    return mappings;
  }

  formatTree(mappings: PromptMapping[]): string {
    const outputLines: string[] = [
      "PROMPT-TASK MAP",
      "",
    ];

    for (let i = 0; i < mappings.length; i++) {
      const m = mappings[i];
      outputLines.push(`Prompt: "${m.promptText}"`);
      const chain = this.getChain(m.chainArm);
      outputLines.push(`  Arm:  ${m.chainArm.padEnd(6)} |  Chain: ${chain}`);
      outputLines.push(`  Tasks:`);
      for (const t of m.tasks) {
        outputLines.push(`    ${t.taskId}: ${t.title}`);
        outputLines.push(`      Subtasks:`);
        for (const st of t.subtasks) {
          outputLines.push(`        ${st.subtaskId} [${st.layer}]  ${st.goal}`);
        }
      }
      if (i < mappings.length - 1) {
        outputLines.push("");
      }
    }

    const totalPrompts = mappings.length;
    const totalTasks = mappings.reduce((sum, m) => sum + m.tasks.length, 0);
    const totalSubtasks = mappings.reduce((sum, m) => sum + m.tasks.reduce((s, t) => s + t.subtasks.length, 0), 0);

    outputLines.push("");
    outputLines.push("Summary:");
    outputLines.push(`  Prompts mapped:  ${totalPrompts}`);
    outputLines.push(`  Tasks generated:  ${totalTasks}`);
    outputLines.push(`  Subtasks generated: ${totalSubtasks}`);

    return outputLines.join("\n");
  }

  private getChain(arm: string): string {
    switch (arm) {
      case "P1":
        return "P0->P1->P0";
      case "D1":
        return "D0->D1->D0";
      case "S1":
        return "S0->S1->S0";
      case "C1":
        return "C0->C1->C0";
      case "R1":
        return "R0->R1->R0";
      case "DEP1":
        return "DEP0->DEP1->DEP0";
      case "UNKNOWN":
        return "UNKNOWN";
      default:
        return "UNKNOWN";
    }
  }

  formatJson(mappings: PromptMapping[]): string {
    return JSON.stringify(mappings, null, 2);
  }
}
