# -*- coding: utf-8 -*-
"""从 questions.json 导出多选题+判断题完整清单为 Markdown。"""
import json
from pathlib import Path

root = Path(__file__).resolve().parent
data = json.loads((root / 'app' / 'questions.json').read_text(encoding='utf-8'))
items = [q for q in data if q['type'] in ('多选题', '判断题')]

lines = ['# 多选题 + 判断题 完整清单（来自 quiz-site/app/questions.json）', '']
lines.append(f'- 多选题：{sum(1 for q in items if q["type"] == "多选题")} 道')
lines.append(f'- 判断题：{sum(1 for q in items if q["type"] == "判断题")} 道')
lines.append('')
lines.append('---')
lines.append('')

for i, q in enumerate(items, 1):
    tag = '多选题' if q['type'] == '多选题' else '判断题'
    lines.append(f"### {i}. [{tag}] {q['text']}")
    lines.append('')
    lines.append(f"- 分类：{q['category']} ｜ 难度：{q['difficulty']}")
    lines.append('')
    if q['type'] == '多选题':
        for o in q['options']:
            lines.append(f"  - {o['key']}. {o['text']}")
    else:
        lines.append(f"  - 正确 / 错误")
    lines.append('')
    lines.append(f"**答案：{'、'.join(q['answer'])}**")
    if q.get('explanation'):
        lines.append('')
        lines.append(f"解析：{q['explanation']}")
    lines.append('')
    lines.append('---')
    lines.append('')

out = root.parent / '多选题判断题清单.md'
out.write_text('\n'.join(lines), encoding='utf-8')
print(f'已生成 {out}，共 {len(items)} 道题')
