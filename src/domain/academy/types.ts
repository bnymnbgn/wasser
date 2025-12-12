// Academy Types
export interface AcademyTopic {
    id: string;
    title: string;
    subtitle?: string;
    content: string;
}

export interface MineralArticle {
    id: string;
    label: string;
    emoji: string;
    shortDesc: string;
    topics: AcademyTopic[];
}

export interface ProfileArticle {
    id: string;
    label: string;
    emoji: string;
    shortDesc: string;
    topics: AcademyTopic[];
}
