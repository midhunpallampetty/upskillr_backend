interface Section {
    title: string;
  }
  
export interface CourseRequestBody {
  courseName: string;
  isPreliminaryRequired: boolean;
  courseThumbnail: string; // URL or filename
  noOfLessons: number;
  fee: number;
  sections: Section[];
  forum: string | null;
  school: string;
}