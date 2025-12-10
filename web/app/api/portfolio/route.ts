import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const portfolioDir = join(process.cwd(), 'public', 'images', 'portfolio');
    
    const items: Array<{ 
      id: string; 
      image: string; 
      productName: string;
      alt: string;
    }> = [];
    
    // portfolio 폴더 내의 모든 하위 폴더(상품명) 스캔
    try {
      const folders = await readdir(portfolioDir);
      
      for (const folder of folders) {
        const folderPath = join(portfolioDir, folder);
        const folderStat = await stat(folderPath);
        
        // 폴더인 경우만 처리
        if (folderStat.isDirectory()) {
          try {
            const files = await readdir(folderPath);
            
            // 이미지 파일만 필터링
            const imageFiles = files.filter(file => 
              /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
            );
            
            // 각 이미지를 개별 아이템으로 추가
            imageFiles.forEach((file, index) => {
              items.push({
                id: `${folder}-${index}`,
                image: `/images/portfolio/${folder}/${file}`,
                productName: folder.replace(/-/g, ' ').replace(/_/g, ' '), // 폴더명을 상품명으로 사용 (하이픈/언더스코어를 공백으로)
                alt: `${folder} - ${file.replace(/\.[^/.]+$/, '')}`, // 파일명에서 확장자 제거
              });
            });
          } catch (error) {
            // 개별 폴더 읽기 실패 시 무시
            console.log(`Failed to read folder ${folder}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error reading portfolio directory:', error);
    }
    
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error loading portfolio:', error);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}

