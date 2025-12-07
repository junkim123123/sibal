"""
NexSupply Gemini Training Data Generator 실행 스크립트
원본 파일을 읽어서 JSONL 형식의 학습 데이터를 생성합니다.
"""
import json
import os
import sys
import re

# 원본 파일 경로
input_file = r"C:\Users\kmyun\Downloads\NexSupply_Gemini_TrainingData.jsonl"
output_file = os.path.join("web", "lib", "nexsupply_gemini_finetuning.jsonl")

try:
    print(f"📖 Reading file: {input_file}")
    
    # 파일을 읽어서 실행
    with open(input_file, "r", encoding="utf-8") as f:
        script_code = f.read()
    
    # JSON 형식의 true/false를 Python True/False로 변환
    # 더 정확한 정규식 패턴 사용
    script_code = re.sub(r':\s*true\s*([,\}])', r': True\1', script_code)
    script_code = re.sub(r':\s*false\s*([,\}])', r': False\1', script_code)
    
    # Python 스크립트를 실행하기 위한 네임스페이스
    exec_namespace = {"json": json, "__name__": "__main__"}
    
    print("🔄 Executing script...")
    # 스크립트 실행 (raw_data와 함수들을 네임스페이스에 로드)
    exec(script_code, exec_namespace)
    
    # raw_data 확인
    if 'raw_data' not in exec_namespace:
        print("❌ Error: 'raw_data' not found in script")
        sys.exit(1)
    
    raw_data = exec_namespace['raw_data']
    print(f"✅ Loaded {len(raw_data)} records from raw_data")
    
    if not raw_data:
        print("❌ Error: raw_data is empty")
        sys.exit(1)
    
    # 변환 함수 실행
    if 'convert_to_gemini_format' not in exec_namespace:
        print("❌ Error: 'convert_to_gemini_format' function not found")
        sys.exit(1)
    
    print("🔄 Converting to Gemini format...")
    convert_func = exec_namespace['convert_to_gemini_format']
    formatted_data = convert_func(raw_data)
    
    print(f"✅ Converted {len(formatted_data)} training examples")
    
    # 출력 디렉토리 생성
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # JSONL 파일로 저장
    print(f"💾 Saving to {output_file}...")
    with open(output_file, "w", encoding="utf-8") as f:
        for item in formatted_data:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
    
    file_size_kb = os.path.getsize(output_file) / 1024
    print(f"\n✅ Conversion Successful!")
    print(f"📊 Total records processed: {len(formatted_data)}")
    print(f"📁 Output file: {output_file}")
    print(f"📏 File size: {file_size_kb:.2f} KB")
    
except FileNotFoundError:
    print(f"❌ Error: File not found at {input_file}")
    sys.exit(1)
except SyntaxError as e:
    print(f"❌ Syntax Error: {str(e)}")
    print("\n💡 Tip: 파일 내 JSON 데이터의 'true'/'false'가 제대로 변환되지 않았을 수 있습니다.")
    print("   파일을 열어서 모든 'true' → 'True', 'false' → 'False'로 수동 변경하세요.")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
