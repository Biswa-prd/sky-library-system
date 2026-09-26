import { hashPassword, comparePassword } from '../src/lib/auth.ts';
import { DEFAULT_POLICY } from '../src/lib/policy.ts';
import { generateCSV } from '../src/lib/utils.ts';

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

  // 1. Password Hashing & Verification
  const hash = await hashPassword('Password123!');
  assert(hash !== 'Password123!', 'Password is auto-hashed with bcrypt');
  assert(await comparePassword('Password123!', hash), 'Correct password verifies successfully');
  assert(!(await comparePassword('Wrong', hash)), 'Incorrect password rejected');

  // 2. Policy Defaults
  assert(DEFAULT_POLICY.maxLoansStudent === 3, 'Default student borrowing limit is 3');
  assert(DEFAULT_POLICY.maxLoansFaculty === 5, 'Default faculty borrowing limit is 5');
  assert(DEFAULT_POLICY.loanDurationDays === 14, 'Default loan duration is 14 days');
  assert(DEFAULT_POLICY.finePerDay === 5.0, 'Default fine rate is ₹5/day');
  assert(DEFAULT_POLICY.maxRenewals === 2, 'Default max renewals is 2');

  // 3. Overdue Fine Calculation
  const overdueDays = 5;
  const fine = overdueDays * DEFAULT_POLICY.finePerDay;
  assert(fine === 25.0, 'Overdue fine calculation math (5 days @ ₹5/day = ₹25.00)');

  // 4. CSV Exporter
  const sampleData = [{ 'Loan ID': 'L-1', Member: 'Alex Mercer', Book: 'Clean Code' }];
  const csv = generateCSV(sampleData);
  assert(csv.includes('"Loan ID","Member","Book"'), 'CSV exports correct column headers');
  assert(csv.includes('"L-1","Alex Mercer","Clean Code"'), 'CSV exports correct row data');

  console.log(`\n==================================================`);
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log(`==================================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
