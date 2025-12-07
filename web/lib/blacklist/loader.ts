/**
 * Blacklist Loader
 * 
 * 블랙리스트 JSON/CSV 파일을 로드하고 검색할 수 있는 유틸리티를 제공합니다.
 * JSON 파일을 우선 사용하며, 없을 경우 CSV 파일을 fallback으로 사용합니다.
 */

import fs from 'fs';
import path from 'path';

export interface BlacklistEntry {
  supplier_id: string;
  company_name: string;
  risk_score: number;
  note: string;
}

let blacklistCache: BlacklistEntry[] | null = null;

/**
 * 블랙리스트 JSON 파일을 로드하고 파싱합니다.
 */
function loadBlacklist(): BlacklistEntry[] {
  if (blacklistCache) {
    return blacklistCache;
  }

  try {
    // JSON 파일 우선 시도
    const jsonPath = path.join(process.cwd(), 'web/lib/data/blacklist.json');
    if (fs.existsSync(jsonPath)) {
      const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
      const jsonData = JSON.parse(jsonContent);
      
      const entries: BlacklistEntry[] = jsonData.map((item: any, index: number) => ({
        supplier_id: item.supplier_id || `WEB_S${String(index).padStart(6, '0')}`,
        company_name: item.company_name || '',
        risk_score: typeof item.risk_score === 'number' ? item.risk_score : (typeof item.expert_initial_risk_score === 'number' ? item.expert_initial_risk_score : 0),
        note: item.note || item.expert_qualitative_note || '',
      }));
      
      blacklistCache = entries;
      return entries;
    }
    
    // Fallback: CSV 파일 로드 (하위 호환성)
    const csvPath = path.join(process.cwd(), 'web/lib/NexSupply_Blacklist.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Skip header
    const entries: BlacklistEntry[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      // CSV 파싱 (쉼표로 구분, 하지만 노트 필드에 쉼표가 있을 수 있음)
      const parts: string[] = [];
      let currentPart = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(currentPart.trim());
          currentPart = '';
        } else {
          currentPart += char;
        }
      }
      parts.push(currentPart.trim());
      
      if (parts.length >= 4) {
        entries.push({
          supplier_id: parts[0] || '',
          company_name: parts[1] || '',
          risk_score: parseInt(parts[2]) || 0,
          note: parts[3] || '',
        });
      }
    }
    
    blacklistCache = entries;
    return entries;
  } catch (error) {
    console.error('[Blacklist] Failed to load blacklist:', error);
    return [];
  }
}

/**
 * 공급업체가 블랙리스트에 있는지 확인합니다.
 * 
 * @param supplierInfo - 공급업체 ID, 회사명, 또는 URL에서 추출한 정보
 * @returns 블랙리스트 엔트리 또는 null
 */
export function checkBlacklist(supplierInfo: string): BlacklistEntry | null {
  const blacklist = loadBlacklist();
  
  if (!supplierInfo || !supplierInfo.trim()) {
    return null;
  }
  
  const normalized = supplierInfo.trim().toLowerCase();
  
  // 회사명으로 검색 (부분 일치)
  for (const entry of blacklist) {
    const normalizedCompanyName = entry.company_name.toLowerCase();
    
    // 정확한 일치
    if (normalizedCompanyName === normalized) {
      return entry;
    }
    
    // 부분 일치 (회사명이 입력값을 포함하거나, 입력값이 회사명을 포함)
    if (normalizedCompanyName.includes(normalized) || normalized.includes(normalizedCompanyName)) {
      return entry;
    }
    
    // Supplier ID로 검색
    if (entry.supplier_id.toLowerCase() === normalized) {
      return entry;
    }
  }
  
  return null;
}

/**
 * URL에서 공급업체 정보를 추출하여 블랙리스트를 확인합니다.
 * 
 * @param url - Alibaba, Amazon 등의 URL
 * @returns 블랙리스트 엔트리 또는 null
 */
export function checkBlacklistFromUrl(url: string): BlacklistEntry | null {
  if (!url || !url.trim()) {
    return null;
  }
  
  // URL에서 공급업체 정보 추출 시도
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Alibaba URL에서 추출
    if (hostname.includes('alibaba.com')) {
      // Alibaba URL 패턴: https://company-name.en.alibaba.com 또는 https://alibaba.com/company/company-name
      // company 이름 추출 시도
      const companyNameMatch = url.match(/alibaba\.com\/company\/([^/]+)/i);
      if (companyNameMatch && companyNameMatch[1]) {
        // URL 디코딩 및 하이픈을 공백으로 변환
        const companyName = decodeURIComponent(companyNameMatch[1].replace(/-/g, ' '));
        const check = checkBlacklist(companyName);
        if (check) {
          return check;
        }
      }
      
      // 경로에서 company 이름 추출
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      for (const part of pathParts) {
        if (part && part.length > 3) {
          const decodedPart = decodeURIComponent(part).replace(/-/g, ' ');
          const check = checkBlacklist(decodedPart);
          if (check) {
            return check;
          }
        }
      }
      
      // 호스트명에서 추출 시도 (서브도메인)
      const subdomain = urlObj.hostname.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'm' && subdomain !== 'en') {
        const check = checkBlacklist(subdomain);
        if (check) {
          return check;
        }
      }
    }
    
    // Amazon URL - 일반적으로 공급업체 정보가 직접적으로 포함되지 않음
    // 하지만 브랜드명 등이 있을 수 있음
    
    // 전체 URL 문자열로도 검색
    return checkBlacklist(url);
  } catch (error) {
    // URL 파싱 실패 시 원본 문자열로 검색
    return checkBlacklist(url);
  }
}

/**
 * 회사명이나 공급업체 ID로 블랙리스트를 확인합니다.
 * 
 * @param companyName - 회사명
 * @param supplierId - 공급업체 ID (선택)
 * @returns 블랙리스트 엔트리 또는 null
 */
export function checkBlacklistByCompany(
  companyName?: string,
  supplierId?: string
): BlacklistEntry | null {
  if (supplierId) {
    const check = checkBlacklist(supplierId);
    if (check) {
      return check;
    }
  }
  
  if (companyName) {
    const check = checkBlacklist(companyName);
    if (check) {
      return check;
    }
  }
  
  return null;
}

/**
 * 모든 블랙리스트 엔트리를 반환합니다.
 */
export function getAllBlacklistEntries(): BlacklistEntry[] {
  return loadBlacklist();
}

