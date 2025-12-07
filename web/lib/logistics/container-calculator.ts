/**
 * Logistics Container Loading Calculator
 * 
 * 제품 크기 정보를 기반으로 컨테이너 적재량을 계산합니다.
 */

export interface ContainerLoadingResult {
  container_loading: string;
  efficiency_score: 'High' | 'Medium' | 'Low';
  advice: string;
}

/**
 * 제품 크기 정보를 기반으로 컨테이너 적재량을 계산합니다.
 */
export function calculateContainerLoading(sizeTier: string): ContainerLoadingResult {
  if (!sizeTier || !sizeTier.trim()) {
    return {
      container_loading: 'Est. 1,500 units per 20ft container (Standard)',
      efficiency_score: 'Medium',
      advice: '표준 물류 기준을 따릅니다. 특별한 리스크는 없으나 최적화 여지는 남아있습니다.',
    };
  }

  const lowerCaseTier = sizeTier.toLowerCase().trim();

  // 사용자 요청 형태에 맞춘 매핑 정의 (한국어 advice 포함)
  if (lowerCaseTier.includes('shoe box') || lowerCaseTier === 's') {
    return {
      efficiency_score: 'Medium',
      container_loading: 'Est. 3,500 units per 20ft container (Optimized)',
      advice: '제품 포장 크기가 표준 FBA/LTL에 적합합니다. 팔레트 적재 효율을 최대화할 수 있습니다.',
    };
  } else if (lowerCaseTier.includes('large appliance') || lowerCaseTier === 'xl') {
    return {
      efficiency_score: 'Low',
      container_loading: 'Est. 200 units per 20ft container (Bulky)',
      advice: '크기가 매우 커 해상 운임 비용 부담이 높습니다. CBM을 줄이거나 KD(Knock-Down) 포장을 고려해야 합니다.',
    };
  } else if (lowerCaseTier.includes('small envelope') || lowerCaseTier === 'xs') {
    return {
      efficiency_score: 'High',
      container_loading: 'Est. 15,000 units per 20ft container (High Density)',
      advice: '매우 작은 크기로 물류 효율이 높습니다. 하지만 파손 리스크 방지를 위한 포장 보강이 필요합니다.',
    };
  } else {
    // 기본값 (사용자 요청 형태)
    return {
      efficiency_score: 'Medium',
      container_loading: 'Est. 1,500 units per 20ft container (Standard)',
      advice: '표준 물류 기준을 따릅니다. 특별한 리스크는 없으나 최적화 여지는 남아있습니다.',
    };
  }
}

