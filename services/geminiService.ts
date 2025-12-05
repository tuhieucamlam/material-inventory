import { GoogleGenAI } from "@google/genai";
import { Transaction, InventoryItem } from "../types";

export const generateInventoryInsight = async (
  items: InventoryItem[],
  transactions: Transaction[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Chưa cấu hình API Key để sử dụng tính năng AI.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare a summary of data for the AI
    const summary = {
      totalItems: items.length,
      stockSummary: items.slice(0, 15).map(i => `${i.itemCode}-${i.materialName}: ${i.stockIn} ${i.unit}`).join(', '), // Limit to 15 items to avoid token limits
      recentTransactions: transactions.slice(-10).map(t => 
        `${t.date.split('T')[0]}: ${t.type} ${t.quantity} ${t.itemName}`
      ).join('; ')
    };

    const prompt = `
      Bạn là trợ lý quản lý kho. Dựa trên dữ liệu sau:
      - Tổng số mã vật tư: ${summary.totalItems}
      - Tồn kho một số mã (mẫu): ${summary.stockSummary}
      - 10 giao dịch gần nhất: ${summary.recentTransactions}

      Hãy đưa ra một nhận xét ngắn gọn (dưới 100 từ) về tình hình kho hàng hiện tại và xu hướng nhập xuất. Đưa ra lời khuyên nếu có mặt hàng nào tồn quá thấp so với mức thông thường hoặc không có giao dịch.
      Trả lời bằng tiếng Việt.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Không thể tạo nhận xét lúc này.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Đã xảy ra lỗi khi phân tích dữ liệu.";
  }
};