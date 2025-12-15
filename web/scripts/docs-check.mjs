#!/usr/bin/env node
/**
 * 문서 검증 스크립트
 * 
 * HANDOVER.md 문서에서 언급된 파일 경로가 실제로 존재하는지 검사합니다.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const webRoot = join(__dirname, '..');

// HANDOVER.md 파일 읽기
const handoverPath = join(webRoot, 'docs', 'HANDOVER.md');
let handoverContent;

try {
  handoverContent = readFileSync(handoverPath, 'utf-8');
} catch (error) {
  console.error(`❌ HANDOVER.md 파일을 읽을 수 없습니다: ${handoverPath}`);
  process.exit(1);
}

// 파일 경로 패턴 추출
// 1. 백틱으로 감싸진 경로: `web/app/chat/page.tsx`
// 2. 코드 블록 내 경로: web/app/chat/page.tsx
// 3. 마크다운 링크: [text](path/to/file.ts)

const foundPaths = new Set();

// 패턴 1: 백틱으로 감싸진 경로 (인라인 코드)
const backtickPattern = /`([\w/.-]+\.(ts|tsx|js|jsx|sql|md|json|yml|yaml))`/g;
let match;
while ((match = backtickPattern.exec(handoverContent)) !== null) {
  const path = match[1];
  // web/로 시작하거나 app/, lib/, components/, supabase/ 등으로 시작하는 경로만
  if (path.startsWith('web/') || path.startsWith('app/') || path.startsWith('lib/') || 
      path.startsWith('components/') || path.startsWith('supabase/')) {
    foundPaths.add(path);
  }
}

// 패턴 2: 코드 블록 내 경로 (줄 단위)
const codeBlockPattern = /^[\s]*([\w/.-]+\.(ts|tsx|js|jsx|sql|md|json|yml|yaml))$/gm;
let codeMatch;
while ((codeMatch = codeBlockPattern.exec(handoverContent)) !== null) {
  const path = codeMatch[1];
  // web/로 시작하거나 app/, lib/, components/, supabase/ 등으로 시작하는 경로만
  if (path.startsWith('web/') || path.startsWith('app/') || path.startsWith('lib/') || 
      path.startsWith('components/') || path.startsWith('supabase/')) {
    foundPaths.add(path);
  }
}

// 패턴 3: 마크다운 링크 (상대 경로만)
const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
while ((match = linkPattern.exec(handoverContent)) !== null) {
  const linkPath = match[2];
  // http, https, #로 시작하지 않는 상대 경로만
  if (!linkPath.startsWith('http') && !linkPath.startsWith('https') && !linkPath.startsWith('#')) {
    // 파일 확장자가 있는 경우만
    if (linkPath.match(/\.(ts|tsx|js|jsx|sql|md|json|yml|yaml)$/)) {
      foundPaths.add(linkPath);
    }
  }
}

// 경로 검증
const brokenLinks = [];
const validPaths = [];

for (const path of foundPaths) {
  // 경로 정규화
  let normalizedPath = path;
  
  // web/로 시작하는 경우 webRoot 기준
  if (path.startsWith('web/')) {
    normalizedPath = join(webRoot, path.substring(4));
  } else if (path.startsWith('/')) {
    // 절대 경로 스킵 (외부 링크)
    continue;
  } else if (path.match(/\.(ts|tsx|js|jsx|sql|md|json|yml|yaml)$/)) {
    // web/ 없이 시작하는 경우 webRoot 기준
    normalizedPath = join(webRoot, path);
  } else {
    // 확장자가 없는 경로는 스킵
    continue;
  }

  // 파일 존재 확인
  if (existsSync(normalizedPath)) {
    validPaths.push(path);
  } else {
    brokenLinks.push(path);
  }
}

// 결과 출력
console.log('📄 문서 경로 검증 결과\n');
console.log(`✅ 유효한 경로: ${validPaths.length}개`);
console.log(`❌ 깨진 링크: ${brokenLinks.length}개\n`);

if (brokenLinks.length > 0) {
  console.log('❌ 깨진 링크 목록:\n');
  brokenLinks.forEach((path) => {
    console.log(`  - ${path}`);
  });
  console.log('');
  process.exit(1);
} else {
  console.log('✅ 모든 경로가 유효합니다!\n');
  process.exit(0);
}
