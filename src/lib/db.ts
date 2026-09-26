import fs from 'fs';
import path from 'path';

// Define persistence file path
const DATA_FILE = path.join(process.cwd(), 'prisma', 'dev_store.json');

// Interface for initial seed data loader
function loadStore(): any {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading dev_store.json:', e);
    }
  }
  return createInitialSeedData();
}

function saveStore(data: any) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving dev_store.json:', e);
  }
}

// Initial Seed Data Generator
function createInitialSeedData() {
  const now = new Date().toISOString();

  const adminUserId = 'user-admin-1';
  const librarianUserId = 'user-lib-1';
  const studentUserId = 'user-stu-1';
  const facultyUserId = 'user-fac-1';

  const catCS = 'cat-cs-1';
  const catSE = 'cat-se-1';
  const catAI = 'cat-ai-1';

  const pubPearson = 'pub-pearson-1';

  const author1 = 'auth-1';
  const author2 = 'auth-2';

  const defaultPasswordHash = 'static_seed_salt_123:398394e07d6858194beb1c7d61e68059a8e7be7d0dc4f8e9744d55cc03451c0cf774658f71459beee963ed0cd807b1525a1dc58a09f4856d3160e37a786dca0a'; // Password123!

  const store = {
    users: [
      { id: adminUserId, email: 'admin@library.local', passwordHash: defaultPasswordHash, role: 'ADMIN', status: 'ACTIVE', createdAt: now, updatedAt: now },
      { id: librarianUserId, email: 'librarian@library.local', passwordHash: defaultPasswordHash, role: 'LIBRARIAN', status: 'ACTIVE', createdAt: now, updatedAt: now },
      { id: studentUserId, email: 'student@library.local', passwordHash: defaultPasswordHash, role: 'MEMBER', status: 'ACTIVE', createdAt: now, updatedAt: now },
      { id: facultyUserId, email: 'faculty@library.local', passwordHash: defaultPasswordHash, role: 'MEMBER', status: 'ACTIVE', createdAt: now, updatedAt: now },
    ],
    memberProfiles: [
      { id: 'mem-admin-1', userId: adminUserId, memberId: 'ADM-000001', name: 'Dr. Eleanor Vance', phone: '+91 98765 00001', department: 'Library Admin', memberType: 'FACULTY', maxLoans: 5, createdAt: now },
      { id: 'mem-lib-1', userId: librarianUserId, memberId: 'LIB-000002', name: 'Marcus Brody', phone: '+91 98765 00002', department: 'Circulation Desk', memberType: 'FACULTY', maxLoans: 5, createdAt: now },
      { id: 'mem-stu-1', userId: studentUserId, memberId: 'STU-2026-01', name: 'Alex Mercer', phone: '+91 98765 10001', studentId: 'CS-2024-042', department: 'Computer Science', memberType: 'STUDENT', maxLoans: 3, createdAt: now },
      { id: 'mem-fac-1', userId: facultyUserId, memberId: 'FAC-2026-01', name: 'Prof. Alan Turing', phone: '+91 98765 20001', studentId: 'FAC-889', department: 'Computer Science', memberType: 'FACULTY', maxLoans: 5, createdAt: now },
    ],
    categories: [
      { id: catCS, name: 'Computer Science', description: 'Algorithms, Data Structures, Systems' },
      { id: catSE, name: 'Software Engineering', description: 'Architecture, Clean Code, Testing' },
      { id: catAI, name: 'Artificial Intelligence', description: 'Machine Learning, Deep Learning' },
    ],
    authors: [
      { id: author1, name: 'Robert C. Martin', bio: 'Author of Clean Code' },
      { id: author2, name: 'Thomas H. Cormen', bio: 'Co-author of Introduction to Algorithms' },
    ],
    publishers: [
      { id: pubPearson, name: 'Pearson Education' },
    ],
    books: [
      { id: 'book-1', isbn: '978-0132350884', title: 'Clean Code: A Handbook of Agile Software Craftsmanship', description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees.', pubYear: 2008, categoryId: catSE, publisherId: pubPearson, totalCopies: 3, availableCopies: 2, createdAt: now },
      { id: 'book-2', isbn: '978-0262046305', title: 'Introduction to Algorithms, 4th Edition', description: 'Comprehensive textbook on computer algorithms.', pubYear: 2022, categoryId: catCS, publisherId: pubPearson, totalCopies: 2, availableCopies: 1, createdAt: now },
      { id: 'book-3', isbn: '978-0134610993', title: 'Artificial Intelligence: A Modern Approach', description: 'Standard textbook in artificial intelligence.', pubYear: 2020, categoryId: catAI, publisherId: pubPearson, totalCopies: 2, availableCopies: 2, createdAt: now },
    ],
    bookAuthors: [
      { bookId: 'book-1', authorId: author1 },
      { bookId: 'book-2', authorId: author2 },
    ],
    bookCopies: [
      { id: 'copy-1-1', bookId: 'book-1', copyCode: 'BC-1001-1', shelfLocation: 'Rack 1A', status: 'ISSUED' },
      { id: 'copy-1-2', bookId: 'book-1', copyCode: 'BC-1001-2', shelfLocation: 'Rack 1B', status: 'AVAILABLE' },
      { id: 'copy-1-3', bookId: 'book-1', copyCode: 'BC-1001-3', shelfLocation: 'Rack 1C', status: 'AVAILABLE' },
      { id: 'copy-2-1', bookId: 'book-2', copyCode: 'BC-1002-1', shelfLocation: 'Rack 2A', status: 'ISSUED' },
      { id: 'copy-2-2', bookId: 'book-2', copyCode: 'BC-1002-2', shelfLocation: 'Rack 2B', status: 'AVAILABLE' },
    ],
    loans: [
      {
        id: 'loan-1',
        memberId: 'mem-stu-1',
        bookId: 'book-1',
        bookCopyId: 'copy-1-1',
        issueDate: now,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE',
        renewalCount: 0,
        issuedByUserId: librarianUserId,
        createdAt: now,
      },
      {
        id: 'loan-2',
        memberId: 'mem-stu-1',
        bookId: 'book-2',
        bookCopyId: 'copy-2-1',
        issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE',
        renewalCount: 0,
        issuedByUserId: librarianUserId,
        createdAt: now,
      },
    ],
    fines: [
      {
        id: 'fine-1',
        loanId: 'loan-2',
        memberId: 'mem-stu-1',
        amount: 30.0,
        overdueDays: 6,
        status: 'UNPAID',
        createdAt: now,
      },
    ],
    finePayments: [],
    notifications: [
      {
        id: 'notif-1',
        userId: studentUserId,
        title: 'Overdue Book Warning',
        message: 'Your loan for "Introduction to Algorithms" is 6 days overdue. Accrued fine: ₹30.00.',
        type: 'OVERDUE',
        isRead: false,
        createdAt: now,
      },
    ],
    auditLogs: [
      { id: 'log-1', userId: adminUserId, action: 'SYSTEM_BOOT', entity: 'System', details: 'Database initialized', createdAt: now },
    ],
    systemSettings: [
      { id: 's-1', key: 'max_loans_student', value: '3', description: 'Max loans for students' },
      { id: 's-2', key: 'max_loans_faculty', value: '5', description: 'Max loans for faculty' },
      { id: 's-3', key: 'loan_duration_days', value: '14', description: 'Loan duration in days' },
      { id: 's-4', key: 'fine_per_day', value: '5.0', description: 'Overdue fine per day' },
      { id: 's-5', key: 'max_renewals', value: '2', description: 'Max renewals per loan' },
      { id: 's-6', key: 'library_name', value: 'Sky Central Library', description: 'Library name' },
      { id: 's-7', key: 'contact_email', value: 'support@skylibrary.com', description: 'Support email' },
    ],
  };

  saveStore(store);
  return store;
}

// In-Memory Database Handler matching Prisma query patterns
class Repository<T extends { id: string }> {
  constructor(private collectionName: string) {}

  private get store() {
    return loadStore();
  }

  private save(data: any) {
    saveStore(data);
  }

  async findMany(args: any = {}): Promise<T[]> {
    const data = this.store;
    let list: any[] = data[this.collectionName] || [];

    if (args.where) {
      list = list.filter((item) => matchWhere(item, args.where, data));
    }

    if (args.orderBy) {
      const key = Object.keys(args.orderBy)[0];
      const dir = args.orderBy[key] === 'desc' ? -1 : 1;
      list = [...list].sort((a, b) => (a[key] > b[key] ? dir : -dir));
    }

    if (args.skip) {
      list = list.slice(args.skip);
    }

    if (args.take) {
      list = list.slice(0, args.take);
    }

    if (args.include) {
      list = list.map((item) => populateIncludes(item, args.include, data, this.collectionName));
    }

    return JSON.parse(JSON.stringify(list));
  }

  async findUnique(args: any): Promise<T | null> {
    const data = this.store;
    const list: any[] = data[this.collectionName] || [];
    let item = list.find((i) => matchWhere(i, args.where, data));
    if (!item) return null;

    if (args.include) {
      item = populateIncludes(item, args.include, data, this.collectionName);
    }

    return JSON.parse(JSON.stringify(item));
  }

  async findFirst(args: any = {}): Promise<T | null> {
    const results = await this.findMany(args);
    return results[0] || null;
  }

  async count(args: any = {}): Promise<number> {
    const results = await this.findMany(args);
    return results.length;
  }

  async create(args: any): Promise<T> {
    const data = this.store;
    const newItem = {
      id: args.data.id || `${this.collectionName.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...args.data,
      createdAt: args.data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!data[this.collectionName]) data[this.collectionName] = [];
    data[this.collectionName].push(newItem);
    this.save(data);
    return JSON.parse(JSON.stringify(newItem));
  }

  async createMany(args: any): Promise<{ count: number }> {
    const data = this.store;
    if (!data[this.collectionName]) data[this.collectionName] = [];

    const items = args.data.map((d: any) => ({
      id: d.id || `${this.collectionName.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...d,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    data[this.collectionName].push(...items);
    this.save(data);
    return { count: items.length };
  }

  async update(args: any): Promise<T> {
    const data = this.store;
    const list: any[] = data[this.collectionName] || [];
    const idx = list.findIndex((i) => matchWhere(i, args.where, data));
    if (idx === -1) throw new Error(`${this.collectionName} record not found.`);

    const existing = list[idx];
    const updated = { ...existing, ...args.data, updatedAt: new Date().toISOString() };
    list[idx] = updated;
    data[this.collectionName] = list;
    this.save(data);
    return JSON.parse(JSON.stringify(updated));
  }

  async updateMany(args: any): Promise<{ count: number }> {
    const data = this.store;
    let list: any[] = data[this.collectionName] || [];
    let count = 0;

    data[this.collectionName] = list.map((item) => {
      if (matchWhere(item, args.where, data)) {
        count++;
        return { ...item, ...args.data, updatedAt: new Date().toISOString() };
      }
      return item;
    });

    this.save(data);
    return { count };
  }

  async upsert(args: any): Promise<T> {
    const existing = await this.findUnique({ where: args.where });
    if (existing) {
      return await this.update({ where: args.where, data: args.update });
    } else {
      return await this.create({ data: { ...args.where, ...args.create } });
    }
  }

  async delete(args: any): Promise<T> {
    const data = this.store;
    const list: any[] = data[this.collectionName] || [];
    const idx = list.findIndex((i) => matchWhere(i, args.where, data));
    if (idx === -1) throw new Error('Record not found');

    const [deleted] = list.splice(idx, 1);
    data[this.collectionName] = list;
    this.save(data);
    return deleted;
  }

  async deleteMany(args: any = {}): Promise<{ count: number }> {
    const data = this.store;
    if (!args.where) {
      const count = (data[this.collectionName] || []).length;
      data[this.collectionName] = [];
      this.save(data);
      return { count };
    }

    const list: any[] = data[this.collectionName] || [];
    const filtered = list.filter((i) => !matchWhere(i, args.where, data));
    const count = list.length - filtered.length;
    data[this.collectionName] = filtered;
    this.save(data);
    return { count };
  }

  async aggregate(args: any): Promise<any> {
    const items = await this.findMany({ where: args.where });
    let sum = 0;
    if (args._sum && args._sum.amount) {
      sum = items.reduce((acc: number, item: any) => acc + (Number(item.amount) || 0), 0);
    }
    return { _sum: { amount: sum } };
  }
}

// Helper match functions
function matchWhere(item: any, where: any, storeData: any): boolean {
  if (!where) return true;

  for (const key of Object.keys(where)) {
    const val = where[key];

    if (key === 'OR' && Array.isArray(val)) {
      const matched = val.some((subWhere) => matchWhere(item, subWhere, storeData));
      if (!matched) return false;
      continue;
    }

    if (key === 'AND' && Array.isArray(val)) {
      const matched = val.every((subWhere) => matchWhere(item, subWhere, storeData));
      if (!matched) return false;
      continue;
    }

    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if ('contains' in val) {
        const fieldVal = (item[key] || '').toString().toLowerCase();
        const search = val.contains.toString().toLowerCase();
        if (!fieldVal.includes(search)) return false;
      } else if ('gt' in val) {
        if (!(item[key] > val.gt)) return false;
      } else if ('lt' in val) {
        const fieldVal = new Date(item[key]).getTime();
        const compareVal = new Date(val.lt).getTime();
        if (!(fieldVal < compareVal)) return false;
      } else if ('some' in val) {
        // Relation sub-query
        if (key === 'bookAuthors') {
          const authors = (storeData.bookAuthors || []).filter((ba: any) => ba.bookId === item.id);
          const matched = authors.some((ba: any) => {
            const author = (storeData.authors || []).find((a: any) => a.id === ba.authorId);
            return author && matchWhere(author, val.some.author || val.some, storeData);
          });
          if (!matched) return false;
        } else if (key === 'loans') {
          const loans = (storeData.loans || []).filter((l: any) => l.bookId === item.id || l.memberId === item.id);
          const matched = loans.some((l: any) => matchWhere(l, val.some, storeData));
          if (!matched) return false;
        }
      } else {
        // Nested field
        if (item[key] !== val) return false;
      }
    } else {
      if (item[key] !== val) return false;
    }
  }

  return true;
}

function populateIncludes(item: any, include: any, storeData: any, type: string): any {
  const res = { ...item };

  if (include.memberProfile) {
    res.memberProfile = (storeData.memberProfiles || []).find((mp: any) => mp.userId === item.id);
  }
  if (include.user) {
    res.user = (storeData.users || []).find((u: any) => u.id === item.userId);
  }
  if (include.category) {
    res.category = (storeData.categories || []).find((c: any) => c.id === item.categoryId);
  }
  if (include.publisher) {
    res.publisher = (storeData.publishers || []).find((p: any) => p.id === item.publisherId);
  }
  if (include.bookAuthors) {
    const bas = (storeData.bookAuthors || []).filter((ba: any) => ba.bookId === item.id);
    res.bookAuthors = bas.map((ba: any) => ({
      ...ba,
      author: (storeData.authors || []).find((a: any) => a.id === ba.authorId),
    }));
  }
  if (include.copies) {
    res.copies = (storeData.bookCopies || []).filter((c: any) => c.bookId === item.id);
  }
  if (include.loans) {
    let loans = (storeData.loans || []).filter((l: any) => l.bookId === item.id || l.memberId === item.id || l.bookCopyId === item.id);
    if (include.loans.where) {
      loans = loans.filter((l: any) => matchWhere(l, include.loans.where, storeData));
    }
    res.loans = loans.map((l: any) => ({
      ...l,
      book: (storeData.books || []).find((b: any) => b.id === l.bookId),
      bookCopy: (storeData.bookCopies || []).find((c: any) => c.id === l.bookCopyId),
      member: (storeData.memberProfiles || []).find((m: any) => m.id === l.memberId),
      fine: (storeData.fines || []).find((f: any) => f.loanId === l.id),
    }));
  }
  if (include.book) {
    res.book = (storeData.books || []).find((b: any) => b.id === item.bookId);
  }
  if (include.bookCopy) {
    res.bookCopy = (storeData.bookCopies || []).find((c: any) => c.id === item.bookCopyId);
  }
  if (include.member) {
    const m = (storeData.memberProfiles || []).find((mp: any) => mp.id === item.memberId);
    if (m && include.member.select) {
      const u = (storeData.users || []).find((usr: any) => usr.id === m.userId);
      res.member = { ...m, user: u };
    } else {
      res.member = m;
    }
  }
  if (include.fine) {
    res.fine = (storeData.fines || []).find((f: any) => f.loanId === item.id);
  }
  if (include.payments) {
    res.payments = (storeData.finePayments || []).filter((p: any) => p.fineId === item.id);
  }
  if (include._count) {
    res._count = {
      loans: (storeData.loans || []).filter((l: any) => l.bookId === item.id || l.memberId === item.id).length,
      fines: (storeData.fines || []).filter((f: any) => f.memberId === item.id && f.status === 'UNPAID').length,
    };
  }

  return res;
}

// Database Export Object mirroring Prisma Client API
export const db = {
  user: new Repository<any>('users'),
  memberProfile: new Repository<any>('memberProfiles'),
  category: new Repository<any>('categories'),
  author: new Repository<any>('authors'),
  publisher: new Repository<any>('publishers'),
  book: new Repository<any>('books'),
  bookAuthor: new Repository<any>('bookAuthors'),
  bookCopy: new Repository<any>('bookCopies'),
  loan: new Repository<any>('loans'),
  fine: new Repository<any>('fines'),
  finePayment: new Repository<any>('finePayments'),
  notification: new Repository<any>('notifications'),
  auditLog: new Repository<any>('auditLogs'),
  systemSetting: new Repository<any>('systemSettings'),

  async $transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return await fn(db);
  },
};
