'use strict';

import moment from 'moment';

import Extractor from '../src/js/lib/extractor';
import { headerWithRoot, headerWithoutRoot } from './fixtures/postHeaders';
jest.unmock('../src/js/lib/extractor.js');

describe('Extractor', () => {
  describe('.currentPostInfo', () => {
    describe('when target post has category before yyyy/mm/dd', () => {
      beforeEach(() => {
        document.body.innerHTML = headerWithRoot;
      });

      it('should return info', () => {
        const date = new moment('2017/12/11', 'YYYY/MM/DD');
        expect(Extractor.currentPostInfo()).toEqual({
          date: date,
          name: 'hyoshihara04',
          root: 'daily-report',
          teamName: 'bomberowl-test',
        });
      });
    });

    describe('when target post has no category before yyyy/mm/dd', () => {
      beforeEach(() => {
        document.body.innerHTML = headerWithoutRoot;
      });

      it('should return info', () => {
        const date = new moment('2018/02/16', 'YYYY/MM/DD');
        expect(Extractor.currentPostInfo()).toEqual({
          date: date,
          name: 'hyoshihara04',
          root: '',
          teamName: 'bomberowl-test',
        });
      });
    });
  });
});
