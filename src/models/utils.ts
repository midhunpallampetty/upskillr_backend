export const getCourseModelForSchool = (schoolName: string) => {
    return {
      find: async () => [{ name: 'Mock Course' }]
    };
  };
  