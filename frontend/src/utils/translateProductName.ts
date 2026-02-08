/**
 * Dictionary để dịch các từ tiếng Việt phổ biến sang tiếng Anh
 */
const translationMap: Record<string, string> = {
  // Thời gian
  'tháng': 'Month',
  'tuần': 'Week',
  'ngày': 'Day',
  'năm': 'Year', // Note: "năm" có thể là "year" hoặc "five", ưu tiên "year" cho context sản phẩm
  'giờ': 'Hour',
  'phút': 'Minute',
  'giây': 'Second',
  
  // Số đếm (chỉ dịch khi đứng riêng, không phải trong context thời gian)
  'một': 'One',
  'hai': 'Two',
  'ba': 'Three',
  'bốn': 'Four',
  'sáu': 'Six',
  'bảy': 'Seven',
  'tám': 'Eight',
  'chín': 'Nine',
  'mười': 'Ten',
  
  // Từ khóa phổ biến
  'key': 'Key',
  'gói': 'Package',
  'bản': 'Version',
  'phiên': 'Session',
  'lần': 'Time',
  'cái': 'Item',
  'chiếc': 'Piece',
  
  // Tính từ
  'vip': 'VIP',
  'pro': 'Pro',
  'premium': 'Premium',
  'basic': 'Basic',
  'standard': 'Standard',
  'advanced': 'Advanced',
  
  // Loại sản phẩm
  'game': 'Game',
  'ứng dụng': 'App',
  'phần mềm': 'Software',
  'dịch vụ': 'Service',
};

/**
 * Dịch tên product từ tiếng Việt sang tiếng Anh
 * Ví dụ: "Key tháng Fluorite" -> "Key Month Fluorite"
 */
export function translateProductName(vietnameseName: string): string {
  if (!vietnameseName) return vietnameseName;
  
  // Tách các từ
  const words = vietnameseName.split(/\s+/);
  
  // Dịch từng từ
  const translatedWords = words.map((word, index) => {
    // Loại bỏ dấu câu và chuyển về chữ thường để so sánh
    const normalizedWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
    
    // Kiểm tra trong dictionary
    if (translationMap[normalizedWord]) {
      const translated = translationMap[normalizedWord];
      // Nếu từ đầu tiên hoặc từ trước đó kết thúc bằng dấu câu, viết hoa chữ cái đầu
      // Ngược lại, giữ nguyên format (thường là chữ thường)
      const shouldCapitalize = index === 0 || /[.!?]$/.test(words[index - 1]);
      return shouldCapitalize 
        ? translated.charAt(0).toUpperCase() + translated.slice(1).toLowerCase()
        : translated;
    }
    
    // Nếu không tìm thấy, giữ nguyên từ gốc
    return word;
  });
  
  return translatedWords.join(' ');
}

/**
 * Kiểm tra xem có từ tiếng Việt cần dịch không
 */
export function hasVietnameseWords(text: string): boolean {
  if (!text) return false;
  const words = text.toLowerCase().split(/\s+/);
  return words.some(word => {
    const normalizedWord = word.replace(/[.,!?;:]/g, '');
    return translationMap[normalizedWord] !== undefined;
  });
}

/**
 * Hiển thị tên product theo ngôn ngữ
 * Nếu ngôn ngữ là tiếng Anh và có từ tiếng Việt, sẽ tự động dịch
 * Nếu ngôn ngữ là tiếng Việt, giữ nguyên
 */
export function getDisplayProductName(productName: string, language: 'vi' | 'en'): string {
  if (!productName) return productName;
  
  // Nếu ngôn ngữ là tiếng Anh và có từ tiếng Việt, dịch sang tiếng Anh
  if (language === 'en' && hasVietnameseWords(productName)) {
    return translateProductName(productName);
  }
  
  // Ngược lại, giữ nguyên tên gốc
  return productName;
}

