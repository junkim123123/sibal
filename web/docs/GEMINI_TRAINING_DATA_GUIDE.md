# Gemini 학습 데이터 생성 가이드

## 파일 위치
원본 파일: `C:\Users\kmyun\Downloads\NexSupply_Gemini_TrainingData.jsonl`

## 파일 구조
이 파일은 Python 스크립트로 작성되어 있으며, 다음과 같은 구조를 가집니다:

1. `import json` - JSON 모듈 import
2. `raw_data = [...]` - 500개의 공급업체 데이터 (JSON 형식)
3. `convert_to_gemini_format()` - Gemini 학습용 형식으로 변환하는 함수
4. 실행 로직 - 변환 및 파일 저장

## 실행 방법

### 방법 1: 직접 실행 (권장)

원본 파일이 Python 스크립트이므로, 파일 이름을 `.py`로 변경하여 실행할 수 있습니다:

```bash
# 1. 파일 복사 및 확장자 변경
Copy-Item "C:\Users\kmyun\Downloads\NexSupply_Gemini_TrainingData.jsonl" -Destination "NexSupply_Gemini_TrainingData.py"

# 2. 실행
python NexSupply_Gemini_TrainingData.py
```

### 방법 2: 수동 변환

JSON의 `true`/`false`를 Python의 `True`/`False`로 변환한 후 실행:

1. 파일을 열어서 모든 `true` → `True`, `false` → `False`로 변경
2. `.py` 확장자로 저장
3. Python으로 실행

## 출력 파일

실행 성공 시 다음 파일이 생성됩니다:
- `nexsupply_gemini_finetuning.jsonl` - Gemini 학습용 JSONL 파일

## 문제 해결

### SyntaxError 발생 시

파일 내 JSON 데이터에 JavaScript 형식의 `true`/`false`가 포함되어 있을 수 있습니다.
다음과 같이 변환하세요:

```python
# JavaScript 형식
"reddit_blacklist": true

# Python 형식으로 변환
"reddit_blacklist": True
```

### 파일 구조 확인

파일의 시작 부분이 다음과 같이 되어 있는지 확인하세요:

```python
import json

# 1. Original Data (Paste your full 500 records here)
raw_data = [
    {"supplier_id": "...", ...},
    ...
]
```

## 참고

- 생성된 JSONL 파일은 Gemini 모델 학습에 사용할 수 있습니다
- 각 레코드는 `messages` 형식으로 변환됩니다 (user/model 역할)

