export interface VideoInput {
  videoName: string;
  url: string;
  description?: string;
}

export interface ExamInput {
  title: string;
  totalMarks: number;
}

export interface SectionInput {
  sectionName: string;
  examRequired: boolean;
  videos?: VideoInput[];
  exam?: ExamInput;
}

export interface CourseRequestBody {
  courseName: string;
  fee: number;
  noOfLessons: number;
  courseThumbnail?: string;
  isPreliminaryRequired?: boolean;
  schoolId: string; // You might already be passing this
  sections?: SectionInput[];
}
