export interface ConsultationLead {
  id: string;
  name: string;
  phone: string;
  serviceType: string;
  location: string;
  preferredTime: string;
  memo?: string;
  status: "상담대기" | "상담완료" | "부재중" | "취소";
  createdAt: string;
  ip?: string;
}

export interface WorkPhotoItem {
  id: string; // e.g. "work-photo-01"
  title: string;
  category: string;
  description: string;
  placeholderText: string; // "work-photo-01"
  defaultBadge: string;
}

export interface ReviewImageItem {
  id: string; // e.g. "review-image-01"
  author: string;
  serviceUsed: string;
  location: string;
  rating: number;
  date: string;
  content: string;
  placeholderText: string; // "review-image-01"
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export interface CompanyInfo {
  companyName: string;
  representative: string;
  businessNumber: string;
  mailOrderNumber: string;
  phone: string;
  mobile: string;
  email: string;
  address: string;
  privacyManager: string;
  operatingHours: string;
}
