const Course = require("../models/Course");

const getHomePageData = async () => {
    const baseQuery = { status: "published" };

    const promotionalCoursesPromise = Course.find({
        ...baseQuery,
        discountPrice: { $gt: 0, $ne: null },
    })
        .populate("teacherId", "username avatar")
        .limit(4);

    const newestCoursesPromise = Course.find(baseQuery)
        .populate("teacherId", "username avatar")
        .sort({ createdAt: -1 })
        .limit(4);

    const bestSellingCoursesPromise = Course.find(baseQuery)
        .populate("teacherId", "username avatar")
        .sort({ totalEnrollments: -1 })
        .limit(10);

    const mostViewedCoursesPromise = Course.find(baseQuery)
        .populate("teacherId", "username avatar")
        .sort({ views: -1 })
        .limit(10);

    const [promotionalCourses, newestCourses, bestSellingCourses, mostViewedCourses] =
        await Promise.all([
            promotionalCoursesPromise,
            newestCoursesPromise,
            bestSellingCoursesPromise,
            mostViewedCoursesPromise,
        ]);

    return {
        promotionalCourses,
        newestCourses,
        bestSellingCourses,
        mostViewedCourses,
    };
};

module.exports = {
    getHomePageData,
};
