export interface SiteInformation {
  id: number;
  address: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  phone_1: string | null;
  phone_2: string | null;
  email: string | null;
  google_maps_url: string | null;
  return_policy: string;
  service_terms: string;
  privacy_and_policy: string;
  terms_and_conditions: {
    title: string;
    description: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AboutUsData {
  section_1: {
    image: string;
    title: string;
    text: string;
    sub_section_1: {
      icon: string;
      subtitle: string;
      text: string;
    };
    sub_section_2: {
      icon: string;
      subtitle: string;
      text: string;
    };
    bullets: Record<string, string>;
    link: string;
  };
  section_2: {
    image: string;
    title: string;
    text: string;
    sub_section: {
      subtitle: string;
      text: string;
    };
    bullets: Record<string, string>;
    video_link: string;
  };
  section_3: {
    side_title_1: string;
    side_text_1: string;
    side_title_2: string;
    side_text_2: string;
    side_title_3: string;
    side_text_3: string;
  };
  section_4: {
    title: string;
    text: string;
  };
  about: Record<string, string>;
  objective: Record<string, string>;
  excellent: Record<string, string>;
  meta_description: string;
  meta_keywords: string[];
}

export interface AboutUsResponse {
  status: boolean;
  message: string;
  errors: any[];
  data: AboutUsData;
}

export interface SiteInformationResponse {
  status: boolean;
  message: string;
  errors: any[];
  data: SiteInformation;
}
