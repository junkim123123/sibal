import json
import sys
import os

# 파일 경로 설정
input_file = r"C:\Users\kmyun\Downloads\NexSupply_Gemini_TrainingData.jsonl"
output_file = "nexsupply_gemini_finetuning.jsonl"

# 파일 읽기 및 Python 코드 실행
try:
    with open(input_file, "r", encoding="utf-8") as f:
        script_content = f.read()
    
    # Python 스크립트 실행을 위해 임시 네임스페이스 생성
    namespace = {}
    exec(script_content, namespace)
    
    # raw_data 추출
    if 'raw_data' in namespace and namespace['raw_data']:
        raw_data = namespace['raw_data']
        print(f"✅ Loaded {len(raw_data)} records from script")
        
        # 변환 함수 실행
        if 'convert_to_gemini_format' in namespace:
            formatted_data = namespace['convert_to_gemini_format'](raw_data)
            
            # JSONL 파일로 저장
            output_path = os.path.join("web", "lib", output_file)
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, "w", encoding="utf-8") as f:
        for item in formatted_data:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
            
            print(f"✅ Conversion Successful! File created: '{output_path}'")
    print(f"Total records processed: {len(formatted_data)}")
else:
            print("❌ Error: 'convert_to_gemini_format' function not found in script")
    else:
        print("❌ Error: 'raw_data' is empty or not found. Please check the script.")
        
except FileNotFoundError:
    print(f"❌ Error: File not found at {input_file}")
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
