import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { stub } from 'sinon';
import PassphraseCreation from './index';
import CreateFirst from './../passphrase/create/create';
import * as checkDevice from '../../utils/checkDevice';

describe('Passphrase Creation', () => {
  let wrapper;
  const events = {};
  const props = {
    t: key => key,
    prevStep: () => {},
    nextStep: () => {},
  };

  describe('Using laptop', () => {
    beforeEach(() => {
      window.addEventListener = (name, event) => {
        events[name] = event;
      };

      stub(checkDevice, 'default').returns(false);
      wrapper = mount(<PassphraseCreation {...props} >
        <CreateFirst t={() => {}}/>
      </PassphraseCreation>);
    });

    afterEach(() => {
      checkDevice.default.restore();
    });

    it('gets triggered and generates the seed on mouse move', () => {
      events.mousemove({ pageX: 5, pageY: 5 });

      expect(wrapper.instance().lastCaptured.x).to.equal(0);
      expect(wrapper.instance().lastCaptured.y).to.equal(0);

      events.mousemove({ pageX: 1000, pageY: 1000 });

      expect(wrapper.instance().lastCaptured.x).to.equal(1000);
      expect(wrapper.instance().lastCaptured.y).to.equal(1000);
    });

    it('sets the next step once the movement is completed', () => {
      expect(wrapper.state().step).to.equal('generate');

      for (let i = 0; i < 250; i++) {
        events.mousemove({ pageX: 200 * (i % 2), pageY: 200 * (i % 2) });
      }

      expect(wrapper.state().step).to.equal('info');
    });

    it('returns child element with correct properties', () => {
      expect(wrapper.find(CreateFirst)).to.have.length(1);
      expect(wrapper.find(CreateFirst).props().percentage).to.equal(0);
      expect(wrapper.find(CreateFirst).props().hintTitle).to.equal('by moving your mouse.');
      expect(wrapper.find(CreateFirst).props().address).to.equal(null);
      expect(wrapper.find(CreateFirst).props().step).to.equal('generate');
      expect(wrapper.find(CreateFirst).props().passphrase).to.equal(undefined);
    });
  });

  describe('Using mobile device', () => {
    beforeEach(() => {
      window.addEventListener = (name, event) => {
        events[name] = event;
      };
      stub(checkDevice, 'default').returns(true);
    });

    afterEach(() => {
      checkDevice.default.restore();
    });

    it('gets triggered and generates the seed on device tilt', () => {
      wrapper = mount(<PassphraseCreation {...props} ><div></div></PassphraseCreation>);

      const date = new Date();
      const time = new Date(date.setHours(date.getHours() - 1));
      wrapper.instance().lastCaptured.time = time;
      wrapper.instance().addEventListener();

      expect(wrapper.instance().lastCaptured).to.eql({ x: 0, y: 0, time });

      events.devicemotion({ rotationRate: { alpha: 20, beta: 20 } });

      expect(wrapper.instance().lastCaptured.time).to.eql(new Date());
      expect(wrapper.instance().lastCaptured.x).to.equal(200);
      expect(wrapper.instance().lastCaptured.y).to.equal(200);
    });

    it('returns child element with correct properties', () => {
      wrapper = mount(<PassphraseCreation {...props} >
        <CreateFirst t={() => {}}/>
      </PassphraseCreation>);

      expect(wrapper.find(CreateFirst)).to.have.length(1);
      expect(wrapper.find(CreateFirst).props().percentage).to.equal(0);
      expect(wrapper.find(CreateFirst).props().hintTitle).to.equal('by tilting your device.');
      expect(wrapper.find(CreateFirst).props().address).to.equal(null);
      expect(wrapper.find(CreateFirst).props().step).to.equal('generate');
      expect(wrapper.find(CreateFirst).props().passphrase).to.equal(undefined);
    });
  });
});
