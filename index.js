import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes

// MongoDB connection
const uri = process.env.MONGO_URI;

mongoose
  .connect(uri)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the application if MongoDB connection fails
  });

// Define schema and model
const coursesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  instructor: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, required: true },
  image: { type: String, required: true }, // Add the image field
});

const Course = mongoose.model("Course", coursesSchema);

// Routes

// Create a new course
app.post("/api/courses", async (req, res) => {
  try {
    const newCourse = new Course({
      title: req.body.title,
      category: req.body.category,
      instructor: req.body.instructor,
      duration: req.body.duration,
      price: req.body.price,
      rating: req.body.rating,
      image: req.body.image, // Accept image from the request
    });
    const savedCourse = await newCourse.save();
    res.status(200).json(savedCourse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all courses
app.get("/api/courses", async (req, res) => {
  try {
    const limit = Number(req.query.limit);
    const courses = limit
      ? await Course.find().limit(limit)
      : await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a course by ID
app.get("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      res.status(200).json(course);
    } else {
      res.status(404).json({ error: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a course by ID
app.put("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // Ensure the updated data is validated
    });
    if (course) {
      res.status(200).json(course);
    } else {
      res.status(404).json({ error: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a course by ID
app.delete("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (course) {
      res.status(200).json({ message: "Course deleted successfully" });
    } else {
      res.status(404).json({ error: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
