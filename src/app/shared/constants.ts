export type Role = "admin" | "user";

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "What Python files are supported?",
    a: "PyGuardian AI supports all .py files. You can upload individual files or paste code directly into the editor. Maximum file size is 1MB.",
  },
  {
    q: "Which analysis tools are used?",
    a: "We use Pylint for code quality, Bandit for security vulnerabilities, and Radon for complexity metrics — combined with AI-powered explanations.",
  },
  {
    q: "How are code metrics evaluated?",
    a: "PyGuardian AI evaluates Quality, Security, and Complexity independently (each 0–100%) rather than combining them into a composite Risk Score. This provides clear, granular visibility into each aspect of your codebase.",
  },
  {
    q: "Can I download analysis reports?",
    a: "Yes! All analysis results can be exported as PDF reports with full issue details, charts, and AI recommendations.",
  },
  {
    q: "Is my code stored on your servers?",
    a: "Uploaded Python files are processed in temporary files and erased immediately after analysis completes — your raw source code is never permanently stored on disk. The generated analysis findings, summaries, and metrics (Quality, Security, and Complexity) are saved in the database so you can access your history and export reports. These records remain stored until you delete them from your Reports page, or until an authorized administrator removes them.",
  },
  {
    q: "How do I use the AI Assistant?",
    a: "After running an analysis, navigate to the AI Assistant. You can ask about specific issues, request code fixes, or get explanations of security concepts.",
  },
];
