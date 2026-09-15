import type { Note, Meeting, Manual } from '../../types';
import { formatSecondsToTime } from '../audio/transcriber';

export function exportNoteToMarkdown(note: Note): string {
  const dateStr = new Date(note.updatedAt).toISOString().split('T')[0];
  const tagsStr = note.tags.length > 0 ? `\nTags: ${note.tags.join(', ')}\n` : '';

  return `---
title: "${note.title.replace(/"/g, '\\"')}"
date: ${dateStr}
id: ${note.id}${tagsStr}---

# ${note.title}

${note.content}
`;
}

export function exportMeetingToMarkdown(meeting: Meeting): string {
  const dateStr = new Date(meeting.startTime).toLocaleString();
  const duration = formatSecondsToTime(meeting.durationSeconds);

  let md = `# Meeting: ${meeting.title}\n\n`;
  md += `**Date:** ${dateStr}  \n`;
  md += `**Duration:** ${duration}  \n\n`;

  if (meeting.summary) {
    md += `## Executive Summary\n\n${meeting.summary.overview}\n\n`;

    if (meeting.summary.decisions.length > 0) {
      md += `## Key Decisions\n\n`;
      meeting.summary.decisions.forEach((d) => {
        md += `- ${d}\n`;
      });
      md += `\n`;
    }

    if (meeting.summary.actionItems.length > 0) {
      md += `## Action Items\n\n`;
      meeting.summary.actionItems.forEach((item) => {
        const owner = item.owner ? ` (@${item.owner})` : '';
        md += `- [ ] ${item.task}${owner}\n`;
      });
      md += `\n`;
    }

    if (meeting.summary.topics.length > 0) {
      md += `## Topics Discussed\n\n`;
      meeting.summary.topics.forEach((t) => {
        md += `- ${t}\n`;
      });
      md += `\n`;
    }

    if (meeting.summary.followUpTasks.length > 0) {
      md += `## Follow-Up Tasks\n\n`;
      meeting.summary.followUpTasks.forEach((task) => {
        md += `- [ ] ${task}\n`;
      });
      md += `\n`;
    }
  }

  if (meeting.manualNotes.trim()) {
    md += `## Meeting Notes\n\n${meeting.manualNotes}\n\n`;
  }

  // Screenshots references
  if (meeting.screenshots && meeting.screenshots.length > 0) {
    md += `## Screenshots\n\n`;
    meeting.screenshots.forEach((ss, idx) => {
      const timeLabel = formatSecondsToTime(ss.timestampSeconds);
      const caption = ss.caption || `Screenshot ${idx + 1}`;
      md += `### [${timeLabel}] ${caption}\n\n`;
      md += `![${caption}](screenshot_${idx + 1}_at_${timeLabel.replace(':', 'm')}s.png)\n\n`;
    });
  }

  if (meeting.transcript.length > 0) {
    md += `## Verbal Transcript\n\n`;
    meeting.transcript.forEach((s) => {
      md += `**[${formatSecondsToTime(s.timestampSeconds)}] ${s.speaker}:** ${s.text}\n\n`;
    });
  }

  return md;
}

export function exportManualToMarkdown(manual: Manual): string {
  let md = `# ${manual.title}\n\n`;
  md += `**Purpose:** ${manual.purpose}\n\n`;

  if (manual.requirements.length > 0) {
    md += `## Requirements & Prerequisites\n\n`;
    manual.requirements.forEach((req) => {
      md += `- ${req}\n`;
    });
    md += `\n`;
  }

  if (manual.warnings.length > 0) {
    md += `## Warnings\n\n`;
    manual.warnings.forEach((w) => {
      md += `> [!WARNING]\n> ${w}\n\n`;
    });
  }

  md += `## Steps\n\n`;
  manual.steps.forEach((step) => {
    md += `### Step ${step.stepNumber}: ${step.title}\n\n`;
    md += `${step.description}\n\n`;
    if (step.warnings) {
      md += `*Warning:* ${step.warnings}\n\n`;
    }
    if (step.notes) {
      md += `*Note:* ${step.notes}\n\n`;
    }
  });

  if (manual.expectedResult) {
    md += `## Expected Result\n\n${manual.expectedResult}\n\n`;
  }

  if (manual.troubleshooting.length > 0) {
    md += `## Troubleshooting\n\n`;
    manual.troubleshooting.forEach((t) => {
      md += `- ${t}\n`;
    });
    md += `\n`;
  }

  return md;
}
