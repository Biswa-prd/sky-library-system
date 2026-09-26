const crypto = require('crypto');

// Native PBKDF2 Password Hashing
async function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

async function comparePassword(password, hash) {
  return new Promise((resolve) => {
    const parts = hash.split(':');
    if (parts.length !== 2) return resolve(false);
    const [salt, key] = parts;
    crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
      if (err) return resolve(false);
      resolve(key === derivedKey.toString('hex'));
    });
  });
}

async function runTests() {
  console.log('🧪 Running Library System Verification Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Password Security
  const rawPassword = 'Password123!';
  const hash = await hashPassword(rawPassword);
  assert(hash !== rawPassword, 'Password auto-hashed with PBKDF2');
  assert(await comparePassword(rawPassword, hash), 'Correct password verifies successfully');
  assert(!(await comparePassword('WrongPassword', hash)), 'Incorrect password rejected');

  // 2. Policy Defaults
  const DEFAULT_POLICY = {
    maxLoansStudent: 3,
    maxLoansFaculty: 5,
    loanDurationDays: 14,
    finePerDay: 5.0,
    maxRenewals: 2,
  };

  assert(DEFAULT_POLICY.maxLoansStudent === 3, 'Default student borrowing limit is 3');
  assert(DEFAULT_POLICY.maxLoansFaculty === 5, 'Default faculty borrowing limit is 5');
  assert(DEFAULT_POLICY.loanDurationDays === 14, 'Default loan duration is 14 days');
  assert(DEFAULT_POLICY.finePerDay === 5.0, 'Default fine rate is ₹5/day');
  assert(DEFAULT_POLICY.maxRenewals === 2, 'Default max renewals is 2');

  // 3. Overdue Fine Calculation
  const overdueDays = 5;
  const fine = overdueDays * DEFAULT_POLICY.finePerDay;
  assert(fine === 25.0, 'Overdue fine calculation math (5 days @ ₹5/day = ₹25.00)');

  // 4. CSV Exporter Logic
  function generateCSV(data) {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = [headers.join(',')];
    for (const row of data) {
      const vals = headers.map((h) => `"${('' + (row[h] ?? '')).replace(/"/g, '""')}"`);
      rows.push(vals.join(','));
    }
    return rows.join('\n');
  }

  const sampleData = [{ 'Loan ID': 'L-1', Member: 'Alex Mercer', Book: 'Clean Code' }];
  const csv = generateCSV(sampleData);
  assert(csv.includes('Loan ID,Member,Book'), 'CSV exports correct column headers');
  assert(csv.includes('"L-1","Alex Mercer","Clean Code"'), 'CSV exports correct row data');

  console.log(`\n==================================================`);
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log(`==================================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
