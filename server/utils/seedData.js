import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const courseCategories = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "Cloud Computing",
  "Cybersecurity",
  "UI/UX Design",
  "Game Development",
  "Blockchain"
];

const courseLevels = ["Beginner", "Medium", "Advance"];

const indianNames = {
  instructors: [
    { name: "Rajesh Kumar", email: "rajesh@example.com" },
    { name: "Priya Sharma", email: "priya@example.com" },
    { name: "Amit Patel", email: "amit@example.com" }
  ],
  students: [
    { name: "Ananya Singh", email: "ananya@example.com" },
    { name: "Vikram Verma", email: "vikram@example.com" },
    { name: "Neha Gupta", email: "neha@example.com" },
    { name: "Arjun Reddy", email: "arjun@example.com" },
    { name: "Pooja Mehta", email: "pooja@example.com" }
  ]
};

const createLectures = async (courseTitle, numLectures) => {
  const lectures = [];
  for (let i = 1; i <= numLectures; i++) {
    const lecture = await Lecture.create({
      lectureTitle: `${courseTitle} - Lecture ${i}`,
      isPreviewFree: i === 1 // Make first lecture free
    });
    lectures.push(lecture);
  }
  return lectures;
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lecture.deleteMany({});

    // Create instructors
    const hashedPassword = await bcrypt.hash("password123", 10);
    const instructors = await Promise.all(
      indianNames.instructors.map(instructor =>
        User.create({
          name: instructor.name,
          email: instructor.email,
          password: hashedPassword,
          role: "instructor"
        })
      )
    );

    // Create students
    const students = await Promise.all(
      indianNames.students.map(student =>
        User.create({
          name: student.name,
          email: student.email,
          password: hashedPassword,
          role: "student"
        })
      )
    );

    // Create 30 courses
    const courses = [];
    for (let i = 1; i <= 30; i++) {
      const category = courseCategories[Math.floor(Math.random() * courseCategories.length)];
      const level = courseLevels[Math.floor(Math.random() * courseLevels.length)];
      const instructor = instructors[Math.floor(Math.random() * instructors.length)];
      const numLectures = Math.floor(Math.random() * 10) + 5; // 5-15 lectures per course
      const price = (Math.floor(Math.random() * 4000) + 1000); // ₹1000-₹5000

      const lectures = await createLectures(`Course ${i}`, numLectures);

      const course = await Course.create({
        courseTitle: `${category} Masterclass ${i}`,
        subTitle: `Complete ${category} Course - ${level} Level`,
        description: `Master ${category} from basics to advanced concepts. This ${level.toLowerCase()} level course provides comprehensive training in ${category} with practical projects and hands-on exercises.`,
        category: category.toLowerCase(),
        courseLevel: level,
        coursePrice: price,
        creator: instructor._id,
        lectures: lectures.map(lecture => lecture._id),
        isPublished: true,
        enrolledStudents: [students[Math.floor(Math.random() * students.length)]._id]
      });

      courses.push(course);
    }

    // Update user enrolled courses
    for (const student of students) {
      const randomCourses = courses
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 5) + 3); // 3-8 courses per student

      await User.findByIdAndUpdate(student._id, {
        $push: { enrolledCourses: { $each: randomCourses.map(course => course._id) } }
      });
    }

    console.log("Database seeded successfully!");
    console.log("\nLogin Credentials:");
    console.log("\nInstructors:");
    instructors.forEach(inst => {
      console.log(`Name: ${inst.name}`);
      console.log(`Email: ${inst.email}`);
      console.log(`Password: password123`);
      console.log("------------------------");
    });
    console.log("\nStudents:");
    students.forEach(student => {
      console.log(`Name: ${student.name}`);
      console.log(`Email: ${student.email}`);
      console.log(`Password: password123`);
      console.log("------------------------");
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

export default seedData; 