/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-new, no-unused-expressions */
const { expect } = require('chai');
const { formatDateForLiquibase, formatComment, dateFormatForLiquibase } = require('../../../lib/utils/format_utils');

describe('FormatUtils', () => {
  describe('formatComment', () => {
    context('when the comment is in the one-line form', () => {
      const oneLineComment1 = ' comment ';
      const oneLineComment2 = 'comment';
      const oneLineComment3 = ' * a one line comment. ';
      const oneLineComment4 = ' multi word\tcomment ';
      const oneLineComment5 = 'multi word\tcomment';
      const expectedResult1 = 'comment';
      const expectedResult2 = 'a one line comment.';
      const expectedResult3 = 'multi word\tcomment';

      context(buildTestTitle(oneLineComment1), () => {
        it(`should return ${buildTestTitle(expectedResult1)}`, () => {
          expect(formatComment(oneLineComment1)).to.equal(expectedResult1);
        });
      });
      context(buildTestTitle(oneLineComment2), () => {
        it(`should return ${buildTestTitle(expectedResult1)}`, () => {
          expect(formatComment(oneLineComment2)).to.equal(expectedResult1);
        });
      });
      context(buildTestTitle(oneLineComment3), () => {
        it(`should return ${buildTestTitle(expectedResult2)}`, () => {
          expect(formatComment(oneLineComment3)).to.equal(expectedResult2);
        });
      });
      context(buildTestTitle(oneLineComment4), () => {
        it(`should return ${buildTestTitle(expectedResult3)}`, () => {
          expect(formatComment(oneLineComment4)).to.equal(expectedResult3);
        });
      });
      context(buildTestTitle(oneLineComment5), () => {
        it(`should return ${buildTestTitle(expectedResult3)}`, () => {
          expect(formatComment(oneLineComment5)).to.equal(expectedResult3);
        });
      });
    });
    context('when the comment is in the multi-line form', () => {
      const multiLineComment1 = '\n* <p>first line of comment</p><br/>\n*<p>second line</p>\n';
      const multiLineComment2 = '*** <p>first line of comment</p><br/>\n* *<p>second line</p>\n\n';
      const multiLineComment3 = '\n * abcde\n * fghij\n * nothing\n';
      const expectedResult1 = '<p>first line of comment</p><br/>\\n<p>second line</p>';
      const expectedResult2 = '<p>first line of comment</p><br/>\\n*<p>second line</p>';
      const expectedResult3 = 'abcde\\nfghij\\nnothing';

      context(buildTestTitle(multiLineComment1), () => {
        it(`should return ${buildTestTitle(expectedResult1)}`, () => {
          expect(formatComment(multiLineComment1)).to.equal(expectedResult1);
        });
      });
      context(buildTestTitle(multiLineComment2), () => {
        it(`should return ${buildTestTitle(expectedResult2)}`, () => {
          expect(formatComment(multiLineComment2)).to.equal(expectedResult2);
        });
      });
      context(buildTestTitle(multiLineComment3), () => {
        it(`should return ${buildTestTitle(expectedResult3)}`, () => {
          expect(formatComment(multiLineComment3)).to.equal(expectedResult3);
        });
      });
    });
  });
  describe('formatDateForLiquibase', () => {
    context('when passing both arguments', () => {
      let result;

      before(() => {
        result = formatDateForLiquibase({ date: new Date(Date.UTC(0, 0, 0, 0, 0, 0)), increment: 1 });
      });

      it('should use the increment with the passed date', () => {
        expect(result).to.equal('18991231000100');
      });
    });
    context('when not passing the date', () => {
      it('should not fail', () => {
        expect(formatDateForLiquibase().length).to.equal(14);
      });
    });
    context('when not passing the increment', () => {
      let result;

      before(() => {
        result = formatDateForLiquibase({ date: new Date(Date.UTC(0, 0, 0, 0, 0, 0)) });
      });

      it('should format the current time for liquibase with no increment', () => {
        expect(result).to.equal('18991231000000');
      });
    });
  });
  describe('dateFormatForLiquibase', () => {
    context('when passing both arguments', () => {
      let result;

      before(() => {
        result = dateFormatForLiquibase({ date: new Date(Date.UTC(0, 0, 0, 0, 0, 0)), increment: 1 });
      });

      it('should use the increment with the passed date', () => {
        expect(result).to.equal('18991231000100');
      });
    });
    context('when not passing the date', () => {
      it('should not fail', () => {
        expect(dateFormatForLiquibase().length).to.equal(14);
      });
    });
    context('when not passing the increment', () => {
      let result;

      before(() => {
        result = dateFormatForLiquibase({ date: new Date(Date.UTC(0, 0, 0, 0, 0, 0)) });
      });

      it('should format the current time for liquibase with no increment', () => {
        expect(result).to.equal('18991231000000');
      });
    });
  });
});

function buildTestTitle(comment) {
  return `'${comment}'`;
}
