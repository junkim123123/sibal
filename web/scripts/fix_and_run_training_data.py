"""
NexSupply Gemini Training Data Generator - Fix and Run
원본 파일의 JSON true/false를 Python True/False로 변환하여 실행합니다.
"""
import json
import os
import sys

# 원본 파일 경로
input_file = r"C:\Users\kmyun\Downloads\NexSupply_Gemini_TrainingData.jsonl"
temp_file = "web/scripts/temp_training_data.py"
output_file = os.path.join("web", "lib", "nexsupply_gemini_finetuning.jsonl")

try:
    print(f"📖 Reading file: {input_file}")
    
    # 파일 읽기
    with open(input_file, "r", encoding="utf-8") as f:
        script_code = f.read()
    
    print("🔧 Fixing JavaScript true/false to Python True/False...")
    
    # 더 포괄적인 변환
    # 모든 패턴의 true/false 변환
    replacements = [
        (r':\s*true\s*([,\n\}])', r': True\1'),
        (r':\s*false\s*([,\n\}])', r': False\1'),
        (r',\s*true\s*([,\n\}])', r', True\1'),
        (r',\s*false\s*([,\n\}])', r', False\1'),
    ]
    
    import re
    for pattern, replacement in replacements:
        script_code = re.sub(pattern, replacement, script_code)
    
    # 직접 문자열 치환도 수행
    script_code = script_code.replace(': true,', ': True,')
    script_code = script_code.replace(': true}', ': True}')
    script_code = script_code.replace(': true\n', ': True\n')
    script_code = script_code.replace(': false,', ': False,')
    script_code = script_code.replace(': false}', ': False}')
    script_code = script_code.replace(': false\n', ': False\n')
    
    # 임시 파일로 저장
    os.makedirs(os.path.dirname(temp_file), exist_ok=True)
    with open(temp_file, "w", encoding="utf-8") as f:
        f.write(script_code)
    
    print(f"💾 Fixed script saved to: {temp_file}")
    print("🔄 Executing fixed script...")
    
    # Python 스크립트를 실행하기 위한 네임스페이스
    exec_namespace = {"json": json, "__name__": "__main__"}
    
    # 수정된 스크립트 실행
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
    
    # 임시 파일 정리 (선택사항)
    # os.remove(temp_file)
    
except FileNotFoundError as e:
    print(f"❌ Error: File not found - {e}")
    sys.exit(1)
except SyntaxError as e:
    print(f"❌ Syntax Error: {str(e)}")
    print(f"\n💡 수정된 파일을 확인하세요: {temp_file}")
    print("   파일을 직접 열어서 문법 오류를 수정한 후 다시 실행하세요.")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

