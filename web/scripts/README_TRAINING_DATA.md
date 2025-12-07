# Gemini 학습 데이터 생성 스크립트 실행 안내

## 문제 상황
원본 파일 (`NexSupply_Gemini_TrainingData.jsonl`)에 JavaScript 형식의 `true`/`false`가 포함되어 있어 Python에서 직접 실행 시 문법 오류가 발생합니다.

## 해결 방법

### 방법 1: 파일 직접 수정 (가장 확실한 방법)

1. 파일을 텍스트 에디터로 엽니다
2. `Ctrl+H` (찾기 및 바꾸기) 실행
3. 다음 변환 수행:
   - `: true` → `: True`
   - `: false` → `: False`
   - 모든 항목을 바꾸기
4. 파일을 `.py` 확장자로 저장
5. Python으로 실행

### 방법 2: 스크립트 자동 변환

```bash
python web/scripts/fix_and_run_training_data.py
```

이 스크립트는 자동으로 변환을 시도하지만, 복잡한 문법 구조에서는 실패할 수 있습니다.

## 실행 후 결과

성공적으로 실행되면 다음 파일이 생성됩니다:
- `web/lib/nexsupply_gemini_finetuning.jsonl` - Gemini 학습용 JSONL 파일

## 수동 실행

파일을 수정한 후:

```bash
python NexSupply_Gemini_TrainingData.py
```

또는 원본 파일 경로에서:

```bash
cd C:\Users\kmyun\Downloads
python NexSupply_Gemini_TrainingData.py
```

