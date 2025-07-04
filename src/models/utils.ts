// models/utils.ts
export const getCourseModelForSchool = (schoolName: string) => {
    // return dynamic model based on name
    return {
      find: async () => [{ name: 'Mock Course' }]
    };
  };
  