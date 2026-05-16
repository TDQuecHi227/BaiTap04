const httpStatus = require("http-status").status;
const courseService = require("../services/courseService.js");
const getAllCourses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const filters = {
            search: req.query.search || "",
            category: req.query.category || "All",
            priceType: req.query.priceType || "all"
        };

        const courses = await courseService.getAllCourses(page, limit, filters);
        return res.status(httpStatus.OK).json({
            courses: courses.courses,
            pagination: courses.pagination
        });
    }
    catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Error in fetching courses",
            error: error.message
        })
    }
}
const getCourseDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await courseService.getCourseById(id);
        if (!course) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Course not found"
            });
        }

        // Lấy sản phẩm tương tự
        const relatedCourses = await courseService.getRelatedCourses(course._id, course.category);

        return res.status(httpStatus.OK).json({
            course,
            relatedCourses
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Error in fetching course detail",
            error: error.message
        });
    }
};
module.exports = {
    getAllCourses,
    getCourseDetail
}