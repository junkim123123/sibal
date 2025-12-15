#!/usr/bin/env node

/**
 * Copy Guard - 회귀 방지 체크
 * 
 * 금지된 문자열이 코드베이스에 포함되어 있는지 검사합니다.
 * 빌드 전에 실행하여 잘못된 카피가 배포되는 것을 방지합니다.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 검사할 디렉토리
const ROOT_DIR = join(__dirname, '..');
const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'archive',
  'tmp',
  'logs',
];

// 검사할 파일 확장자
const INCLUDE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.md', '.json', '.txt'];

// 금지 문자열 목록
const FORBIDDEN_STRINGS = [
  {
    pattern: /Portfolio item/i,
    description: '포트폴리오 placeholder는 제거되었습니다',
  },
  {
    pattern: /0% defect/i,
    description: '과한 단정 표현 "0% defect"은 사용하지 않습니다',
  },
  {
    pattern: /100% compliance/i,
    description: '과한 단정 표현 "100% compliance"는 사용하지 않습니다',
  },
  {
    pattern: /Often 70% cheaper/i,
    description: '과한 단정 표현 "Often 70% cheaper"는 사용하지 않습니다',
  },
  {
    pattern: /4\.8\s*\/\s*5|4\.8\/5/i,
    description: '평점은 4.6으로 통일되었습니다',
  },
  {
    pattern: /24\s*hours|24\s*hrs/i,
    description: '시간 약속은 "within 1 business day"로 통일되었습니다',
  },
  {
    pattern: /alpha\s*flat\s*fee|flat\s*fee.*alpha/i,
    description: '"alpha flat fee" 카피는 제거되었습니다',
  },
  {
    pattern: /subscription.*199|\$199.*subscription|Pro.*199|\$199.*Pro/i,
    description: 'Pro $199 구독 모델은 더 이상 사용하지 않습니다',
  },
  {
    pattern: /PASSED/i,
    description: '"PASSED" 라벨은 사용하지 않습니다',
  },
  {
    pattern: /Verified Shipment/i,
    description: '"Verified Shipment" 라벨은 사용하지 않습니다',
  },
  {
    pattern: /from ['"]prisma|import.*prisma|require\(['"]prisma|@prisma|PrismaClient/i,
    description: 'Prisma는 사용하지 않습니다. Supabase 클라이언트를 사용하세요',
  },
];

// 파일이 제외 디렉토리에 있는지 확인
function shouldExclude(filePath) {
  const parts = filePath.split(/[/\\]/);
  return parts.some(part => EXCLUDE_DIRS.includes(part));
}

// 파일이 검사 대상인지 확인
function shouldInclude(filePath) {
  const ext = extname(filePath);
  return INCLUDE_EXTENSIONS.includes(ext);
}

// 디렉토리 재귀적으로 탐색
function walkDir(dir, fileList = []) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    
    if (shouldExclude(filePath)) {
      continue;
    }

    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath, fileList);
    } else if (stat.isFile() && shouldInclude(filePath)) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

// 파일에서 금지 문자열 검색
function checkFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const issues = [];

  // 제외할 컨텍스트 패턴 (제품 사양, 데이터 필드명 등)
  const excludePatterns = [
    /keeps cold for 24 hours/i, // 제품 성능 테스트 설명
    /passed_quantity/i, // 데이터베이스 필드명
    /passed_quantity:/i, // 객체 속성명
    /\.passed/i, // 객체 속성 접근
  ];

  for (const forbidden of FORBIDDEN_STRINGS) {
    const matches = content.matchAll(new RegExp(forbidden.pattern, 'gi'));
    
    for (const match of matches) {
      // 제외 패턴 확인
      const shouldExclude = excludePatterns.some(pattern => {
        const contextStart = Math.max(0, match.index - 50);
        const contextEnd = Math.min(content.length, match.index + match[0].length + 50);
        const context = content.substring(contextStart, contextEnd);
        return pattern.test(context);
      });

      if (shouldExclude) {
        continue;
      }

      const lineNumber = content.substring(0, match.index).split('\n').length;
      const line = content.split('\n')[lineNumber - 1]?.trim() || '';
      
      issues.push({
        file: filePath.replace(ROOT_DIR + '/', ''),
        line: lineNumber,
        match: match[0],
        description: forbidden.description,
        context: line.substring(0, 100),
      });
    }
  }

  return issues;
}

// 메인 실행
function main() {
  console.log('🔍 Copy Guard 실행 중...\n');
  
  const files = walkDir(ROOT_DIR);
  console.log(`📁 검사할 파일: ${files.length}개\n`);

  const allIssues = [];
  
  for (const file of files) {
    const issues = checkFile(file);
    if (issues.length > 0) {
      allIssues.push(...issues);
    }
  }

  if (allIssues.length > 0) {
    console.error('❌ 금지된 문자열이 발견되었습니다:\n');
    
    // 파일별로 그룹화
    const issuesByFile = {};
    for (const issue of allIssues) {
      if (!issuesByFile[issue.file]) {
        issuesByFile[issue.file] = [];
      }
      issuesByFile[issue.file].push(issue);
    }

    // 출력
    for (const [file, issues] of Object.entries(issuesByFile)) {
      console.error(`\n📄 ${file}:`);
      for (const issue of issues) {
        console.error(`  Line ${issue.line}: ${issue.match}`);
        console.error(`  ⚠️  ${issue.description}`);
        console.error(`  📝 ${issue.context}`);
        console.error('');
      }
    }

    console.error(`\n❌ 총 ${allIssues.length}개의 문제가 발견되었습니다.`);
    console.error('빌드를 계속하려면 위 문제들을 수정해주세요.\n');
    process.exit(1);
  } else {
    console.log('✅ 모든 검사를 통과했습니다!\n');
    process.exit(0);
  }
}

main();

