import mongoose from "mongoose";
import { Comment } from "../models/comment.model";
import { School } from "../models/school.model";
import studentSchema from "../models/studentschema.model";

export class CommentRepository {
  // Helper method to get models from school-specific DB
  private getModels(schoolName: string) {
    console.log(schoolName, 'schoolname in repo');
    const db = mongoose.connection.useDb(schoolName);
    console.log(db.name, 'db name');
    const Student = db.models.Student || db.model('Student', studentSchema);
    console.log(Student, 'student model');
    return { Student };
  }

  async create(data: any) {
    return await Comment.create(data);
  }

  async findByCourseId(courseId: string) {
    // Step 1: Fetch all comments for the course (without student lookup yet)
    const comments = await Comment.find({ course: courseId })
      .sort({ createdAt: -1 })
      .lean();

    if (comments.length === 0) {
      return [];
    }

    // Step 2: Group user IDs by school to handle multi-tenant lookups
    const schoolUserMap: Record<string, Set<string>> = {};
    comments.forEach((comment) => {
      const schoolIdStr = comment.school.toString();
      if (!schoolUserMap[schoolIdStr]) {
        schoolUserMap[schoolIdStr] = new Set();
      }
      schoolUserMap[schoolIdStr].add(comment.user.toString());
    });

    // Step 3: Fetch schools for all unique school IDs
    const uniqueSchoolIds = Object.keys(schoolUserMap).map(id => new mongoose.Types.ObjectId(id));
    const schools = await School.find({ _id: { $in: uniqueSchoolIds } }).lean();
    const schoolNameMap: Record<string, string> = {};
    schools.forEach((school) => {
      const subDomainUrl = school.subDomain; // e.g., "https://savoypublic.eduvia.space"
      const schoolName = subDomainUrl.split('//')[1].split('.')[0]; // Extracts "savoypublic"
      schoolNameMap[school._id.toString()] = schoolName;
    });

    // Step 4: Fetch students from each school's specific DB
    const studentMap: Map<string, any> = new Map();
    for (const [schoolIdStr, userIdSet] of Object.entries(schoolUserMap)) {
      const schoolName = schoolNameMap[schoolIdStr];
      if (!schoolName) {
        console.warn(`School name not found for schoolId: ${schoolIdStr}`);
        continue;
      }
      const { Student } = this.getModels(schoolName);
      const userIds = Array.from(userIdSet).map(id => new mongoose.Types.ObjectId(id));
      const students = await Student.find({ _id: { $in: userIds } })
        .select('_id fullName email image isVerified')
        .lean();
      students.forEach((student) => {
        studentMap.set(student._id.toString(), student);
      });
    }

    // Step 5: Merge student data into comments and project the required fields (including _id)
    const projectedComments = comments.map(comment => ({
      _id: comment._id,  // Added to fix mapping issue
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      parentComment: comment.parentComment,
      course: comment.course,
      school: comment.school,
      likes: comment.likes,
      user: studentMap.get(comment.user.toString()) || null, // If no match, user is null
    }));

    return projectedComments;
  }

  async findById(id: string) {
    return await Comment.findById(id);
  }

  async delete(id: string) {
    return await Comment.findByIdAndDelete(id);
  }

  async updateLikes(id: string, likes: string[]) {
    return await Comment.findByIdAndUpdate(id, { likes }, { new: true });
  }
}
