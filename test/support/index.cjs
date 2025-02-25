const expect = require('expect');
const path = require('path');
const sinon = require('sinon');
const { existsSync } = require('fs');

const { GENERATOR_JHIPSTER } = require('../../generators/generator-constants');
const { skipPrettierHelpers: helpers } = require('../utils/utils');
const {
  PRIORITY_NAMES,
  BASE_ENTITY_PRIORITY_NAMES,
  compat: {
    CONFIGURING_EACH_ENTITY_PRIORITY,
    PREPARING_EACH_ENTITY_PRIORITY,
    PREPARING_EACH_ENTITY_FIELD_PRIORITY,
    PREPARING_EACH_ENTITY_RELATIONSHIP_PRIORITY,
  },
} = require('../../lib/constants/priorities.cjs');

const testOptions = data => {
  const { generatorPath, customOptions, contextBuilder = () => helpers.create(generatorPath) } = data;
  let runResult;
  before(async () => {
    runResult = await contextBuilder()
      .withOptions({ ...customOptions })
      .run();
  });
  it('should write options to .yo-rc.json', () => {
    runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: customOptions });
  });
};

const basicTests = data => {
  const {
    generatorPath,
    customPrompts,
    requiredConfig,
    defaultConfig,
    templateContext = 'application',
    contextBuilder = () => helpers.create(generatorPath),
  } = data;
  const getContext = generator => {
    return templateContext ? generator[templateContext] : generator;
  };
  describe('with default options', () => {
    let runResult;
    before(async () => {
      runResult = await contextBuilder().withOptions({ skipPrompts: true, configure: true }).run();
    });
    it('should write default config to .yo-rc.json', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: requiredConfig });
    });
    it('should load default config into the context', () => {
      expect(getContext(runResult.generator)).toEqual(expect.objectContaining(defaultConfig));
    });
  });
  describe('with defaults option', () => {
    let runResult;
    before(async () => {
      runResult = await contextBuilder().withOptions({ defaults: true, configure: true }).run();
    });
    it('should write default config to .yo-rc.json', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: requiredConfig });
    });
    it('should load default config into the context', () => {
      expect(getContext(runResult.generator)).toEqual(expect.objectContaining(requiredConfig));
    });
  });
  describe('with configure option', () => {
    let runResult;
    before(async () => {
      runResult = await contextBuilder().withOptions({ configure: true }).run();
    });
    it('should write .yo-rc.json only', () => {
      expect(runResult.getStateSnapshot()).toEqual({
        '.yo-rc.json': {
          stateCleared: 'modified',
        },
      });
    });
  });
  describe('with custom prompt values', () => {
    let runResult;
    describe('and default options', () => {
      before(async () => {
        runResult = await contextBuilder().withOptions({ configure: true }).withPrompts(customPrompts).run();
      });
      it('should show prompts and write prompt values to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: customPrompts });
      });
      it('should load default config with prompt values into the context', () => {
        expect(getContext(runResult.generator)).toEqual(expect.objectContaining({ ...defaultConfig, ...customPrompts }));
      });
    });
    describe('and defaults option', () => {
      before(async () => {
        runResult = await contextBuilder().withOptions({ defaults: true }).withPrompts(customPrompts).run();
      });
      it('should not show prompts and write default config to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: requiredConfig });
      });
      it('should load default config into the context', () => {
        expect(getContext(runResult.generator)).toEqual(expect.objectContaining({ ...defaultConfig, ...requiredConfig }));
      });
    });
    describe('and skipPrompts option', () => {
      let runResult;
      before(async () => {
        runResult = await contextBuilder().withOptions({ skipPrompts: true, configure: true }).withPrompts(customPrompts).run();
      });
      it('should not show prompts and write required config to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: requiredConfig });
      });
      it('should load default config and required config into the context', () => {
        expect(getContext(runResult.generator)).toEqual(expect.objectContaining({ ...defaultConfig, ...requiredConfig }));
      });
    });
    describe('and existing config', () => {
      let runResult;
      const existing = { baseName: 'existing' };
      before(async () => {
        runResult = await contextBuilder().withOptions({ localConfig: existing, configure: true }).withPrompts(customPrompts).run();
      });
      it('should not show prompts and write required config to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: { ...requiredConfig, ...existing } });
      });
      it('should load default config and required config into the context', () => {
        expect(getContext(runResult.generator)).toEqual(expect.objectContaining({ ...defaultConfig, ...requiredConfig, ...existing }));
      });
    });
    describe('and askAnswered option on an existing project', () => {
      let runResult;
      before(async () => {
        runResult = await contextBuilder()
          .withOptions({ askAnswered: true, configure: true, localConfig: { baseName: 'existing' } })
          .withPrompts(customPrompts)
          .run();
      });
      it('should show prompts and write prompt values to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: customPrompts });
      });
      it('should load default config and prompt values into the context', () => {
        expect(getContext(runResult.generator)).toEqual(expect.objectContaining({ ...defaultConfig, ...customPrompts }));
      });
    });
    describe('and add option on an existing project', () => {
      let runResult;
      const existingConfig = { baseName: 'existing' };
      before(async () => {
        runResult = await contextBuilder()
          .withOptions({ add: true, configure: true, localConfig: existingConfig })
          .withPrompts(customPrompts)
          .run();
      });
      it('should show prompts and write prompt values to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: { ...customPrompts, ...existingConfig } });
      });
      it('should load default config and prompt values into the context', () => {
        expect(getContext(runResult.generator)).toEqual(expect.objectContaining({ ...defaultConfig, ...customPrompts, ...existingConfig }));
      });
    });
  });
};

const testBlueprintSupport = (generatorName, options = {}) => {
  if (typeof options === 'boolean') {
    options = { skipSbsBlueprint: options };
  }
  const { skipSbsBlueprint = false, entity = false } = options;

  let generatorPath = path.join(__dirname, `../../generators/${generatorName}/index.cjs`);
  if (!existsSync(generatorPath)) {
    generatorPath = path.join(__dirname, `../../generators/${generatorName}/index.js`);
  }
  if (!existsSync(generatorPath)) {
    generatorPath = path.join(__dirname, `../../generators/${generatorName}/index.mjs`);
  }
  const addSpies = generator => {
    const { taskPrefix = '' } = generator.features;
    const apiPrefix = taskPrefix ? '' : '_';
    const prioritiesSpy = sinon.spy();
    const prioritiesTasks = [];
    let prioritiesCount = 0;
    [...PRIORITY_NAMES, ...(entity ? BASE_ENTITY_PRIORITY_NAMES : [])].forEach(priority => {
      let callback;
      if (Object.getOwnPropertyDescriptor(Object.getPrototypeOf(generator), `${taskPrefix}${priority}`)) {
        prioritiesCount++;
        callback = prioritiesSpy;
      } else {
        callback = () => {
          throw new Error(`${apiPrefix}${priority} should not be called`);
        };
      }
      const property = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(generator), `${apiPrefix}${priority}`);
      if (property) {
        const task = sinon.spy();
        prioritiesTasks[priority] = task;
        if (property.value && typeof property.value === 'function') {
          generator[`${apiPrefix}${priority}`] = () => {
            callback();
            return { task };
          };
        } else if (property.get) {
          Object.defineProperty(generator, `${apiPrefix}${priority}`, {
            get() {
              callback();
              return { task };
            },
            enumerable: true,
            configurable: true,
          });
        }
      }
    });
    return { prioritiesSpy, prioritiesCount, prioritiesTasks };
  };
  describe('with blueprint', () => {
    let result;
    let spy;
    before(async () => {
      result = await helpers
        .run(generatorPath)
        .withMockedGenerators([`jhipster-foo:${generatorName}`])
        .withOptions({ blueprint: 'foo', skipChecks: true })
        .on('ready', generator => {
          spy = addSpies(generator);
        });
    });
    it('should compose with blueprints', () => {
      expect(result.mockedGenerators[`jhipster-foo:${generatorName}`].callCount).toBe(1);
    });
    it('should not call any priority', () => {
      expect(spy.prioritiesSpy.callCount).toBe(0);
    });
  });
  describe('with sbs blueprint', () => {
    let result;
    let spy;
    before(async function () {
      if (skipSbsBlueprint) {
        this.skip();
      }
      let options = { blueprint: 'foo-sbs', skipChecks: true };
      if (entity) {
        options = {
          ...options,
          applicationWithEntities: {
            entities: [
              {
                name: 'One',
                fields: [{ fieldName: 'id', fieldType: 'Long' }],
                relationships: [{ relationshipName: 'relationship', otherEntityName: 'Two', relationshipType: 'many-to-one' }],
              },
              {
                name: 'Two',
                fields: [
                  { fieldName: 'id', fieldType: 'Long' },
                  { fieldName: 'name', fieldType: 'String' },
                ],
                relationships: [
                  { relationshipName: 'relationship1', otherEntityName: 'One', relationshipType: 'many-to-one' },
                  { relationshipName: 'relationship2', otherEntityName: 'Two', relationshipType: 'many-to-one' },
                ],
              },
            ],
          },
        };
      }
      const context = helpers
        .run(generatorPath)
        .withMockedGenerators([`jhipster-foo-sbs:${generatorName}`])
        .withOptions(options)
        .on('ready', generator => {
          spy = addSpies(generator);
        });

      // simulate a sbs blueprint
      Object.defineProperty(context.mockedGenerators[`jhipster-foo-sbs:${generatorName}`].prototype, 'sbsBlueprint', {
        get() {
          return true;
        },
        enumerable: true,
        configurable: true,
      });

      result = await context;
    });
    it('should compose with blueprints', () => {
      expect(result.mockedGenerators[`jhipster-foo-sbs:${generatorName}`].callCount).toBe(1);
    });
    it('should call every priority', () => {
      expect(spy.prioritiesSpy.callCount).toBe(spy.prioritiesCount);
    });
    PRIORITY_NAMES.forEach(priority => {
      it(`should call ${priority} tasks if implemented`, function () {
        if (!spy.prioritiesTasks[priority]) {
          this.skip();
          return;
        }
        expect(spy.prioritiesTasks[priority].callCount).toBe(1);
      });
    });
    if (entity) {
      it(`should call ${CONFIGURING_EACH_ENTITY_PRIORITY} tasks twice`, function () {
        expect(spy.prioritiesTasks[CONFIGURING_EACH_ENTITY_PRIORITY].callCount).toBe(2);
      });
      it(`should call ${PREPARING_EACH_ENTITY_PRIORITY} tasks twice`, function () {
        expect(spy.prioritiesTasks[PREPARING_EACH_ENTITY_PRIORITY].callCount).toBe(2);
      });
      it(`should call ${PREPARING_EACH_ENTITY_FIELD_PRIORITY} tasks 3 times`, function () {
        expect(spy.prioritiesTasks[PREPARING_EACH_ENTITY_FIELD_PRIORITY].callCount).toBe(3);
      });
      it(`should call ${PREPARING_EACH_ENTITY_RELATIONSHIP_PRIORITY} tasks 3 times`, function () {
        expect(spy.prioritiesTasks[PREPARING_EACH_ENTITY_RELATIONSHIP_PRIORITY].callCount).toBe(3);
      });
    }
  });
};

module.exports = {
  basicTests,
  testBlueprintSupport,
  testOptions,
};
