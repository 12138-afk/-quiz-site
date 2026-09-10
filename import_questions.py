"""Rebuild the web question bank from the original workbook; never modify Excel."""
import json
from pathlib import Path
import openpyxl

root = Path(__file__).resolve().parent
source = next(root.parent.glob('*.xlsx'))
workbook = openpyxl.load_workbook(source, data_only=True)
questions = []
for sheet in workbook:
    for row_number, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), 2):
        if not row[0]:
            continue
        judgement = sheet.title == '判断题'
        answer = str(row[1] if judgement else row[9]).strip()
        options = [{'key': k, 'text': k} for k in ['正确', '错误']] if judgement else [
            {'key': chr(65+i), 'text': str(v).strip()} for i, v in enumerate(row[1:9]) if v is not None]
        answers = [answer] if judgement else sorted(set(answer))
        assert answers and set(answers) <= {o['key'] for o in options}, (sheet.title, row_number, answer)
        assert judgement or (len(answers) == 1 if sheet.title == '单选题' else len(answers) > 1)
        questions.append(dict(id=f'{sheet.title}-{row_number}', type=sheet.title,
            text=str(row[0]).strip(), options=options, answer=answers,
            explanation=str(row[2 if judgement else 10] or '').strip(),
            category=str(row[3 if judgement else 11] or '未分类').strip(),
            difficulty=str(row[4 if judgement else 12] or '未标注').strip(), sourceRow=row_number))
(root/'app'/'questions.json').write_text(json.dumps(questions, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Imported {len(questions)} validated questions.')
