import React from 'react';
import thunk from 'redux-thunk';
import { spy, stub, match } from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { prepareStore } from '../../../../test/utils/applicationInit';
import * as accountAPI from '../../../../src/utils/api/account';
import * as delegateAPI from '../../../../src/utils/api/delegate';
import peersReducer from '../../../store/reducers/peers';
import accountReducer from '../../../store/reducers/account';
import transactionReducer from '../../../store/reducers/transaction';
import transactionsReducer from '../../../store/reducers/transactions';
import searchReducer from '../../../store/reducers/search';
import loadingReducer from '../../../store/reducers/loading';
import { activePeerSet } from '../../../../src/actions/peers';
import networks from './../../../../src/constants/networks';
import getNetwork from './../../../../src/utils/getNetwork';

import ExplorerTransactions from './index';
import i18n from '../../../i18n';
import accounts from '../../../../test/constants/accounts';
import txFilters from '../../../constants/transactionFilters';

describe('ExplorerTransactions Component', () => {
  let wrapper;
  let props;
  let accountStub;
  let delegateStub;
  let transactionsActionsStub;
  let delegateVotesStub;
  let delegateVotersStub;

  const store = prepareStore({
    peers: peersReducer,
    account: accountReducer,
    transaction: transactionReducer,
    transactions: transactionsReducer,
    search: searchReducer,
    loading: loadingReducer,
  }, [thunk]);

  beforeEach(() => {
    transactionsActionsStub = stub(accountAPI, 'transactions');
    accountStub = stub(accountAPI, 'getAccount');
    delegateStub = stub(delegateAPI, 'getDelegate');
    delegateVotesStub = stub(delegateAPI, 'getVotes');
    delegateVotersStub = stub(delegateAPI, 'getVoters');

    delegateStub.returnsPromise().resolves({ delegate: { ...accounts['delegate candidate'], isDelegate: true } });
    accountStub.returnsPromise().resolves({ ...accounts.genesis });
    delegateVotesStub.returnsPromise().resolves({ delegates: [accounts['delegate candidate']] });
    delegateVotersStub.returnsPromise().resolves({ accounts: [accounts['empty account']] });

    props = {
      match: { params: { address: accounts.genesis.address } },
      address: accounts.genesis.address,
      activeFilter: txFilters.all,
      history: { push: spy(), location: { search: ' ' } },
      t: key => key,
    };

    transactionsActionsStub.withArgs({
      activePeer: match.any,
      address: accounts.genesis.address,
      limit: 25,
      filter: undefined,
    }).returnsPromise().resolves({ transactions: [{ id: 'Some ID' }], count: 1000 });

    transactionsActionsStub.withArgs({
      activePeer: match.any,
      address: accounts.genesis.address,
      limit: 25,
      filter: txFilters.all,
    }).returnsPromise().resolves({ transactions: [{ id: 'Some ID' }], count: 1000 });

    store.dispatch(activePeerSet({ network: getNetwork(networks.mainnet.code) }));

    wrapper = mount(<Provider store={store}>
      <Router>
        <ExplorerTransactions store={store} {...props} i18n={i18n}/>
      </Router>
    </Provider>);
    wrapper.update();
  });

  afterEach(() => {
    accountStub.restore();
    delegateStub.restore();
    transactionsActionsStub.restore();
    delegateVotesStub.restore();
    delegateVotersStub.restore();
  });

  it('renders ExplorerTransactions Component and loads searched account transactions', () => {
    const renderedExplorerTransactions = wrapper.find(ExplorerTransactions);
    expect(renderedExplorerTransactions).to.be.present();
    expect(wrapper).to.have.exactly(1).descendants('.transactions-row');
  });

  it('allows to view details of a transaction and cachees last searched account transactions', () => {
    /* eslint-disable no-unused-expressions */
    expect(wrapper).to.have.exactly(1).descendants('.transactions-row');
    wrapper.find('.transactions-row').simulate('click');
    wrapper.update();
    const transactionDetailsBackBtn = wrapper.find('.transaction-details-back-button').first();
    expect(transactionDetailsBackBtn).to.be.present();
    transactionDetailsBackBtn.simulate('click');
    expect(wrapper).to.have.exactly(1).descendants('.transactions-row');
    /* eslint-enable no-unused-expressions */
  });
});
