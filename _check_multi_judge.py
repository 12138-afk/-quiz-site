# -*- coding: utf-8 -*-
"""对比 Codex 生成的 questions.json 与 Excel 原文中的多选题/判断题是否逐题一致。"""
import json
from pathlib import Path
import openpyxl

root = Path(__file__).resolve().parent
source = next(p for p in root.parent.glob('*.xlsx') if not p.name.startswith('~$'))
workbook = openpyxl.load_workbook(source, data_only=True)

expected = []
for sheet in workbook:
    judgement = sheet.title == '判断题'
    for row_number, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), 2):
        if not row[0]:
            continue
        answer = str(row[1] if judgement else row[9]).strip()
        options = [{'key': k, 'text': k} for k in ['正确', '错误']] if judgement else [
            {'key': chr(65 + i), 'text': str(v).strip()} for i, v in enumerate(row[1:9]) if v is not None]
        answers = [answer] if judgement else sorted(set(answer))
        expected.append(dict(
            type=sheet.title,
            text=str(row[0]).strip(),
            options=options,
            answer=answers,
            explanation=str(row[2 if judgement else 10] or '').strip(),
            category=str(row[3 if judgement else 11] or '未分类').strip(),
            difficulty=str(row[4 if judgement else 12] or '未标注').strip(),
            sourceRow=row_number))

# 只取多选和判断
exp = [e for e in expected if e['type'] in ('多选题', '判断题')]

actual = json.loads((root / 'app' / 'questions.json').read_text(encoding='utf-8'))
act = [a for a in actual if a['type'] in ('多选题', '判断题')]

print(f'Excel 期望: 多选 {sum(1 for e in exp if e["type"]=="多选题")} 题, 判断 {sum(1 for e in exp if e["type"]=="判断题")} 题')
print(f'questions.json 实际: 多选 {sum(1 for a in act if a["type"]=="多选题")} 题, 判断 {sum(1 for a in act if a["type"]=="判断题")} 题')

if len(exp) != len(act):
    print('!! 数量不一致')
    raise SystemExit(1)

diffs = []
for e, a in zip(exp, act):
    for key in ('text', 'answer', 'explanation', 'category', 'difficulty'):
        if e[key] != a[key]:
            diffs.append((e['type'], e['sourceRow'], key, e[key], a[key]))
    eo = [(o['key'], o['text']) for o in e['options']]
    ao = [(o['key'], o['text']) for o in a['options']]
    if eo != ao:
        diffs.append((e['type'], e['sourceRow'], 'options', eo, ao))

print(f'差异条数: {len(diffs)}')
for d in diffs[:30]:
    print(d)

# 输出每题 id 位置（在 questions.json 中的顺序）
ids = [a['id'] for a in actual if a['type'] in ('多选题', '判断题')]
print('多选/判断题在 questions.json 中的 id 区间:', ids[0], '~', ids[-1], f'(共 {len(ids)} 条)')
