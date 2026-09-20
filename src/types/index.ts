export type UserRole = 'buyer' | 'seller' | 'both';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type LicenseType = 'standard' | 'commercial';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface ExifData {
  make?: string;
  model?: string;
  lens?: string;
  shutter?: string;
  aperture?: string;
  iso?: number | string;
  focal_length?: string;
  white_balance?: string;
  exposure_mode?: string;
  metering_mode?: string;
  software?: string;
  color_space?: string;
  date_taken?: string;
  gps?: {
    latitude?: number;
    longitude?: number;
  };
  raw?: Record<string, any>;
}

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio?: string;
  role: UserRole;
  created_at: string;
}

export interface Photo {
  id: string;
  seller_id: string;
  title: string;
  description?: string;
  price: number;
  tags: string[];
  category: string;
  orientation: 'landscape' | 'portrait' | 'square';
  original_url: string;
  watermarked_url: string;
  phash: string;
  exif_data: ExifData;
  verification_status: VerificationStatus;
  rejection_reason?: string | null;
  is_ai_flagged: boolean;
  created_at: string;
  seller?: Profile;
}

export interface Order {
  id: string;
  buyer_id: string;
  photo_id: string;
  amount: number;
  license_type: LicenseType;
  payment_status: PaymentStatus;
  created_at: string;
  photo?: Photo;
}

export interface VerificationResult {
  status: VerificationStatus;
  isAiFlagged: boolean;
  isDuplicate: boolean;
  duplicateOf?: {
    photo_id: string;
    title: string;
    distance: number;
  } | null;
  rejectionReason?: string;
  exif: ExifData;
  phash: string;
  confidence: number;
  checks: {
    formatValid: boolean;
    exifExtracted: boolean;
    hardwareTagsPresent: boolean;
    duplicateCheckPassed: boolean;
    aiSignaturesAbsent: boolean;
  };
}
