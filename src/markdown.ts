import DOMPurify from "dompurify";
import { marked } from "marked";

/** README из меты — markdown; реестр курируемый, но санитизируем всё равно. */
export function renderMarkdown(markdown: string): string {
    const html = marked.parse(markdown, { async: false, gfm: true });
    return DOMPurify.sanitize(html);
}
