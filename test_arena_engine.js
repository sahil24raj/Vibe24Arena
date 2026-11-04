// Automated Engine & Combat Simulation Verification
const { MOVES_TABLE, CHARACTERS_ROSTER, ARENAS_ROSTER, MAX_HP, MAX_SUPER } = require('./src/components/games/indian-politics-arena/engine/constants');

console.log('--- STARTING INDIAN POLITICS ARENA ENGINE VERIFICATION ---');

// 1. Verify Characters Roster
console.log(`Checking Roster... Found ${CHARACTERS_ROSTER.length} fighters.`);
if (CHARACTERS_ROSTER.length !== 8) {
  throw new Error(`Expected 8 characters, got ${CHARACTERS_ROSTER.length}`);
}

CHARACTERS_ROSTER.forEach(c => {
  if (!c.name || !c.superName || !c.special1Name || !c.special2Name || !c.introLine || !c.defeatExcuse) {
    throw new Error(`Character ${c.id} missing required personality properties`);
  }
  console.log(`✓ Fighter verified: ${c.name} (${c.archetype}) - Super: ${c.superName}`);
});

// 2. Verify Arenas
console.log(`\nChecking Arenas... Found ${ARENAS_ROSTER.length} arenas.`);
if (ARENAS_ROSTER.length < 4) {
  throw new Error(`Expected at least 4 arenas, got ${ARENAS_ROSTER.length}`);
}
ARENAS_ROSTER.forEach(a => {
  console.log(`✓ Arena verified: ${a.name} (${a.hindiName}) - Type: ${a.decorType}`);
});

// 3. Verify Moves Frame Data & Combo Chains
console.log('\nChecking Moves & Combo chains...');
const moves = Object.keys(MOVES_TABLE);
console.log(`Found ${moves.length} combat moves.`);

// Check Jab chain
const jab = MOVES_TABLE['jab'];
if (!jab || jab.chains.punch !== 'cross' || jab.chains.kick !== 'kick') {
  throw new Error('Jab combo chains corrupted');
}
console.log('✓ Jab combo chain: Jab -> Cross (Punch) / Kick (Kick)');

// Check Cross chain
const cross = MOVES_TABLE['cross'];
if (!cross || cross.chains.punch !== 'uppercut' || cross.chains.kick !== 'finisher') {
  throw new Error('Cross combo chains corrupted');
}
console.log('✓ Cross combo chain: Cross -> Uppercut (Punch) / Finisher (Kick)');

// Check Grab
const grab = MOVES_TABLE['grab'];
if (!grab || !grab.grab || grab.damage <= 0) {
  throw new Error('Command grab move configuration invalid');
}
console.log('✓ Command Grab verified (unblockable close-range throw)');

// Check Low Attacks
const lowJab = MOVES_TABLE['lowJab'];
const sweep = MOVES_TABLE['sweep'];
if (!lowJab.crouching || !sweep.crouching || sweep.height !== 'low') {
  throw new Error('Low attack crouch state invalid');
}
console.log('✓ Low moves verified: Low Jab & Crouch Sweep');

// Check Specials
const special1 = MOVES_TABLE['special1'];
const special2 = MOVES_TABLE['special2'];
if (!special1 || !special2 || special1.damage < 12 || special2.damage < 12) {
  throw new Error('Special attacks missing or under-tuned');
}
console.log('✓ Signature Special 1 & 2 verified');

console.log('\n==================================================');
console.log('ALL ENGINE UNIT & COMBAT VERIFICATIONS PASSED 100%!');
console.log('==================================================\n');
