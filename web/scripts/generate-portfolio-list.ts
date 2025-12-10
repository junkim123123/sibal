import { readdir, stat, writeFile } from 'fs/promises';
import { join } from 'path';

interface PortfolioItem {
  id: string;
  image: string;
  productName: string;
  alt: string;
}

async function generatePortfolioList() {
  try {
    const portfolioDir = join(process.cwd(), 'public', 'images', 'portfolio');
    const outputFile = join(process.cwd(), 'public', 'portfolio-list.json');
    
    const items: PortfolioItem[] = [];
    
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
                productName: folder.replace(/-/g, ' ').replace(/_/g, ' '),
                alt: `${folder} - ${file.replace(/\.[^/.]+$/, '')}`,
              });
            });
          } catch (error) {
            console.log(`Failed to read folder ${folder}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error reading portfolio directory:', error);
    }
    
    // JSON 파일로 저장
    await writeFile(outputFile, JSON.stringify({ items }, null, 2), 'utf-8');
    console.log(`✅ Generated portfolio list with ${items.length} items`);
  } catch (error) {
    console.error('Error generating portfolio list:', error);
    // 빌드 실패를 방지하기 위해 빈 배열로 저장
    const outputFile = join(process.cwd(), 'public', 'portfolio-list.json');
    await writeFile(outputFile, JSON.stringify({ items: [] }, null, 2), 'utf-8');
  }
}

generatePortfolioList();

