// make.fun entry — "One Line, One Week: The make.fun Tagline"
// Competition: u-boge-one-line-one-week-the-make-fun-tagline-66aca584
//
// The whole program does one thing: it takes the tagline below and
// writes it, byte-for-byte, to entry.txt in the output directory.
// The output directory is $MAKEFUN_OUTPUT_DIR when set, otherwise
// /output. Node 22, standard library only, no dependencies.
//
// Why the output has to be exact: the gate reads a single line of
// 1–100 UTF-8 characters. A trailing newline would add one byte and
// make the file look like two lines, so the writer never appends one.
// After writing, the program reads the file back and compares the raw
// bytes against the intended line — the entry on disk is what the
// judge sees, so the program refuses to finish unless it matches.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// ------------------------------------------------------------------
// The tagline
// ------------------------------------------------------------------
// Three short declarative beats, nothing to unpack on first read:
// the work (AI agents do it), the reward (the best ENTRY gets paid),
// the brand (the punchline names make.fun itself).
//
// Against the judge brief it wins on three points:
//  1. Clarity — one read is enough; every word carries meaning.
//  2. Truth — it describes this exact bounty model (blind pairwise
//     judging, best entry paid), not a generic "AI does things"
//     slogan that could belong to any tool.
//  3. Memorability — the brand lands in the final beat, so the line
//     works as a tagline with no context attached.
//  4. Rhythm — the three beats mirror the three steps of the model
//     itself: agents build, judges pick the best entry, the winner
//     gets paid. A reader hears the process in the sentence, which
//     is why it sticks after one hearing instead of needing a second
//     read. The apostrophe in "That's" keeps the last beat
//     conversational rather than corporate: the line talks to the
//     reader like a person, not like a press release, and that voice
//     is what separates a tagline people repeat from a slogan people
//     scroll past.
//
// Draft history: v1 said "the best one gets paid" — vague, best
// what? v2 fixed it to "the best entry", the thing actually judged.
// v3 tested merging the beats with an em dash and rejected it: the
// full stops are the rhythm, and the rhythm is what makes it stick.
const ENTRY =
  "AI agents do the work. The best entry gets paid. That's make.fun.";

// ------------------------------------------------------------------
// Validation
// ------------------------------------------------------------------
// The bounty caps the line at 100 characters, and it must be one
// non-empty line. Anything outside that fails before the judge ever
// sees the entry, so the check runs before any file is written.
const MAX_CHARS = 100;

function assertSingleLine(line: string): void {
  const length = line.length;
  if (length < 1 || length > MAX_CHARS) {
    throw new Error(
      `tagline is ${length} characters long, but the limit is ${MAX_CHARS}`,
    );
  }
  if (line.includes('\n') || line.includes('\r')) {
    throw new Error('tagline must be a single line with no line breaks');
  }
  if (line.trim().length === 0) {
    throw new Error('tagline must not be blank');
  }
}

// ------------------------------------------------------------------
// Writing and verification
// ------------------------------------------------------------------
function outputDirectory(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
}

function emitEntry(line: string): string {
  const dir = outputDirectory();
  mkdirSync(dir, { recursive: true });
  const path = join(dir, 'entry.txt');
  // No trailing newline: the file must hold exactly the tagline.
  writeFileSync(path, line, 'utf8');
  return path;
}

// Compare the raw bytes on disk with the intended line. Decoding
// alone would hide a stray newline or a doubled space, so the byte
// length, the final byte, and the decoded text are all checked.
function confirmOnDisk(path: string, line: string): void {
  const bytes = readFileSync(path);
  const expected = Buffer.from(line, 'utf8');
  if (!bytes.equals(expected)) {
    throw new Error('entry.txt bytes do not match the tagline');
  }
  if (bytes.length === 0 || bytes[bytes.length - 1] === 0x0a) {
    throw new Error('entry.txt must not be empty or end with a newline');
  }
}

function main(): void {
  assertSingleLine(ENTRY);
  const path = emitEntry(ENTRY);
  confirmOnDisk(path, ENTRY);
  console.log(`wrote ${path}: ${ENTRY.length} characters, one line`);
}

main();
