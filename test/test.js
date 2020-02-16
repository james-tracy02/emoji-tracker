
const assert = require('assert');
const Parse = require('../src/parse.js');

describe('Parse', () => {
  describe('command()', () => {
    it('should parse none when no template', () => {
      assert.deepEqual(Parse.command('invalid_command arg1 arg2'), { type: 'none' });
    });
    it('should parse even when too many tokens', () => {
      assert.deepEqual(Parse.command('view server page 5 local extra args'),
      { type: 'view',
        target: 'server',
        select: 'page',
        index: '5',
        scope: 'local' });
    });
    it('should parse with min required args and fill defaults', () => {
      assert.deepEqual(Parse.command('view emoji'),
      { type: 'view', target: 'emoji', select: 'page', index: '1', scope: 'local'});
    });
    it('should not parse when missing required args', () => {
      assert.deepEqual(Parse.command('info'),
      { type: 'invalid',
        command: {
          type: 'info',
        }
      });
    });
    it('should parse when all optional args given', () => {
      assert.deepEqual(Parse.command('view my top 3 global'),
      { type: 'view',
        target: 'my',
        select: 'top',
        index: '3',
        scope: 'global' });
    });
    it('should parse commands with no args', () => {
      assert.deepEqual(Parse.command('help'), { type: 'help' });
    });
    it('should parse when only some args given', () => {
      assert.deepEqual(Parse.command('view my top'),
        { type: 'view',
          target: 'my',
          select: 'top',
          index: '1',
          scope: 'local' });
    });
  });
});
