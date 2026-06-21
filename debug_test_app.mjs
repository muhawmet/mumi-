import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = process.cwd();

// Load the exact same harness from app.test.mjs
const appTestSrc = readFileSync('test/app.test.mjs', 'utf8');

// We'll just run node --test with a console.log injected!
