// 공통 함수: 텍스트 파일을 읽고 캔버스 사이즈를 파싱하는 함수
export const getCanvasSizes = async () => {
  const sizes = { F: {}, P: {}, M: {} };

  try {
    // 텍스트 파일 읽기
    const response = await fetch('/canvas_sizes.txt');
    const data = await response.text();

    // 텍스트 파일 파싱
    data.split('\n').forEach(line => {
      const [type, size, dimensions] = line.split(',');
      if (sizes[type]) {
        sizes[type][size] = dimensions;
      }
    });
  } catch (error) {
    console.error('Error fetching canvas sizes:', error);
  }

  return sizes;
};
