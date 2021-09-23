import { join } from 'path';
import { getConnection } from 'typeorm';
const rm = require('fs').promises;

global.beforeEach(async () => {
  try {
    await rm.rm(join(__dirname, '..', 'test.sqlite'));
  } catch (err) {}
});

global.afterEach(async () => {
  const connection = getConnection();
  await connection.close();
});
