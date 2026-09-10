export function isCorrect(selected: string[], answer: string[]): boolean {
 return selected.length === answer.length && new Set(selected).size === selected.length && answer.every(value => selected.includes(value));
}
