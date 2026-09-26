import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Library Management System database seed...');

  // 1. Clear existing data
  await prisma.finePayment.deleteMany();
  await prisma.fine.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.bookCopy.deleteMany();
  await prisma.bookAuthor.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.publisher.deleteMany();
  await prisma.category.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.memberProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSetting.deleteMany();

  // 2. Default System Policy Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: 'max_loans_student', value: '3', description: 'Maximum active loans allowed for Student members' },
      { key: 'max_loans_faculty', value: '5', description: 'Maximum active loans allowed for Faculty members' },
      { key: 'loan_duration_days', value: '14', description: 'Default duration of a book loan in days' },
      { key: 'fine_per_day', value: '5.0', description: 'Fine charged per overdue day per book in INR' },
      { key: 'max_renewals', value: '2', description: 'Maximum times a loan can be renewed' },
      { key: 'library_name', value: 'Sky Central Library', description: 'Official name of the library' },
      { key: 'contact_email', value: 'support@skylibrary.com', description: 'Support contact email' },
    ],
  });

  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 3. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@library.local',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      memberProfile: {
        create: {
          memberId: 'ADM-000001',
          name: 'Dr. Eleanor Vance',
          phone: '+91 98765 00001',
          department: 'Library Administration',
          memberType: 'FACULTY',
          maxLoans: 5,
        },
      },
    },
  });

  // 4. Create Librarian User
  const librarianUser = await prisma.user.create({
    data: {
      email: 'librarian@library.local',
      passwordHash: defaultPasswordHash,
      role: 'LIBRARIAN',
      status: 'ACTIVE',
      memberProfile: {
        create: {
          memberId: 'LIB-000002',
          name: 'Marcus Brody',
          phone: '+91 98765 00002',
          department: 'Circulation Desk',
          memberType: 'FACULTY',
          maxLoans: 5,
        },
      },
    },
  });

  // 5. Create Members (Students & Faculty)
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@library.local',
      passwordHash: defaultPasswordHash,
      role: 'MEMBER',
      status: 'ACTIVE',
      memberProfile: {
        create: {
          memberId: 'STU-2026-01',
          name: 'Alex Mercer',
          phone: '+91 98765 10001',
          studentId: 'CS-2024-042',
          department: 'Computer Science',
          memberType: 'STUDENT',
          maxLoans: 3,
        },
      },
    },
    include: { memberProfile: true },
  });

  const facultyUser = await prisma.user.create({
    data: {
      email: 'faculty@library.local',
      passwordHash: defaultPasswordHash,
      role: 'MEMBER',
      status: 'ACTIVE',
      memberProfile: {
        create: {
          memberId: 'FAC-2026-01',
          name: 'Prof. Alan Turing',
          phone: '+91 98765 20001',
          studentId: 'FAC-889',
          department: 'Computer Science',
          memberType: 'FACULTY',
          maxLoans: 5,
        },
      },
    },
    include: { memberProfile: true },
  });

  // Additional 8 Members
  const additionalMembersData = [
    { name: 'David Chen', email: 'david.chen@student.local', type: 'STUDENT' as const, dept: 'Electrical Engineering', id: 'EE-2024-12' },
    { name: 'Sophia Patel', email: 'sophia.p@student.local', type: 'STUDENT' as const, dept: 'Data Science', id: 'DS-2024-05' },
    { name: 'James Wilson', email: 'james.w@student.local', type: 'STUDENT' as const, dept: 'Mechanical Engineering', id: 'ME-2024-88' },
    { name: 'Emma Watson', email: 'emma.w@student.local', type: 'STUDENT' as const, dept: 'Physics', id: 'PHY-2024-33' },
    { name: 'Prof. Richard Feynman', email: 'feynman@faculty.local', type: 'FACULTY' as const, dept: 'Physics', id: 'FAC-PHY-01' },
    { name: 'Dr. Ada Lovelace', email: 'ada@faculty.local', type: 'FACULTY' as const, dept: 'Mathematics', id: 'FAC-MATH-02' },
    { name: 'Oliver Twist', email: 'oliver@student.local', type: 'STUDENT' as const, dept: 'Literature', id: 'LIT-2024-19' },
    { name: 'Grace Hopper', email: 'grace.h@faculty.local', type: 'FACULTY' as const, dept: 'Software Engineering', id: 'FAC-SE-03' },
  ];

  const createdMemberProfiles = [];
  for (let i = 0; i < additionalMembersData.length; i++) {
    const m = additionalMembersData[i];
    const u = await prisma.user.create({
      data: {
        email: m.email,
        passwordHash: defaultPasswordHash,
        role: 'MEMBER',
        status: 'ACTIVE',
        memberProfile: {
          create: {
            memberId: `MEM-2026-0${i + 10}`,
            name: m.name,
            phone: `+91 98765 300${i}`,
            studentId: m.id,
            department: m.dept,
            memberType: m.type,
            maxLoans: m.type === 'FACULTY' ? 5 : 3,
          },
        },
      },
      include: { memberProfile: true },
    });
    if (u.memberProfile) createdMemberProfiles.push(u.memberProfile);
  }

  // 6. Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Computer Science', description: 'Algorithms, Data Structures, Systems' } }),
    prisma.category.create({ data: { name: 'Software Engineering', description: 'Architecture, Clean Code, Testing' } }),
    prisma.category.create({ data: { name: 'Data Science & AI', description: 'Machine Learning, Deep Learning, Statistics' } }),
    prisma.category.create({ data: { name: 'Physics & Astronomy', description: 'Quantum Mechanics, Astrophysics' } }),
    prisma.category.create({ data: { name: 'Mathematics', description: 'Calculus, Linear Algebra, Discrete Math' } }),
    prisma.category.create({ data: { name: 'Literature & Fiction', description: 'Classic and Modern Literature' } }),
  ]);

  const csCat = categories[0].id;
  const seCat = categories[1].id;
  const aiCat = categories[2].id;
  const phyCat = categories[3].id;

  // 7. Authors & Publishers
  const authors = await Promise.all([
    prisma.author.create({ data: { name: 'Robert C. Martin', bio: 'Author of Clean Code and Clean Architecture' } }),
    prisma.author.create({ data: { name: 'Thomas H. Cormen', bio: 'Co-author of Introduction to Algorithms' } }),
    prisma.author.create({ data: { name: 'Erich Gamma', bio: 'Co-author of Design Patterns (Gang of Four)' } }),
    prisma.author.create({ data: { name: 'Martin Fowler', bio: 'Author of Refactoring' } }),
    prisma.author.create({ data: { name: 'Stuart Russell', bio: 'Co-author of Artificial Intelligence: A Modern Approach' } }),
    prisma.author.create({ data: { name: 'Richard P. Feynman', bio: 'Nobel laureate physicist' } }),
  ]);

  const publisher = await prisma.publisher.create({
    data: { name: 'Pearson Higher Education' },
  });

  // 8. Create 20+ Books with Physical Copies
  const bookSeed = [
    { title: 'Clean Code: A Handbook of Agile Software Craftsmanship', isbn: '978-0132350884', pubYear: 2008, cat: seCat, authorIdx: 0 },
    { title: 'Introduction to Algorithms, 4th Edition', isbn: '978-0262046305', pubYear: 2022, cat: csCat, authorIdx: 1 },
    { title: 'Design Patterns: Elements of Reusable Object-Oriented Software', isbn: '978-0201633610', pubYear: 1994, cat: seCat, authorIdx: 2 },
    { title: 'Refactoring: Improving the Design of Existing Code', isbn: '978-0134757599', pubYear: 2018, cat: seCat, authorIdx: 3 },
    { title: 'Artificial Intelligence: A Modern Approach, 4th Edition', isbn: '978-0134610993', pubYear: 2020, cat: aiCat, authorIdx: 4 },
    { title: 'The Feynman Lectures on Physics', isbn: '978-0465023821', pubYear: 2011, cat: phyCat, authorIdx: 5 },
    { title: 'Clean Architecture: A Craftsman Guide to Software Structure', isbn: '978-0134494166', pubYear: 2017, cat: seCat, authorIdx: 0 },
    { title: 'Computer Networks, 6th Edition', isbn: '978-0133920932', pubYear: 2021, cat: csCat, authorIdx: 1 },
    { title: 'Operating System Concepts, 10th Edition', isbn: '978-1119800361', pubYear: 2018, cat: csCat, authorIdx: 1 },
    { title: 'Database System Concepts, 7th Edition', isbn: '978-0078022159', pubYear: 2019, cat: csCat, authorIdx: 1 },
    { title: 'Deep Learning (Adaptive Computation)', isbn: '978-0262035613', pubYear: 2016, cat: aiCat, authorIdx: 4 },
    { title: 'Pattern Recognition and Machine Learning', isbn: '978-0387310732', pubYear: 2006, cat: aiCat, authorIdx: 4 },
    { title: 'Structure and Interpretation of Computer Programs', isbn: '978-0262510875', pubYear: 1996, cat: csCat, authorIdx: 1 },
    { title: 'The Pragmatic Programmer: Your Journey To Mastery', isbn: '978-0135957059', pubYear: 2019, cat: seCat, authorIdx: 0 },
    { title: 'Code Complete: A Practical Handbook of Software Construction', isbn: '978-0735619678', pubYear: 2004, cat: seCat, authorIdx: 0 },
    { title: 'Quantum Computation and Quantum Information', isbn: '978-1107002173', pubYear: 2010, cat: phyCat, authorIdx: 5 },
    { title: 'Linear Algebra and Its Applications, 6th Edition', isbn: '978-0135858370', pubYear: 2020, cat: csCat, authorIdx: 1 },
    { title: 'Modern Operating Systems, 5th Edition', isbn: '978-0137618881', pubYear: 2022, cat: csCat, authorIdx: 1 },
    { title: 'Software Engineering: A Practitioner Approach', isbn: '978-1259872976', pubYear: 2019, cat: seCat, authorIdx: 0 },
    { title: 'Python Crash Course, 3rd Edition', isbn: '978-1718502703', pubYear: 2023, cat: csCat, authorIdx: 0 },
  ];

  const createdBooks = [];
  for (let i = 0; i < bookSeed.length; i++) {
    const item = bookSeed[i];
    const b = await prisma.book.create({
      data: {
        isbn: item.isbn,
        title: item.title,
        pubYear: item.pubYear,
        categoryId: item.cat,
        publisherId: publisher.id,
        language: 'English',
        totalCopies: 3,
        availableCopies: 3,
        bookAuthors: {
          create: [{ authorId: authors[item.authorIdx].id }],
        },
        copies: {
          create: [
            { copyCode: `BC-10${i + 1}-1`, shelfLocation: `Rack ${i + 1}A`, status: 'AVAILABLE' },
            { copyCode: `BC-10${i + 1}-2`, shelfLocation: `Rack ${i + 1}B`, status: 'AVAILABLE' },
            { copyCode: `BC-10${i + 1}-3`, shelfLocation: `Rack ${i + 1}C`, status: 'AVAILABLE' },
          ],
        },
      },
      include: { copies: true },
    });
    createdBooks.push(b);
  }

  // 9. Create Loans (Active, Returned, Overdue with fine)
  if (studentUser.memberProfile && createdBooks.length > 2) {
    // Active Loan
    const copy1 = createdBooks[0].copies[0];
    const loan1 = await prisma.loan.create({
      data: {
        memberId: studentUser.memberProfile.id,
        bookId: createdBooks[0].id,
        bookCopyId: copy1.id,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        issuedByUserId: librarianUser.id,
      },
    });

    await prisma.bookCopy.update({
      where: { id: copy1.id },
      data: { status: 'ISSUED' },
    });
    await prisma.book.update({
      where: { id: createdBooks[0].id },
      data: { availableCopies: 2 },
    });

    // Overdue Loan with Fine
    const copy2 = createdBooks[1].copies[0];
    const overdueIssueDate = new Date(Date.now() - 25 * 24 * 60 * 60 * 1000);
    const overdueDueDate = new Date(Date.now() - 11 * 24 * 60 * 60 * 1000);

    const loan2 = await prisma.loan.create({
      data: {
        memberId: studentUser.memberProfile.id,
        bookId: createdBooks[1].id,
        bookCopyId: copy2.id,
        issueDate: overdueIssueDate,
        dueDate: overdueDueDate,
        status: 'ACTIVE',
        issuedByUserId: librarianUser.id,
      },
    });

    await prisma.bookCopy.update({
      where: { id: copy2.id },
      data: { status: 'ISSUED' },
    });
    await prisma.book.update({
      where: { id: createdBooks[1].id },
      data: { availableCopies: 2 },
    });

    // Fine record (11 days overdue * ₹5 = ₹55)
    await prisma.fine.create({
      data: {
        loanId: loan2.id,
        memberId: studentUser.memberProfile.id,
        amount: 55.0,
        overdueDays: 11,
        status: 'UNPAID',
      },
    });

    // Notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: studentUser.id,
          title: 'Overdue Book Warning',
          message: `Your loan for "${createdBooks[1].title}" is 11 days overdue. Accrued fine: ₹55.00.`,
          type: 'OVERDUE',
        },
        {
          userId: studentUser.id,
          title: 'Book Issued',
          message: `You borrowed "${createdBooks[0].title}". Due date is in 14 days.`,
          type: 'SYSTEM',
        },
      ],
    });
  }

  console.log('✅ Database successfully seeded!');
  console.log('--------------------------------------------------');
  console.log('Demo Credentials for Project Evaluation:');
  console.log('  - ADMIN: admin@library.local / Password123!');
  console.log('  - LIBRARIAN: librarian@library.local / Password123!');
  console.log('  - STUDENT MEMBER: student@library.local / Password123!');
  console.log('  - FACULTY MEMBER: faculty@library.local / Password123!');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
