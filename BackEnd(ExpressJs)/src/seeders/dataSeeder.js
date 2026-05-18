const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Course = require("../models/Course");
const FlashcardSet = require("../models/FlashcardSet");
const Card = require("../models/Card");
const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");
const Order = require("../models/Order");
const Revenue = require("../models/Revenue");
const { StudySession, SessionAnswer } = require("../models/StudySession");
const CardProgress = require("../models/CardProgress");
const UserStreak = require("../models/UserStreak");
const UserStudyProgress = require("../models/UserStudyProgress");
const connectDB = require("../config/configdb");

const seedAll = async () => {
  try {
    console.log("⏳ Bắt đầu kết nối Database...");
    await connectDB();

    // Xóa index cũ bị lỗi (nếu có)
    try { await Course.collection.dropIndex("slug_1"); } catch (e) {}

    console.log("🗑️ Đang xóa toàn bộ dữ liệu cũ...");
    await Promise.all([
      User.deleteMany(), Course.deleteMany(), FlashcardSet.deleteMany(),
      Card.deleteMany(), Lesson.deleteMany(), Enrollment.deleteMany(),
      Order.deleteMany(), Revenue.deleteMany(), StudySession.deleteMany(),
      SessionAnswer.deleteMany(), CardProgress.deleteMany(),
      UserStreak.deleteMany(), UserStudyProgress.deleteMany(),
    ]);

    // ═══════════════ 1. USERS ═══════════════
    const hashedPassword = await bcrypt.hash("123456", 10);
    const users = await User.insertMany([
      {
        username: "admin_system", email: "admin@flashlearn.vn", password: hashedPassword,
        role: "admin", isVerified: true,
        profile: { fullName: "Quản Trị Viên", bio: "Admin hệ thống FlashLearn" },
      },
      {
        username: "nguyenvanan", email: "an.nguyen@flashlearn.vn", password: hashedPassword,
        role: "teacher", isVerified: true,
        profile: { fullName: "Nguyễn Văn An", bio: "Giảng viên IELTS 8.0" },
        teacherProfile: { bio: "10 năm kinh nghiệm giảng dạy IELTS", expertise: ["IELTS", "Giao tiếp"], bankAccount: "1234567890", bankName: "Vietcombank", revenueShare: 0.7, isApproved: true },
      },
      {
        username: "tranthibich", email: "bich.tran@flashlearn.vn", password: hashedPassword,
        role: "teacher", isVerified: true,
        profile: { fullName: "Trần Thị Bích", bio: "Chuyên gia TOEIC 990" },
        teacherProfile: { bio: "Chuyên gia luyện thi TOEIC", expertise: ["TOEIC", "Ngữ pháp"], bankAccount: "0987654321", bankName: "Techcombank", revenueShare: 0.7, isApproved: true },
      },
      {
        username: "levanminh", email: "minh.le@gmail.com", password: hashedPassword,
        role: "user", isVerified: true,
        profile: { fullName: "Lê Văn Minh", bio: "Sinh viên năm 3 CNTT", phoneNumber: "0901234567" },
      },
      {
        username: "phamthilan", email: "lan.pham@gmail.com", password: hashedPassword,
        role: "user", isVerified: true,
        profile: { fullName: "Phạm Thị Lan", bio: "Nhân viên văn phòng", phoneNumber: "0912345678" },
      },
      {
        username: "hoangducnam", email: "nam.hoang@gmail.com", password: hashedPassword,
        role: "user", isVerified: true,
        profile: { fullName: "Hoàng Đức Nam", bio: "Kỹ sư phần mềm", phoneNumber: "0923456789" },
      },
    ]);
    const teachers = users.filter(u => u.role === "teacher");
    const students = users.filter(u => u.role === "user");
    console.log(`✅ Seeded ${users.length} Users (1 admin, 2 teachers, 3 students)`);

    // ═══════════════ 2. COURSES (10 khóa) ═══════════════
    const now = new Date();
    const courses = await Course.insertMany([
      // --- Nhóm KHUYẾN MÃI (có discountPrice, enroll thấp, ngày cũ) ---
      {
        teacherId: teachers[0]._id, title: "IELTS Speaking – Chinh phục Band 7.0",
        description: "Khóa học luyện Speaking IELTS từ cơ bản đến nâng cao, cam kết đầu ra Band 7.0.",
        category: "IELTS", level: "intermediate", tags: ["ielts", "speaking"],
        price: 1200000, discountPrice: 599000, status: "published",
        totalEnrollments: 25, averageRating: 4.8, totalRatings: 12,
        publishedAt: new Date(now.getTime() - 30 * 86400000),
        createdAt: new Date(now.getTime() - 30 * 86400000),
        gallery: [],
        views: 3200,
      },
      {
        teacherId: teachers[1]._id, title: "TOEIC Listening – Từ 400 lên 700+",
        description: "Phương pháp nghe hiểu TOEIC hiệu quả, tăng 300 điểm chỉ trong 2 tháng.",
        category: "TOEIC", level: "beginner", tags: ["toeic", "listening"],
        price: 800000, discountPrice: 399000, status: "published",
        totalEnrollments: 40, averageRating: 4.6, totalRatings: 18,
        publishedAt: new Date(now.getTime() - 25 * 86400000),
        createdAt: new Date(now.getTime() - 25 * 86400000),
        gallery: [],
        views: 1850,
      },
      // --- Nhóm BÁN CHẠY (không discount, enroll cao, ngày trung bình) ---
      {
        teacherId: teachers[0]._id, title: "Hack Não 1500 Từ Vựng Tiếng Anh",
        description: "Phương pháp ghi nhớ từ vựng bằng hình ảnh và âm thanh, nhớ lâu gấp 5 lần.",
        category: "Từ vựng", level: "beginner", tags: ["vocabulary", "hack-nao"],
        price: 650000, discountPrice: null, status: "published",
        totalEnrollments: 1200, averageRating: 4.9, totalRatings: 350,
        publishedAt: new Date(now.getTime() - 15 * 86400000),
        createdAt: new Date(now.getTime() - 15 * 86400000),
        gallery: [],
        views: 9800,
      },
      {
        teacherId: teachers[1]._id, title: "Ngữ Pháp Tiếng Anh Trọn Đời",
        description: "Hệ thống ngữ pháp từ A-Z, dễ hiểu cho mọi trình độ.",
        category: "Ngữ pháp", level: "intermediate", tags: ["grammar", "foundation"],
        price: 450000, discountPrice: null, status: "published",
        totalEnrollments: 980, averageRating: 4.7, totalRatings: 280,
        publishedAt: new Date(now.getTime() - 10 * 86400000),
        createdAt: new Date(now.getTime() - 10 * 86400000),
        gallery: [],
        views: 6500,
      },
      // --- Nhóm MỚI NHẤT (không discount, enroll thấp, ngày mới) ---
      {
        teacherId: teachers[0]._id, title: "Phát Âm Chuẩn Bản Xứ Trong 30 Ngày",
        description: "Luyện phát âm IPA chuẩn Anh-Mỹ với giáo viên bản ngữ.",
        category: "Phát âm", level: "beginner", tags: ["pronunciation", "ipa"],
        price: 550000, discountPrice: null, status: "published",
        totalEnrollments: 8, averageRating: 5.0, totalRatings: 3,
        publishedAt: new Date(now.getTime() - 2 * 3600000),
        createdAt: new Date(now.getTime() - 2 * 3600000),
        gallery: [],
        views: 1200,
      },
      {
        teacherId: teachers[1]._id, title: "Tiếng Anh Chuyên Ngành CNTT",
        description: "Từ vựng và giao tiếp tiếng Anh dành riêng cho dân IT.",
        category: "Chuyên ngành", level: "advanced", tags: ["it-english", "technical"],
        price: 900000, discountPrice: null, status: "published",
        totalEnrollments: 3, averageRating: 0, totalRatings: 0,
        publishedAt: now, createdAt: now,
        gallery: [],
        views: 450,
      },
      // --- 4 Khóa học thêm mới ---
      {
        teacherId: teachers[0]._id, title: "Luyện Viết IELTS Writing Task 1 & 2",
        description: "Bí quyết đạt Band 7.5+ Writing với các bài mẫu phân tích chi tiết.",
        category: "IELTS", level: "intermediate", tags: ["ielts", "writing"],
        price: 1500000, discountPrice: 799000, status: "published",
        totalEnrollments: 45, averageRating: 4.9, totalRatings: 22,
        publishedAt: new Date(now.getTime() - 5 * 86400000),
        createdAt: new Date(now.getTime() - 5 * 86400000),
        gallery: [],
        views: 2300,
      },
      {
        teacherId: teachers[1]._id, title: "Tiếng Anh Giao Tiếp Hàng Ngày",
        description: "Học giao tiếp tự nhiên qua các chủ đề thực tế đời sống dành cho người mới bắt đầu.",
        category: "Communication", level: "beginner", tags: ["communication", "speaking"],
        price: 500000, discountPrice: null, status: "published",
        totalEnrollments: 350, averageRating: 4.8, totalRatings: 90,
        publishedAt: new Date(now.getTime() - 8 * 86400000),
        createdAt: new Date(now.getTime() - 8 * 86400000),
        gallery: [],
        views: 4200,
      },
      {
        teacherId: teachers[0]._id, title: "Luyện Thi THPT Quốc Gia Tiếng Anh",
        description: "Hệ thống toàn bộ kiến thức ngữ pháp trọng tâm và chiến thuật giải đề đạt điểm cao.",
        category: "Ngữ pháp", level: "intermediate", tags: ["thpt", "grammar"],
        price: 600000, discountPrice: 299000, status: "published",
        totalEnrollments: 620, averageRating: 4.7, totalRatings: 145,
        publishedAt: new Date(now.getTime() - 12 * 86400000),
        createdAt: new Date(now.getTime() - 12 * 86400000),
        gallery: [],
        views: 3100,
      },
      {
        teacherId: teachers[1]._id, title: "Tiếng Anh Thương Mại - Business English",
        description: "Kỹ năng thuyết trình, viết email công việc và đàm phán bằng tiếng Anh chuyên nghiệp.",
        category: "Chuyên ngành", level: "advanced", tags: ["business", "professional"],
        price: 1100000, discountPrice: null, status: "published",
        totalEnrollments: 120, averageRating: 4.6, totalRatings: 35,
        publishedAt: new Date(now.getTime() - 18 * 86400000),
        createdAt: new Date(now.getTime() - 18 * 86400000),
        gallery: [],
        views: 1500,
      },
      // --- 5 Khóa học thêm mới thứ hai ---
      {
        teacherId: teachers[0]._id, title: "IELTS Reading – Chiến thuật làm bài trọn điểm",
        description: "Các kỹ năng Skimming, Scanning và giải mã mọi dạng câu hỏi IELTS Reading.",
        category: "IELTS", level: "intermediate", tags: ["ielts", "reading"],
        price: 1100000, discountPrice: 499000, status: "published",
        totalEnrollments: 80, averageRating: 4.8, totalRatings: 32,
        publishedAt: new Date(now.getTime() - 4 * 86400000),
        createdAt: new Date(now.getTime() - 4 * 86400000),
        gallery: [],
        views: 2900,
      },
      {
        teacherId: teachers[1]._id, title: "TOEIC Speaking & Writing – Từ 0 đến Master",
        description: "Đầy đủ kiến thức và bài tập thực hành theo định dạng đề thi mới nhất.",
        category: "TOEIC", level: "intermediate", tags: ["toeic", "speaking", "writing"],
        price: 1300000, discountPrice: 699000, status: "published",
        totalEnrollments: 55, averageRating: 4.7, totalRatings: 20,
        publishedAt: new Date(now.getTime() - 6 * 86400000),
        createdAt: new Date(now.getTime() - 6 * 86400000),
        gallery: [],
        views: 1750,
      },
      {
        teacherId: teachers[0]._id, title: "Từ vựng tiếng Anh chuyên ngành Kinh tế & Marketing",
        description: "Học từ vựng qua các case study thực tế và mẫu đàm phán thương mại.",
        category: "Chuyên ngành", level: "intermediate", tags: ["business", "marketing"],
        price: 750000, discountPrice: null, status: "published",
        totalEnrollments: 140, averageRating: 4.9, totalRatings: 45,
        publishedAt: new Date(now.getTime() - 10 * 86400000),
        createdAt: new Date(now.getTime() - 10 * 86400000),
        gallery: [],
        views: 3800,
      },
      {
        teacherId: teachers[1]._id, title: "Ngữ Pháp Tiếng Anh Nâng Cao",
        description: "Làm chủ cấu trúc câu phức tạp, viết câu chuẩn và nói tiếng Anh tự nhiên.",
        category: "Ngữ pháp", level: "advanced", tags: ["advanced-grammar", "writing"],
        price: 850000, discountPrice: 399000, status: "published",
        totalEnrollments: 210, averageRating: 4.8, totalRatings: 75,
        publishedAt: new Date(now.getTime() - 15 * 86400000),
        createdAt: new Date(now.getTime() - 15 * 86400000),
        gallery: [],
        views: 4700,
      },
      {
        teacherId: teachers[0]._id, title: "Tiếng Anh Giao Tiếp Văn Phòng",
        description: "Giao tiếp tự tin khi đi phỏng vấn, họp hành, viết báo cáo và gửi email cho sếp.",
        category: "Communication", level: "intermediate", tags: ["communication", "career"],
        price: 950000, discountPrice: null, status: "published",
        totalEnrollments: 320, averageRating: 4.9, totalRatings: 110,
        publishedAt: new Date(now.getTime() - 20 * 86400000),
        createdAt: new Date(now.getTime() - 20 * 86400000),
        gallery: [],
        views: 5200,
      },
    ]);
    console.log(`✅ Seeded ${courses.length} Courses (with empty gallery arrays)`);

    // ═══════════════ 3. FLASHCARD SETS ═══════════════
    const sets = await FlashcardSet.insertMany([
      { createdBy: teachers[0]._id, title: "IELTS Academic Vocabulary", description: "200 từ vựng IELTS Academic thông dụng nhất", tags: ["ielts", "academic"], isPublic: true, totalCards: 5, enrollCount: 120 },
      { createdBy: teachers[0]._id, title: "English Pronunciation – IPA", description: "Bảng phiên âm IPA đầy đủ với ví dụ", tags: ["pronunciation", "ipa"], isPublic: true, totalCards: 5, enrollCount: 85 },
      { createdBy: teachers[1]._id, title: "TOEIC Part 5 – Grammar", description: "Ngữ pháp trọng tâm cho TOEIC Part 5", tags: ["toeic", "grammar"], isPublic: true, totalCards: 5, enrollCount: 200 },
      { createdBy: teachers[1]._id, title: "Business English Essentials", description: "Từ vựng tiếng Anh thương mại cơ bản", tags: ["business", "office"], isPublic: true, totalCards: 5, enrollCount: 150 },
      { createdBy: teachers[0]._id, title: "IT English – Developer Terms", description: "Thuật ngữ lập trình bằng tiếng Anh", tags: ["it", "developer"], isPublic: true, totalCards: 5, enrollCount: 60 },
    ]);
    console.log(`✅ Seeded ${sets.length} FlashcardSets`);

    // ═══════════════ 4. CARDS (5 cards / set) ═══════════════
    const cardTemplates = [
      // Set 0: IELTS Academic
      [
        { term: "ubiquitous", pronunciation: "/juːˈbɪk.wɪ.təs/", partOfSpeech: "adjective", definition: "present everywhere", definitionVi: "có mặt ở khắp nơi", exampleSentence: "Smartphones are ubiquitous in modern life." },
        { term: "mitigate", pronunciation: "/ˈmɪt.ɪ.ɡeɪt/", partOfSpeech: "verb", definition: "to reduce the severity of", definitionVi: "giảm nhẹ", exampleSentence: "We need to mitigate the effects of climate change." },
        { term: "paradigm", pronunciation: "/ˈpær.ə.daɪm/", partOfSpeech: "noun", definition: "a typical example or model", definitionVi: "mô hình, khuôn mẫu", exampleSentence: "This discovery shifted the paradigm of modern physics." },
        { term: "pragmatic", pronunciation: "/præɡˈmæt.ɪk/", partOfSpeech: "adjective", definition: "dealing with things practically", definitionVi: "thực dụng, thực tế", exampleSentence: "We need a pragmatic approach to this problem." },
        { term: "resilient", pronunciation: "/rɪˈzɪl.i.ənt/", partOfSpeech: "adjective", definition: "able to recover quickly", definitionVi: "kiên cường, bền bỉ", exampleSentence: "Children are often more resilient than adults." },
      ],
      // Set 1: IPA
      [
        { term: "/iː/", definition: "long vowel ee", definitionVi: "nguyên âm dài /iː/", exampleSentence: "sheep, see, eat" },
        { term: "/æ/", definition: "short vowel a", definitionVi: "nguyên âm ngắn /æ/", exampleSentence: "cat, hat, map" },
        { term: "/θ/", definition: "voiceless th", definitionVi: "phụ âm th vô thanh", exampleSentence: "think, thank, three" },
        { term: "/ð/", definition: "voiced th", definitionVi: "phụ âm th hữu thanh", exampleSentence: "this, that, the" },
        { term: "/ʃ/", definition: "sh sound", definitionVi: "âm sh", exampleSentence: "she, ship, nation" },
      ],
      // Set 2: TOEIC Grammar
      [
        { term: "despite", partOfSpeech: "preposition", definition: "without being affected by", definitionVi: "mặc dù", exampleSentence: "Despite the rain, we went out." },
        { term: "whereas", partOfSpeech: "conjunction", definition: "in contrast or comparison", definitionVi: "trong khi đó", exampleSentence: "He is tall, whereas his brother is short." },
        { term: "moreover", partOfSpeech: "adverb", definition: "in addition, furthermore", definitionVi: "hơn nữa", exampleSentence: "The plan is simple. Moreover, it is effective." },
        { term: "nevertheless", partOfSpeech: "adverb", definition: "in spite of that", definitionVi: "tuy nhiên", exampleSentence: "It was cold. Nevertheless, we went swimming." },
        { term: "prior to", partOfSpeech: "preposition", definition: "before", definitionVi: "trước khi", exampleSentence: "Prior to the meeting, please review the report." },
      ],
      // Set 3: Business English
      [
        { term: "revenue", pronunciation: "/ˈrev.ən.juː/", partOfSpeech: "noun", definition: "income from business", definitionVi: "doanh thu", exampleSentence: "The company's revenue increased by 20%." },
        { term: "deadline", pronunciation: "/ˈded.laɪn/", partOfSpeech: "noun", definition: "latest time to finish", definitionVi: "hạn chót", exampleSentence: "The deadline for the project is Friday." },
        { term: "negotiate", pronunciation: "/nɪˈɡəʊ.ʃi.eɪt/", partOfSpeech: "verb", definition: "to discuss to reach agreement", definitionVi: "đàm phán", exampleSentence: "We need to negotiate a better deal." },
        { term: "stakeholder", pronunciation: "/ˈsteɪkˌhəʊl.dər/", partOfSpeech: "noun", definition: "person with interest in business", definitionVi: "bên liên quan", exampleSentence: "All stakeholders must approve the plan." },
        { term: "agenda", pronunciation: "/əˈdʒen.də/", partOfSpeech: "noun", definition: "list of items for meeting", definitionVi: "chương trình nghị sự", exampleSentence: "Let's review the agenda before the meeting." },
      ],
      // Set 4: IT English
      [
        { term: "repository", pronunciation: "/rɪˈpɒz.ɪ.tɔːr.i/", partOfSpeech: "noun", definition: "storage for source code", definitionVi: "kho lưu trữ mã nguồn", exampleSentence: "Push your code to the remote repository." },
        { term: "deploy", pronunciation: "/dɪˈplɔɪ/", partOfSpeech: "verb", definition: "to release to production", definitionVi: "triển khai", exampleSentence: "We will deploy the new version tonight." },
        { term: "debug", pronunciation: "/diːˈbʌɡ/", partOfSpeech: "verb", definition: "to find and fix errors", definitionVi: "gỡ lỗi", exampleSentence: "I spent hours debugging this function." },
        { term: "refactor", pronunciation: "/riːˈfæk.tər/", partOfSpeech: "verb", definition: "to restructure existing code", definitionVi: "tái cấu trúc mã", exampleSentence: "We should refactor this module for better performance." },
        { term: "API", pronunciation: "/ˌeɪ.piːˈaɪ/", partOfSpeech: "noun", definition: "Application Programming Interface", definitionVi: "Giao diện lập trình ứng dụng", exampleSentence: "This API returns JSON data." },
      ],
    ];
    let allCardsData = [];
    sets.forEach((set, si) => {
      cardTemplates[si].forEach((card, ci) => {
        allCardsData.push({ setId: set._id, ...card, orderIndex: ci });
      });
    });
    const cards = await Card.insertMany(allCardsData);
    console.log(`✅ Seeded ${cards.length} Cards`);

    // ═══════════════ 5. LESSONS (3 bài/khóa) ═══════════════
    let lessonsData = [];
    const lessonNames = [
      ["Giới thiệu khoá học", "Luyện tập cơ bản", "Bài kiểm tra cuối khoá"],
    ];
    courses.forEach((course, ci) => {
      for (let i = 0; i < 3; i++) {
        lessonsData.push({
          courseId: course._id,
          title: `Bài ${i + 1}: ${["Giới thiệu tổng quan", "Luyện tập chuyên sâu", "Kiểm tra & Đánh giá"][i]}`,
          description: `Nội dung bài ${i + 1} của khóa "${course.title}"`,
          orderIndex: i,
          type: i === 0 ? "video" : i === 1 ? "flashcard" : "quiz",
          flashcardSetId: i === 1 ? sets[ci % sets.length]._id : null,
          videoDuration: i === 0 ? 1800 : 0,
          isFree: i === 0,
        });
      }
    });
    const lessons = await Lesson.insertMany(lessonsData);
    console.log(`✅ Seeded ${lessons.length} Lessons`);

    // ═══════════════ 6. ENROLLMENTS ═══════════════
    const enrollments = await Enrollment.insertMany([
      { userId: students[0]._id, courseId: courses[0]._id, status: "active", progressPercent: 60, lessonsCompleted: 2, lastAccessedAt: now, rating: 5, review: "Khóa học rất hay!", reviewedAt: now },
      { userId: students[0]._id, courseId: courses[2]._id, status: "active", progressPercent: 30, lessonsCompleted: 1, lastAccessedAt: now },
      { userId: students[1]._id, courseId: courses[1]._id, status: "active", progressPercent: 80, lessonsCompleted: 2, lastAccessedAt: now, rating: 4, review: "Giáo viên dạy dễ hiểu", reviewedAt: now },
      { userId: students[1]._id, courseId: courses[3]._id, status: "active", progressPercent: 50, lessonsCompleted: 1, lastAccessedAt: now },
      { userId: students[2]._id, courseId: courses[2]._id, status: "active", progressPercent: 100, lessonsCompleted: 3, lastAccessedAt: now, completedAt: now, rating: 5, review: "Tuyệt vời!", reviewedAt: now },
      { userId: students[2]._id, courseId: courses[4]._id, status: "active", progressPercent: 10, lessonsCompleted: 0, lastAccessedAt: now },
    ]);
    console.log(`✅ Seeded ${enrollments.length} Enrollments`);

    // ═══════════════ 7. ORDERS ═══════════════
    const orders = await Order.insertMany(
      enrollments.map((enr, i) => {
        const course = courses.find(c => c._id.equals(enr.courseId));
        const finalPrice = course.discountPrice || course.price;
        return {
          userId: enr.userId, courseId: enr.courseId,
          originalPrice: course.price, discountPrice: course.discountPrice,
          finalPrice, platformFee: Math.round(finalPrice * 0.3), teacherRevenue: Math.round(finalPrice * 0.7),
          status: "paid", paymentMethod: i % 2 === 0 ? "vnpay" : "momo",
          paymentGatewayId: `PAY${Date.now()}${i}`, paidAt: now,
        };
      })
    );
    console.log(`✅ Seeded ${orders.length} Orders`);

    // ═══════════════ 8. REVENUE ═══════════════
    const totalGross = orders.reduce((sum, o) => sum + o.finalPrice, 0);
    const totalPlatform = orders.reduce((sum, o) => sum + o.platformFee, 0);
    const totalTeacher = orders.reduce((sum, o) => sum + o.teacherRevenue, 0);
    await Revenue.insertMany([
      { period: "monthly", periodKey: "2026-05", scope: "platform", totalOrders: orders.length, totalGrossRevenue: totalGross, totalPlatformFee: totalPlatform, totalTeacherPayout: totalTeacher, netRevenue: totalGross },
      { period: "monthly", periodKey: "2026-05", scope: "teacher", teacherId: teachers[0]._id, totalOrders: 3, totalGrossRevenue: Math.round(totalGross * 0.5), totalPlatformFee: Math.round(totalPlatform * 0.5), totalTeacherPayout: Math.round(totalTeacher * 0.5), netRevenue: Math.round(totalGross * 0.5) },
      { period: "monthly", periodKey: "2026-05", scope: "teacher", teacherId: teachers[1]._id, totalOrders: 3, totalGrossRevenue: Math.round(totalGross * 0.5), totalPlatformFee: Math.round(totalPlatform * 0.5), totalTeacherPayout: Math.round(totalTeacher * 0.5), netRevenue: Math.round(totalGross * 0.5) },
    ]);
    console.log("✅ Seeded 3 Revenues");

    // ═══════════════ 9. USER STUDY PROGRESS ═══════════════
    const progresses = await UserStudyProgress.insertMany(
      students.map((s, i) => ({
        userId: s._id, setId: sets[i]._id,
        totalLearned: 3 + i, totalMemorized: 1 + i, newWordsToday: 2,
        lastStudiedAt: now,
      }))
    );
    console.log(`✅ Seeded ${progresses.length} UserStudyProgresses`);

    // ═══════════════ 10. STUDY SESSIONS ═══════════════
    const sessions = await StudySession.insertMany(
      students.map((s, i) => ({
        userId: s._id, progressId: progresses[i]._id, setId: sets[i]._id,
        startTime: new Date(now.getTime() - 3600000), endTime: now,
        cardsStudied: 5, newCardsLearned: 3, correctAnswers: 4,
        sessionType: "flashcard", isCompleted: true,
      }))
    );
    console.log(`✅ Seeded ${sessions.length} StudySessions`);

    // ═══════════════ 11. SESSION ANSWERS ═══════════════
    let answersData = [];
    sessions.forEach((session, si) => {
      for (let i = 0; i < 5; i++) {
        answersData.push({
          sessionId: session._id,
          cardId: cards[si * 5 + i]._id,
          questionType: "flashcard",
          userAnswer: "", isCorrect: i < 4, skipped: false,
          difficulty: i < 2 ? "easy" : i < 4 ? "medium" : "hard",
          timeSpentMs: 2000 + i * 500,
        });
      }
    });
    await SessionAnswer.insertMany(answersData);
    console.log(`✅ Seeded ${answersData.length} SessionAnswers`);

    // ═══════════════ 12. CARD PROGRESS ═══════════════
    let cardProgData = [];
    students.forEach((s, si) => {
      for (let i = 0; i < 5; i++) {
        cardProgData.push({
          userId: s._id, cardId: cards[si * 5 + i]._id, progressId: progresses[si]._id,
          status: i < 2 ? "memorized" : i < 4 ? "review" : "learning",
          difficulty: i < 2 ? "easy" : "medium",
          reviewCount: 3 - Math.min(i, 2), consecutiveCorrect: i < 3 ? 3 : 1,
          interval: i < 2 ? 7 : 1, easeFactor: 2.5,
          nextReviewAt: new Date(now.getTime() + (i + 1) * 86400000),
          firstLearnedAt: new Date(now.getTime() - 5 * 86400000),
          lastReviewedAt: now,
        });
      }
    });
    await CardProgress.insertMany(cardProgData);
    console.log(`✅ Seeded ${cardProgData.length} CardProgresses`);

    // ═══════════════ 13. USER STREAKS ═══════════════
    const streakHistory = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(now.getTime() - i * 86400000),
      cardsStudied: 5 + Math.floor(Math.random() * 10),
      setsStudied: 1,
    }));
    await UserStreak.insertMany(
      students.map((s, i) => ({
        userId: s._id, currentStreak: 5 + i * 2, longestStreak: 10 + i * 3,
        lastStudyDate: now, totalDaysStudied: 15 + i * 5, totalCardsAllTime: 50 + i * 20,
        studyHistory: streakHistory,
      }))
    );
    console.log("✅ Seeded 3 UserStreaks");

    console.log("\n🎉 MASTER SEED HOÀN TẤT! Tất cả dữ liệu đã được tạo thành công.");
    mongoose.connection.close();
    process.exit();
  } catch (error) {
    console.error("❌ Lỗi khi Master Seed:", error);
    process.exit(1);
  }
};

seedAll();
